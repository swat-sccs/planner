# RateMyProfessors (RMP) Scraper for SCCS Planner

This directory contains the RateMyProfessors scraper that automatically imports professor ratings from RMP into the SCCS Planner database.

## Overview

The scraper runs hourly via a cron job and fetches ratings from RateMyProfessors for Swarthmore College professors. It integrates with the existing rating system and clearly marks RMP-sourced ratings with badges and links back to the original RMP profiles.

## Features

- **Automatic Hourly Scraping**: Runs every hour via cron to keep ratings up-to-date
- **GraphQL API Integration**: Uses RMP's official GraphQL API for reliable data fetching
- **Duplicate Prevention**: Checks for existing RMP ratings before inserting new ones
- **Faculty Matching**: Automatically matches professors from the planner database with RMP profiles
- **Data Mapping**: Maps RMP rating fields to the existing database schema:
  - Overall rating (1-5 scale)
  - Difficulty rating (1-5 scale)
  - Grade received
  - Would take again
  - Tags
  - Review comments
  - Date taken

## Files

- `scraper.py`: Main Python script that performs the scraping
- `requirements.txt`: Python dependencies
- `../Dockerfile.rmp-cron`: Docker container configuration
- `../rmp-crontab_file`: Cron job configuration
- `../rmp-cron-startup.sh`: Container startup script

## How It Works

1. **System User**: Creates a special system user (`rmp-system@sccs.swarthmore.edu`) to own all RMP ratings
2. **Faculty Lookup**: Fetches all faculty members from the database
3. **RMP Search**: For each faculty member, searches RMP for matching profiles
4. **Rating Retrieval**: Fetches up to 100 ratings per professor from RMP
5. **Data Insertion**: Inserts new ratings into the database with `isRMP=true` flag
6. **Deduplication**: Skips ratings that already exist in the database

## Database Schema

New fields added to the `Rating` model:

```prisma
isRMP       Boolean?  @default(false)  // Flag indicating RMP source
rmpProfId   String?                     // RMP professor ID
rmpLink     String?                     // Direct link to RMP profile
rmpDate     DateTime?                   // Original rating date from RMP
tags        String?                     // Comma-separated rating tags
```

## UI Integration

### RMP Badge Component
Displays a yellow "RMP" badge next to ratings sourced from RateMyProfessors with a link to the original profile:

```tsx
import RMPBadge from "components/RMPBadge";

<RMPBadge rating={rating} size="sm" />
```

### Rating Over Time Graph
Shows a time-series graph of ratings with selectable time frames:

```tsx
import RatingOverTimeGraph from "components/RatingOverTimeGraph";

<RatingOverTimeGraph ratings={ratings} />
```

Features:
- Line graph showing overall rating and difficulty over time
- Time frame selector (All Time, Past Year, 6 Months, 3 Months)
- Monthly aggregation of ratings
- Hover tooltips showing detailed information

## Running the Scraper

### Via Docker Compose
```bash
docker-compose up planner-rmp-cron
```

### Manually
```bash
cd rmpscraper
pip install -r requirements.txt
python3 scraper.py
```

### Environment Variables Required
The scraper uses the same environment variables as the main application:
- `HOST`: Database host
- `SQL_USER`: Database username
- `PASS`: Database password
- `DBNAME`: Database name

## Cron Schedule

The scraper runs every hour on the hour:
```cron
0 * * * * root cd /app && python3 /app/scraper.py >> /var/log/rmp-cron.log 2>&1
```

## Logging

Logs are written to `/var/log/rmp-cron.log` inside the container. View logs with:
```bash
docker logs planner-rmp-cron
```

## Rate Limiting

The scraper includes a 1-second delay between professor lookups to avoid overwhelming the RMP API.

## Future Improvements

- Add support for professor photos from RMP
- Implement webhooks for real-time rating updates
- Add admin dashboard for monitoring scrape status
- Support for filtering/hiding RMP ratings in UI
- More detailed error reporting and notifications

## Notes

- Only professors that exist in the planner database are searched on RMP
- RMP ratings cannot be edited by users (they're read-only from the source)
- The scraper only fetches the most recent 100 ratings per professor to manage load
- All RMP ratings are attributed to the system user, not individual users

## Troubleshooting

### Scraper not running
Check the cron logs:
```bash
docker exec planner-rmp-cron tail -f /var/log/rmp-cron.log
```

### Database connection issues
Verify environment variables are correctly set in `.env` file

### No ratings appearing
- Check that professors in the database match names on RMP
- Verify the Swarthmore College school ID is correct (currently: `U2Nob29sLTk5MA==`)
- Look for errors in the scraper logs

## Contributing

When modifying the scraper:
1. Test locally with the manual run command
2. Rebuild the Docker image: `docker-compose build planner-rmp-cron`
3. Restart the container: `docker-compose up -d planner-rmp-cron`

