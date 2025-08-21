# KeyLead Linear MCP Proxy

Workspace-specific proxy for Linear MCP integration.

## Setup

1. **Create OAuth Application in Linear:**
   - Go to KeyLead Linear workspace → Settings → API → OAuth Applications
   - Create "KeyLead MCP Proxy" 
   - Set callback URL: `http://localhost:PORT/oauth/callback` (check .env for PORT)
   - Copy Client ID and Client Secret

2. **Configure OAuth Credentials:**
   ```bash
   # Edit .env file:
   KEYLEAD_OAUTH_CLIENT_ID=lin_oauth_xxx
   KEYLEAD_OAUTH_CLIENT_SECRET=xxx  
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

All tools are prefixed with `KeyLeadLinear:`:

- `KeyLeadLinear:list_issues`
- `KeyLeadLinear:get_issue`
- `KeyLeadLinear:create_issue`
- `KeyLeadLinear:update_issue`
- `KeyLeadLinear:add_comment`
- `KeyLeadLinear:list_projects`
- `KeyLeadLinear:list_teams`
- `KeyLeadLinear:get_user`

## Health Check

`curl http://localhost:PORT/health`
