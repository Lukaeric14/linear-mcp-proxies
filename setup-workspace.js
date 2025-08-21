#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Workspace Setup Script
 * Creates workspace-specific configuration and startup scripts
 */

const workspaceName = process.argv[2];

if (!workspaceName) {
  console.error('Usage: node setup-workspace.js <WorkspaceName>');
  console.error('Example: node setup-workspace.js KeyLead');
  process.exit(1);
}

const workspaceDir = `${workspaceName.toLowerCase()}-proxy`;

// Create workspace directory
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir);
  console.log(`📁 Created directory: ${workspaceDir}`);
}

// Create environment file template
const envTemplate = `# ${workspaceName} Linear Workspace Proxy Configuration
WORKSPACE_NAME=${workspaceName}
${workspaceName.toUpperCase()}_PORT=300${Math.floor(Math.random() * 9) + 1}
${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID=your_oauth_client_id_here
${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET=your_oauth_client_secret_here

# Set these after creating OAuth app in Linear:
# 1. Go to ${workspaceName} Linear workspace → Settings → API → OAuth Applications
# 2. Create new OAuth application: "${workspaceName} MCP Proxy"  
# 3. Set callback URL: http://localhost:\${${workspaceName.toUpperCase()}_PORT}/oauth/callback
# 4. Copy Client ID and Client Secret above
`;

const envPath = path.join(workspaceDir, '.env');
fs.writeFileSync(envPath, envTemplate);
console.log(`📄 Created: ${envPath}`);

// Create startup script
const startScript = `#!/bin/bash
# ${workspaceName} Linear Workspace Proxy Startup Script

export \$(cat .env | grep -v '^#' | xargs)

echo "🚀 Starting ${workspaceName} Linear MCP Proxy..."
echo "📍 Workspace: ${workspaceName}"
echo "🔗 OAuth endpoint: http://localhost:\$${workspaceName.toUpperCase()}_PORT/auth"
echo "💡 Health check: http://localhost:\$${workspaceName.toUpperCase()}_PORT/health"
echo ""

# Check if OAuth credentials are set
if [ -z "\$${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID" ] || [ "\$${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID" = "your_oauth_client_id_here" ]; then
    echo "❌ OAuth credentials not configured!"
    echo "Please edit .env file with your Linear OAuth app credentials"
    echo "See: https://linear.app/settings/api/applications"
    exit 1
fi

node ../proxy.js ${workspaceName}
`;

const startScriptPath = path.join(workspaceDir, 'start.sh');
fs.writeFileSync(startScriptPath, startScript);
fs.chmodSync(startScriptPath, '755');
console.log(`📄 Created: ${startScriptPath}`);

// Create Claude MCP configuration
const mcpConfig = {
  mcpServers: {
    [`${workspaceName}Linear`]: {
      command: "bash",
      args: ["./start.sh"],
      cwd: `./${workspaceDir}`,
      env: {}
    }
  }
};

const mcpConfigPath = path.join(workspaceDir, 'claude-config.json');
fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
console.log(`📄 Created: ${mcpConfigPath}`);

// Create README
const readme = `# ${workspaceName} Linear MCP Proxy

Workspace-specific proxy for Linear MCP integration.

## Setup

1. **Create OAuth Application in Linear:**
   - Go to ${workspaceName} Linear workspace → Settings → API → OAuth Applications
   - Create "${workspaceName} MCP Proxy" 
   - Set callback URL: \`http://localhost:PORT/oauth/callback\` (check .env for PORT)
   - Copy Client ID and Client Secret

2. **Configure OAuth Credentials:**
   \`\`\`bash
   # Edit .env file:
   ${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID=lin_oauth_xxx
   ${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET=xxx  
   \`\`\`

3. **Add to Claude Desktop Configuration:**
   Add the contents of \`claude-config.json\` to your Claude Desktop MCP settings.

4. **Start Proxy:**
   \`\`\`bash
   ./start.sh
   \`\`\`

5. **Authenticate:**
   Visit the OAuth URL shown in terminal to connect your workspace.

## Tools Available

All tools are prefixed with \`${workspaceName}Linear:\`:

- \`${workspaceName}Linear:list_issues\`
- \`${workspaceName}Linear:get_issue\`
- \`${workspaceName}Linear:create_issue\`
- \`${workspaceName}Linear:update_issue\`
- \`${workspaceName}Linear:add_comment\`
- \`${workspaceName}Linear:list_projects\`
- \`${workspaceName}Linear:list_teams\`
- \`${workspaceName}Linear:get_user\`

## Health Check

\`curl http://localhost:PORT/health\`
`;

const readmePath = path.join(workspaceDir, 'README.md');
fs.writeFileSync(readmePath, readme);
console.log(`📄 Created: ${readmePath}`);

console.log(`\n✅ ${workspaceName} workspace proxy setup complete!`);
console.log(`\n📋 Next steps:`);
console.log(`1. cd ${workspaceDir}`);
console.log(`2. Edit .env with your Linear OAuth credentials`);
console.log(`3. ./start.sh`);
console.log(`4. Add claude-config.json to your Claude Desktop settings`);
console.log(`5. Authenticate at the OAuth URL shown`);