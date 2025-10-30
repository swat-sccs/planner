#!/bin/bash
set -e

# Apply cron job
crontab /etc/cron.d/rmp-scraper

# Start rsyslog
service rsyslog start

# Start cron in foreground
cron -f

