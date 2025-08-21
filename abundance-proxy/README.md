# Abundance Linear MCP Proxy

Workspace-specific proxy for Linear MCP integration.

## Setup

1. **Create OAuth Application in Linear:**
   - Go to Abundance Linear workspace → Settings → API → OAuth Applications
   - Create "Abundance MCP Proxy" 
   - Set callback URL: `http://localhost:PORT/oauth/callback` (check .env for PORT)
   - Copy Client ID and Client Secret

2. **Configure OAuth Credentials:**
   ```bash
   # Edit .env file:
   ABUNDANCE_OAUTH_CLIENT_ID=lin_oauth_xxx
   ABUNDANCE_OAUTH_CLIENT_SECRET=xxx  
   ```

3. **Add to Claude Desktop Configuration:**
   Add the contents of `claude-config.json` to your Claude Desktop MCP settings.

4. **Start Proxy:**
   ```bash
   ./start.sh
   ```

5. **Authenticate:**
   Visit the OAuth URL shown in terminal to connect your workspace.

## Tools Available

All tools are prefixed with `AbundanceLinear:`:

- `AbundanceLinear:list_issues`
- `AbundanceLinear:get_issue`
- `AbundanceLinear:create_issue`
- `AbundanceLinear:update_issue`
- `AbundanceLinear:add_comment`
- `AbundanceLinear:list_projects`
- `AbundanceLinear:list_teams`
- `AbundanceLinear:get_user`

## Health Check

`curl http://localhost:PORT/health`
