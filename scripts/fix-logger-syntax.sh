#!/bin/bash

# Fix syntax errors from previous console replacement
#  All logger.error('...:', { error) should become logger.error('...', { error })

find src/app/admin -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix missing closing brace and parenthesis
  sed -i '' -E 's/logger\.error\(([^,]+), \{ error\);/logger.error(\1, { error });/g' "$file"
  sed -i '' -E 's/logger\.error\(([^,]+), \{ errorData\);/logger.error(\1, { errorData });/g' "$file"
  sed -i '' -E 's/logger\.error\(([^,]+), \{ err\);/logger.error(\1, { err });/g' "$file"
  echo "Fixed: $file"
done

echo "All syntax errors fixed!"
