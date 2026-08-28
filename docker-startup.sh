#!/bin/sh

set -eu

max_attempts="${DATABASE_RETRY_ATTEMPTS:-30}"
retry_delay="${DATABASE_RETRY_DELAY_SECONDS:-5}"
attempt=1

until npx prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database migration failed after $attempt attempts; stopping startup."
    exit 1
  fi

  echo "Database is not ready (attempt $attempt/$max_attempts); retrying in ${retry_delay}s."
  attempt=$((attempt + 1))
  sleep "$retry_delay"
done

exec npm start
