#!/bin/bash
# Fix logger.error calls in API routes to match new typed signature
# logger.error('message:', error) -> logger.error('message', { error: error as Error })

find src/app/api -type f -name "*.ts" -exec sed -i '' \
  -e "s/logger\.error('\([^']*\):', \([a-zA-Z][a-zA-Z0-9]*\))/logger.error('\1', { error: \2 as Error })/g" \
  -e "s/logger\.error(\"\([^\"]*\):\", \([a-zA-Z][a-zA-Z0-9]*\))/logger.error(\"\1\", { error: \2 as Error })/g" \
  {} +

echo "✅ Fixed logger.error calls in API routes"
