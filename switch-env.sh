#!/bin/bash

# 🔄 Script de Switch entre Dev et Production
# Usage: ./switch-env.sh dev|prod

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "❌ Usage: ./switch-env.sh [dev|prod]"
    echo ""
    echo "Exemples:"
    echo "  ./switch-env.sh dev   → Utiliser la base de développement"
    echo "  ./switch-env.sh prod  → Utiliser la base de production"
    exit 1
fi

case $ENV in
    dev)
        echo "🔵 Switching to DEVELOPMENT environment..."
        
        # Copier .env.development vers .env
        if [ -f ".env.development" ]; then
            cp .env.development .env
            echo "✅ Switched to DEVELOPMENT"
            echo ""
            echo "📊 Current database:"
            grep "DATABASE_URL" .env | head -n 1
            echo ""
            echo "🚀 You can now run: npm run dev"
        else
            echo "❌ .env.development not found!"
            echo "Run: ./setup-databases.sh first"
            exit 1
        fi
        ;;
    
    prod)
        echo "🔴 Switching to PRODUCTION environment..."
        
        # Copier .env.production vers .env
        if [ -f ".env.production" ]; then
            cp .env.production .env
            echo "✅ Switched to PRODUCTION"
            echo ""
            echo "📊 Current database:"
            grep "DATABASE_URL" .env | head -n 1
            echo ""
            echo "⚠️  WARNING: You are now connected to PRODUCTION database!"
            echo "🚨 Be careful with migrations and seeds!"
        else
            echo "❌ .env.production not found!"
            echo "Run: ./setup-databases.sh first"
            exit 1
        fi
        ;;
    
    *)
        echo "❌ Invalid environment: $ENV"
        echo "Use: dev or prod"
        exit 1
        ;;
esac
