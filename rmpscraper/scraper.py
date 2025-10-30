#!/usr/bin/env python3
import os
import sys
import requests
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from dotenv import load_dotenv
import logging
import time

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# RateMyProfessors GraphQL API endpoint
RMP_API_URL = "https://www.ratemyprofessors.com/graphql"

# Swarthmore College School ID on RMP
SWARTHMORE_SCHOOL_ID = "U2Nob29sLTk5MA=="

def get_db_connection():
    """Establish database connection"""
    load_dotenv()
    
    try:
        conn = psycopg2.connect(
            host=os.getenv("HOST"),
            port=5432,
            user=os.getenv("SQL_USER"),
            password=os.getenv("PASS"),
            dbname=os.getenv("DBNAME")
        )
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

def search_professor_on_rmp(professor_name, school_id=SWARTHMORE_SCHOOL_ID):
    """
    Search for a professor on RateMyProfessors
    Returns the professor ID and basic info if found
    """
    query = """
    query NewSearchTeachersQuery($text: String!, $schoolID: ID!) {
        newSearch {
            teachers(query: {text: $text, schoolID: $schoolID}) {
                edges {
                    node {
                        id
                        legacyId
                        firstName
                        lastName
                        avgRating
                        avgDifficulty
                        numRatings
                        wouldTakeAgainPercent
                    }
                }
            }
        }
    }
    """
    
    variables = {
        "text": professor_name,
        "schoolID": school_id
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic dGVzdDp0ZXN0"
    }
    
    try:
        response = requests.post(
            RMP_API_URL,
            json={"query": query, "variables": variables},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            teachers = data.get("data", {}).get("newSearch", {}).get("teachers", {}).get("edges", [])
            
            if teachers:
                # Return the first matching professor
                return teachers[0]["node"]
            else:
                logger.info(f"No RMP profile found for: {professor_name}")
                return None
        else:
            logger.error(f"RMP API returned status {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Error searching for professor {professor_name}: {e}")
        return None

def get_professor_ratings(professor_id, num_ratings=20):
    """
    Get ratings for a specific professor
    """
    query = """
    query TeacherRatingsPageQuery($id: ID!, $count: Int!) {
        node(id: $id) {
            ... on Teacher {
                id
                legacyId
                firstName
                lastName
                ratings(first: $count) {
                    edges {
                        node {
                            id
                            class
                            grade
                            comment
                            date
                            attendanceMandatory
                            wouldTakeAgain
                            difficultyRating
                            helpfulRating
                            clarityRating
                            ratingTags
                        }
                    }
                }
            }
        }
    }
    """
    
    variables = {
        "id": professor_id,
        "count": num_ratings
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic dGVzdDp0ZXN0"
    }
    
    try:
        response = requests.post(
            RMP_API_URL,
            json={"query": query, "variables": variables},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            ratings = data.get("data", {}).get("node", {}).get("ratings", {}).get("edges", [])
            return ratings
        else:
            logger.error(f"Failed to fetch ratings for professor {professor_id}")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching ratings: {e}")
        return []

def parse_course_name(class_name):
    """
    Parse course name like 'CPSC 035' into subject and number
    Returns tuple (subject, number) or (None, None) if parsing fails
    """
    if not class_name:
        return None, None
        
    parts = class_name.strip().split()
    if len(parts) >= 2:
        subject = parts[0].upper()
        number = parts[1]
        return subject, number
    return None, None

def get_system_user_id(conn):
    """
    Get or create a system user for RMP ratings
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if system user exists
    cursor.execute("""
        SELECT id FROM "User" WHERE email = 'rmp-system@sccs.swarthmore.edu'
    """)
    
    result = cursor.fetchone()
    
    if result:
        user_id = result['id']
    else:
        # Create system user
        import uuid
        system_uuid = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO "User" (email, name, uuid)
            VALUES ('rmp-system@sccs.swarthmore.edu', 'RateMyProfessors System', %s)
            RETURNING id
        """, (system_uuid,))
        
        user_id = cursor.fetchone()['id']
        conn.commit()
        logger.info(f"Created system user with ID: {user_id}")
    
    cursor.close()
    return user_id

def check_rating_exists(conn, rmp_rating_id):
    """
    Check if a rating from RMP already exists in the database
    """
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id FROM "Rating" 
        WHERE "isRMP" = true AND "rmpLink" LIKE %s
    """, (f'%{rmp_rating_id}%',))
    
    exists = cursor.fetchone() is not None
    cursor.close()
    return exists

def insert_rmp_rating(conn, rating_data, prof_info, system_user_id):
    """
    Insert an RMP rating into the database
    """
    cursor = conn.cursor()
    
    # Parse rating node
    rating = rating_data["node"]
    
    # Parse course info
    subject, number = parse_course_name(rating.get("class"))
    
    # Convert rating (RMP uses 1-5 scale)
    overall_rating = rating.get("helpfulRating")
    if overall_rating:
        overall_rating = int(round(overall_rating))
    
    difficulty = rating.get("difficultyRating")
    if difficulty:
        difficulty = int(round(difficulty))
    
    # Parse year from date (format: "2023-05-15T00:00:00.000Z")
    year_taken = None
    term_taken = None
    rmp_date = None
    
    if rating.get("date"):
        try:
            date_obj = datetime.fromisoformat(rating["date"].replace('Z', '+00:00'))
            rmp_date = date_obj
            year_taken = date_obj.year
            # Determine term based on month
            month = date_obj.month
            if month >= 8:
                term_taken = "Fall"
            elif month >= 1 and month <= 5:
                term_taken = "Spring"
            else:
                term_taken = "Summer"
        except Exception as e:
            logger.warning(f"Failed to parse date: {rating.get('date')}, {e}")
    
    # Get tags
    tags = rating.get("ratingTags", "")
    if isinstance(tags, list):
        tags = ", ".join(tags)
    
    # Convert would take again to boolean
    take_again = None
    if rating.get("wouldTakeAgain") is not None:
        take_again = bool(rating.get("wouldTakeAgain"))
    
    # Build RMP link
    rmp_legacy_id = prof_info.get("legacyId")
    rmp_link = f"https://www.ratemyprofessors.com/professor/{rmp_legacy_id}"
    
    try:
        cursor.execute("""
            INSERT INTO "Rating" (
                "courseSubject", "courseNumber", "courseName",
                "profDisplayName", "profUid",
                "yearTaken", "termTaken",
                "overallRating", "difficulty", "takeAgain",
                "review", "grade",
                "isRMP", "rmpProfId", "rmpLink", "rmpDate", "tags",
                "userId", "createdAt", "updatedAt"
            )
            VALUES (
                %s, %s, %s,
                %s, %s,
                %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s, %s, %s, %s,
                %s, NOW(), NOW()
            )
        """, (
            subject, number, rating.get("class"),
            f"{prof_info.get('firstName')} {prof_info.get('lastName')}", prof_info.get("profUid"),
            year_taken, term_taken,
            overall_rating, difficulty, take_again,
            rating.get("comment"), rating.get("grade"),
            True, prof_info.get("id"), rmp_link, rmp_date, tags,
            system_user_id
        ))
        
        conn.commit()
        logger.info(f"Inserted RMP rating for {prof_info.get('firstName')} {prof_info.get('lastName')}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to insert rating: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()

def get_faculty_from_db(conn):
    """
    Get all faculty from the database
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT DISTINCT "displayName", "uid" 
        FROM "Faculty"
        ORDER BY "displayName"
    """)
    
    faculty = cursor.fetchall()
    cursor.close()
    return faculty

def scrape_rmp_for_faculty():
    """
    Main scraping function
    """
    start_time = time.time()
    logger.info("Starting RMP scrape...")
    
    conn = get_db_connection()
    system_user_id = get_system_user_id(conn)
    
    faculty_list = get_faculty_from_db(conn)
    logger.info(f"Found {len(faculty_list)} faculty members to check")
    
    total_ratings_added = 0
    faculty_processed = 0
    
    for faculty in faculty_list:
        name = faculty['displayName']
        prof_uid = faculty['uid']
        
        logger.info(f"Searching RMP for: {name}")
        
        # Search for professor on RMP
        prof_info = search_professor_on_rmp(name)
        
        if prof_info:
            logger.info(f"Found RMP profile for {name} (ID: {prof_info['id']})")
            
            # Add profUid to prof_info for later use
            prof_info['profUid'] = prof_uid
            
            # Get ratings for this professor
            num_ratings_to_fetch = int(prof_info.get('numRatings', 20))
            if num_ratings_to_fetch > 100:
                num_ratings_to_fetch = 100  # Limit to 100 ratings per professor
            
            ratings = get_professor_ratings(prof_info['id'], num_ratings_to_fetch)
            logger.info(f"Retrieved {len(ratings)} ratings for {name}")
            
            # Insert ratings into database
            for rating_data in ratings:
                rating_id = rating_data["node"]["id"]
                
                # Check if rating already exists
                if not check_rating_exists(conn, rating_id):
                    if insert_rmp_rating(conn, rating_data, prof_info, system_user_id):
                        total_ratings_added += 1
                else:
                    logger.debug(f"Rating already exists, skipping")
            
            faculty_processed += 1
            
            # Rate limiting - wait a bit between requests
            time.sleep(1)
        else:
            logger.info(f"No RMP profile found for {name}")
    
    conn.close()
    
    elapsed_time = time.time() - start_time
    logger.info(f"Scrape completed in {elapsed_time:.2f} seconds")
    logger.info(f"Processed {faculty_processed} faculty members")
    logger.info(f"Added {total_ratings_added} new ratings")
    
    return {
        "faculty_processed": faculty_processed,
        "ratings_added": total_ratings_added,
        "elapsed_time": elapsed_time
    }

if __name__ == "__main__":
    try:
        result = scrape_rmp_for_faculty()
        print(json.dumps(result, indent=2))
    except Exception as e:
        logger.error(f"Scrape failed: {e}")
        sys.exit(1)

