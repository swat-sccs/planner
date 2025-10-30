# RMP Scraping Branch - Testing Notes

## Status: ⚠️ NEEDS TESTING

**Branch**: `RMP-scraping`  
**Last Commit**: `6f4dff5` - Add RMP scraper integration with hourly automation and UI components  
**Pushed to Remote**: ✅ Yes

---

## ✅ What's Working

- **Database Migration**: Successfully applied with RMP fields
- **Site Running**: http://localhost:3000 is accessible
- **Docker Containers**: All services running properly
- **UI Components**: RMPBadge and RatingOverTimeGraph created
- **Scraper**: Python script ready with RMP API integration
- **Automation**: Hourly cron job configured in Docker

---

## ⚠️ Known Issues / Needs Testing

### 1. **Profs Page Not Viewable**
**Issue**: Couldn't view `/profs` page for some reason during development  
**Status**: Needs investigation  
**Potential Causes**:
- May be a routing issue
- Could be related to data fetching
- Might need authentication
- Component may have import/compilation errors

**To Test**:
```bash
# Visit these URLs and check for errors
http://localhost:3000/profs
http://localhost:3000/profratings/[some-prof-uid]
```

Check browser console and server logs:
```bash
docker logs planner-dev --follow
```

### 2. **RMP Data Not Yet Imported**
**Status**: Scraper hasn't been run yet  
**Impact**: RMP badges and graph will show empty states until first scrape

**To Run First Scrape**:
```bash
cd rmpscraper
pip3 install -r requirements.txt
python3 scraper.py
```

### 3. **Graph Display**
**Status**: Untested with real data  
**Needs Testing**: 
- How does the graph look with no data?
- How does it handle 1-2 data points?
- Does time frame selector work correctly?
- Are tooltips displaying properly?

### 4. **RMP Badge Links**
**Status**: Untested  
**Needs Verification**:
- Do RMP badges only show for isRMP=true ratings?
- Do links open correct RMP professor pages?
- Does the external link icon display?

### 5. **Docker RMP Cron Container**
**Status**: Not yet started  
**To Start**:
```bash
docker-compose build planner-rmp-cron
docker-compose up -d planner-rmp-cron
docker logs -f planner-rmp-cron
```

---

## 🧪 Testing Checklist

### Database & Migration
- [x] Migration applied successfully
- [x] Rating table has new RMP fields
- [ ] Can insert RMP ratings
- [ ] Can query RMP ratings separately

### Scraper
- [ ] Scraper connects to database
- [ ] Scraper finds faculty members
- [ ] Scraper queries RMP API successfully
- [ ] Scraper inserts ratings correctly
- [ ] Duplicate prevention works
- [ ] Error handling works
- [ ] Logging is adequate

### UI - RMP Badge
- [ ] Badge displays on RMP ratings
- [ ] Badge doesn't display on user ratings
- [ ] Badge links to correct RMP page
- [ ] Badge opens in new tab
- [ ] Badge styling matches design

### UI - Rating Graph
- [ ] Graph displays with data
- [ ] Graph handles empty state
- [ ] Time frame selector works
- [ ] All time frames filter correctly
- [ ] Tooltips show correct information
- [ ] Graph is responsive
- [ ] Colors are accessible

### Pages
- [ ] /profs page loads (KNOWN ISSUE)
- [ ] /profratings/[uid] page loads
- [ ] /myratings page loads
- [ ] RMP badges appear correctly
- [ ] Graph appears on prof pages
- [ ] No console errors

### Docker & Automation
- [ ] planner-rmp-cron container builds
- [ ] Cron job runs on schedule
- [ ] Logs are written correctly
- [ ] Container restarts properly
- [ ] No resource leaks

### Integration
- [ ] RMP ratings mix with user ratings
- [ ] Average ratings calculate correctly
- [ ] Sorting/filtering works
- [ ] Search still works
- [ ] Performance is acceptable

---

## 🐛 Bugs to Fix

1. **HIGH PRIORITY**: Investigate why /profs page isn't viewable
2. **MEDIUM**: Test graph with various data scenarios
3. **LOW**: Verify all documentation is accurate

---

## 📝 Notes for Reviewer

- All work is in `RMP-scraping` branch (not production)
- Migration timestamp corrected to 2025 to run after Rating table creation
- Used `IF NOT EXISTS` in migration for idempotency
- Scraper uses RMP's GraphQL API (more reliable than scraping HTML)
- Rate limiting included (1 second between requests)
- System user created for RMP ratings ownership
- Comprehensive documentation provided

---

## 🚀 Deployment Readiness

**Current Status**: 🔴 **NOT READY**

**Blockers**:
1. ⚠️ Profs page issue needs resolution
2. ⚠️ Need to test with real RMP data
3. ⚠️ Need to verify all UI components display correctly

**After Testing**: Update this status and create deployment checklist

---

## 📞 Questions for Team

1. What is the expected behavior of `/profs` page? Does it exist in main?
2. Should we filter RMP ratings by date (only recent ones)?
3. Should there be a UI toggle to hide/show RMP ratings?
4. Do we need admin controls for the scraper?
5. Should we implement caching for professor ratings?

---

**Last Updated**: October 30, 2025  
**Branch Status**: Pushed to remote ✅  
**Next Steps**: Fix profs page issue and run comprehensive testing

