#!/bin/bash

# Fix Supabase keys in AR Viewer repo
echo "🔐 Fixing hardcoded Supabase keys in AR Viewer repo..."

OLD_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI"
NEW_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110"

OLD_SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E"
NEW_SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk"

# Find all files with old keys and replace them (excluding backup files)
echo "Scanning for files with old keys..."
find . -type f \( -name "*.js" -o -name "*.mjs" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" -o -name ".env.local" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -name "*.backup" ! -name "*backup*" \
  -exec grep -l "$OLD_ANON\|$OLD_SERVICE" {} \; | while read file; do
    echo "Updating: $file"
    sed -i "s|$OLD_ANON|$NEW_ANON|g" "$file"
    sed -i "s|$OLD_SERVICE|$NEW_SERVICE|g" "$file"
done

echo "✅ Key replacement complete in AR Viewer repo!"