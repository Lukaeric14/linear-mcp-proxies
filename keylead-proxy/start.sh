#!/bin/bash
# KeyLead Linear Workspace Proxy Startup Script

export $(cat .env | grep -v '^#' | xargs)

echo "🚀 Starting KeyLead Linear MCP Proxy..."
echo "📍 Workspace: KeyLead"
echo "🔗 OAuth endpoint: http://localhost:$KEYLEAD_PORT/auth"
echo "💡 Health check: http://localhost:$KEYLEAD_PORT/health"
echo ""

# Check if OAuth credentials are set
if [ -z "$KEYLEAD_OAUTH_CLIENT_ID" ] || [ "$KEYLEAD_OAUTH_CLIENT_ID" = "your_oauth_client_id_here" ]; then
    echo "❌ OAuth credentials not configured!"
    echo "Please edit .env file with your Linear OAuth app credentials"
    echo "See: https://linear.app/settings/api/applications"
    exit 1
fi

node ../proxy.js KeyLead
