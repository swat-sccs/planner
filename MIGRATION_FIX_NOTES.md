# RESOLVED: Migration Timing Issue

## Problem
The initial migration `20241030000000_add_rmp_fields` was trying to run BEFORE the `Rating` table was created, causing this error:
```
ERROR: relation "Rating" does not exist
```

## Root Cause
The migration timestamp `20241030000000` was set to October 30, 2024, but the `Rating` table wasn't created until November 9, 2024 (`20241109035411_add_ratings`). Prisma applies migrations in chronological order based on timestamps.

## Solution
1. Renamed the migration directory to `20251030022724_add_rmp_fields` (October 30, 2025)
2. Added `IF NOT EXISTS` clauses to make the migration idempotent:
   ```sql
   ALTER TABLE "Rating" 
   ADD COLUMN IF NOT EXISTS "isRMP" BOOLEAN DEFAULT false,
   ADD COLUMN IF NOT EXISTS "rmpProfId" TEXT,
   ADD COLUMN IF NOT EXISTS "rmpLink" TEXT,
   ADD COLUMN IF NOT EXISTS "rmpDate" TIMESTAMP(3),
   ADD COLUMN IF NOT EXISTS "tags" TEXT;
   ```

## Result
✅ Migration applied successfully
✅ Database schema updated with RMP fields
✅ Next.js server running at http://localhost:3000
✅ Site is accessible and functional

## Next Steps
The RMP scraper integration is ready to use. To complete the setup:

1. **Test the UI** (site is now running):
   - Visit http://localhost:3000/profs
   - Click on a professor to see their rating page
   - The RMP badge and graph components will show once RMP data is imported

2. **Run the RMP scraper** (when ready to import data):
   ```bash
   cd rmpscraper
   pip3 install -r requirements.txt
   python3 scraper.py
   ```

3. **Deploy the RMP cron container** (for automatic hourly scraping):
   ```bash
   docker-compose build planner-rmp-cron
   docker-compose up -d planner-rmp-cron
   ```

All code is in the `RMP-scraping` branch as requested!

