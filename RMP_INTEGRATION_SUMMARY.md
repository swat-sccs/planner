# RateMyProfessors Integration - Implementation Summary

## Branch: RMP-scraping

This document summarizes the complete implementation of RateMyProfessors (RMP) integration into SCCS Planner.

---

## Overview

This feature adds automatic hourly scraping of professor ratings from RateMyProfessors.com for Swarthmore College, integrates them with the existing rating system, and provides clear visual indicators to distinguish RMP ratings from user-submitted ratings.

---

## What Was Implemented

### 1. Database Schema Updates

**File**: `prisma/schema.prisma`

Added new fields to the `Rating` model:
- `isRMP`: Boolean flag (default: false) to identify RMP-sourced ratings
- `rmpProfId`: RMP professor ID for reference
- `rmpLink`: Direct URL to the professor's RMP profile
- `rmpDate`: Original date the rating was posted on RMP
- `tags`: Comma-separated tags from RMP (e.g., "Tough grader", "Amazing lectures")

**Migration**: `prisma/migrations/20241030000000_add_rmp_fields/migration.sql`

---

### 2. Python Scraper

**Directory**: `rmpscraper/`

**Main Script**: `scraper.py`
- Uses RMP's GraphQL API for reliable data fetching
- Searches for each faculty member in the database on RMP
- Fetches up to 100 ratings per professor
- Maps RMP data to existing database schema
- Creates a system user (`rmp-system@sccs.swarthmore.edu`) to own all RMP ratings
- Prevents duplicates by checking existing RMP ratings before insertion
- Includes rate limiting (1 second between requests) to be respectful of RMP's API

**Key Features**:
- Automatic faculty matching by name
- Course parsing from RMP format (e.g., "CPSC 035" → subject: "CPSC", number: "035")
- Grade conversion and term detection from dates
- Tag extraction and storage
- Comprehensive error handling and logging

**Dependencies**: `requirements.txt`
- requests
- psycopg2-binary (PostgreSQL driver)
- python-dotenv (environment variable management)

---

### 3. Docker & Automation Setup

**Dockerfile**: `Dockerfile.rmp-cron`
- Python 3.11 slim container
- Installs cron for scheduling
- Sets up proper permissions and logging

**Cron Configuration**: `rmp-crontab_file`
```cron
0 * * * * root cd /app && python3 /app/scraper.py >> /var/log/rmp-cron.log 2>&1
```
Runs every hour on the hour.

**Startup Script**: `rmp-cron-startup.sh`
- Applies cron job
- Starts rsyslog for logging
- Runs cron in foreground

**Docker Compose**: Updated `docker-compose.yml`
- Added `planner-rmp-cron` service
- Connected to internal network for database access
- Uses same environment variables as main application

---

### 4. UI Components

#### RMP Badge Component

**File**: `components/RMPBadge.tsx`

A reusable component that displays a yellow "RMP" badge with an external link icon next to any rating sourced from RateMyProfessors. When clicked, it opens the professor's RMP profile in a new tab.

**Features**:
- Only renders when `rating.isRMP` is true
- Configurable size (sm, md, lg)
- Yellow color scheme to distinguish from other badges
- External link icon for clarity
- Hover effects

**Usage**:
```tsx
<RMPBadge rating={rating} size="sm" />
```

#### Rating Over Time Graph Component

**File**: `components/RatingOverTimeGraph.tsx`

A comprehensive visualization component showing how a professor's ratings have changed over time.

**Features**:
- Line chart with two series: Overall Rating and Difficulty
- Time frame selector (All Time, Past Year, 6 Months, 3 Months)
- Monthly aggregation of ratings
- Interactive tooltips showing:
  - Month/Year
  - Average overall rating
  - Average difficulty
  - Number of ratings in that month
- Responsive design using Recharts library
- Handles empty states gracefully

**Data Processing**:
- Groups ratings by month
- Calculates averages for each month
- Filters based on selected time frame
- Uses `rmpDate` for RMP ratings, `createdAt` for user ratings

**Usage**:
```tsx
<RatingOverTimeGraph ratings={ratings} />
```

---

### 5. UI Integration

#### My Ratings Page

**File**: `app/myratings/page.tsx`

**Changes**:
- Imported `RMPBadge` component
- Added RMP badge next to professor names in rating cards
- Badge only appears for RMP-sourced ratings

#### Professor Ratings Page

**File**: `app/profratings/[profuid]/page.tsx`

**Changes**:
- Imported both `RMPBadge` and `RatingOverTimeGraph` components
- Added rating over time graph at the top of the page (below professor name)
- Added RMP badges next to course information in individual rating cards
- Graph provides historical context for all ratings (both RMP and user-submitted)

---

### 6. Dependencies

**File**: `package.json`

Added:
- `recharts: ^2.10.3` - Charting library for the rating over time graph

---

## How It Works

### Data Flow

1. **Hourly Cron Job**
   - Docker container `planner-rmp-cron` runs the scraper every hour
   - Logs are written to `/var/log/rmp-cron.log`

2. **Scraping Process**
   ```
   Fetch Faculty from DB
          ↓
   For Each Faculty:
     → Search RMP by Name
     → If Found:
       → Fetch Ratings (up to 100)
       → For Each Rating:
         → Check if Already Exists
         → If Not:
           → Parse & Map Data
           → Insert into DB (isRMP=true)
   ```

