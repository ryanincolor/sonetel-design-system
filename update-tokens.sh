#!/bin/bash

echo "🔄 Updating design tokens..."

# Check if there are changes in the tokens directory
if git diff-tree --name-only HEAD HEAD~1 | grep -q "tokens/"; then
    echo "📦 Token changes detected, rebuilding..."
    
    # Build the tokens
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Tokens built successfully!"
        echo "🔄 Restarting dev server to pick up changes..."
        
        # Note: In a real setup, you might want to restart the dev server
        # For now, this script just builds the tokens
        echo "✅ Ready! Please restart your dev server to see the changes."
    else
        echo "❌ Token build failed!"
        exit 1
    fi
else
    echo "ℹ️  No token changes detected, skipping rebuild."
fi