3. **Display in UI**
   ```
   User Views Professor Page
          ↓
   Fetch All Ratings (RMP + User)
          ↓
   Render Graph (Time Series)
          ↓
   Render Individual Cards
     → If rating.isRMP:
       → Show RMP Badge
       → Link to RMP Profile
   ```

---

## Key Design Decisions

### 1. System User Approach
**Why**: RMP ratings don't have individual user ownership
**Solution**: Created a dedicated system user that owns all RMP ratings

### 2. Read-Only RMP Ratings
**Why**: Users shouldn't be able to edit ratings from external sources
**Solution**: RMP ratings are identified by `isRMP=true` and the UI doesn't provide edit functionality for them

### 3. Duplicate Prevention
**Why**: Avoid importing the same rating multiple times on subsequent runs
**Solution**: Check for existing ratings using RMP link before inserting

### 4. Monthly Aggregation in Graph
**Why**: Too many data points make the graph hard to read
**Solution**: Group ratings by month and show average values

### 5. Yellow Badge Color
**Why**: Need clear visual distinction from user ratings
**Solution**: Used warning color (yellow) to indicate external source

### 6. External Link Icon
**Why**: Users need to know they're being taken to another site
**Solution**: Added external link icon to RMP badge

---

## Testing Checklist

Before deploying to production, verify:

- [ ] Database migration runs successfully
- [ ] Python scraper can connect to database
- [ ] Scraper creates system user on first run
- [ ] Scraper finds and imports RMP ratings
- [ ] RMP badges appear on imported ratings
- [ ] RMP badges link to correct professor pages
- [ ] Rating over time graph displays correctly
- [ ] Time frame selector works properly
- [ ] Graph handles edge cases (no ratings, single rating, etc.)
- [ ] Cron job runs successfully on schedule
- [ ] Logs are being written correctly
- [ ] Docker container restarts properly
- [ ] No duplicate ratings are created on subsequent runs

---

## Deployment Steps

1. **Review Changes**
   ```bash
   git diff main RMP-scraping
   ```

2. **Test Locally** (if possible)
   ```bash
   # Start database
   docker-compose up planner-db
   
   # Run scraper manually
   cd rmpscraper
   pip install -r requirements.txt
   python3 scraper.py
   ```

3. **Build Containers**
   ```bash
   docker-compose build planner
   docker-compose build planner-rmp-cron
   ```

4. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

5. **Deploy Services**
   ```bash
   docker-compose up -d
   ```

6. **Monitor Logs**
   ```bash
   docker logs -f planner-rmp-cron
   ```

---

## Maintenance

### Monitoring
- Check cron logs regularly for errors
- Monitor database growth (RMP ratings will increase storage)
- Watch API rate limiting issues

### Updates
- Update RMP school ID if it changes
- Adjust rate limiting if needed
- Add more rating fields as RMP adds features

### Common Issues

**Issue**: Scraper can't connect to database
**Fix**: Verify environment variables in `.env`

**Issue**: No ratings being imported
**Fix**: Check faculty name matching, verify RMP school ID

**Issue**: Duplicate ratings appearing
**Fix**: Check duplicate detection logic in scraper

**Issue**: Graph not displaying
**Fix**: Verify recharts is installed, check for console errors

---

## Future Enhancements

1. **Professor Photo Import**: Fetch and store professor photos from RMP
2. **Real-time Updates**: Implement webhooks instead of hourly scraping
3. **Admin Dashboard**: UI for monitoring scrape status and statistics
4. **Filtering Options**: Allow users to hide/show RMP ratings
5. **More Detailed Analytics**: Additional graphs and statistics
6. **Export Functionality**: Allow exporting combined ratings data
7. **Notification System**: Alert admins of scraping failures
8. **Performance Optimization**: Implement caching for frequently accessed data

---

## File Summary

### New Files Created
1. `rmpscraper/scraper.py` - Main scraper script
2. `rmpscraper/requirements.txt` - Python dependencies
3. `rmpscraper/README.md` - Scraper documentation
4. `Dockerfile.rmp-cron` - Docker container for scraper
5. `rmp-crontab_file` - Cron job configuration
6. `rmp-cron-startup.sh` - Container startup script
7. `components/RMPBadge.tsx` - RMP badge component
8. `components/RatingOverTimeGraph.tsx` - Rating graph component
9. `prisma/migrations/20241030000000_add_rmp_fields/migration.sql` - Database migration

### Modified Files
1. `prisma/schema.prisma` - Added RMP fields to Rating model
2. `docker-compose.yml` - Added RMP scraper service
3. `package.json` - Added recharts dependency
4. `app/myratings/page.tsx` - Integrated RMP badge
5. `app/profratings/[profuid]/page.tsx` - Integrated graph and badge

---

## Success Metrics

After deployment, success can be measured by:
- Number of RMP ratings imported
- User engagement with RMP links
- Increased completeness of professor rating data
- No significant performance degradation
- Zero duplicate ratings created
- Stable hourly scraping without errors

---

## Support & Contact

For issues or questions about this implementation:
1. Check the logs: `docker logs planner-rmp-cron`
2. Review the README: `rmpscraper/README.md`
3. Contact the development team

---

**Implementation Date**: October 30, 2025  
**Branch**: RMP-scraping  
**Status**: Ready for Review & Testing

