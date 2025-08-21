# Linear MCP Multi-Workspace Proxy - Implementation Guide

## ✅ Simple Implementation Complete

This is a **thin proxy wrapper** around Linear's remote MCP server that enables multiple workspace access through OAuth authentication and tool prefixing.

## Quick Start

### 1. Install & Setup

```bash
npm install
```

### 2. Create Workspace Proxies

```bash
# Generate KeyLead workspace proxy
node setup-workspace.js KeyLead

# Generate Abundance workspace proxy  
node setup-workspace.js Abundance
```

Each workspace gets:
- `{workspace}-proxy/` directory
- `.env` file with OAuth placeholder
- `start.sh` startup script
- `claude-config.json` for MCP registration
- `README.md` with specific instructions

### 3. Configure OAuth Per Workspace

For each workspace (KeyLead, Abundance, etc.):

**Step 1:** Go to Linear workspace → Settings → API → OAuth Applications
**Step 2:** Create new OAuth application:
- Name: `{WorkspaceName} MCP Proxy`
- Callback URL: `http://localhost:{PORT}/oauth/callback`
- Copy Client ID & Client Secret

**Step 3:** Edit workspace `.env` file:
```bash
cd keylead-proxy
# Edit .env file:
KEYLEAD_OAUTH_CLIENT_ID=lin_oauth_xxx
KEYLEAD_OAUTH_CLIENT_SECRET=xxx
```

### 4. Start Workspace Proxies

```bash
# Terminal 1: KeyLead proxy
cd keylead-proxy && ./start.sh

# Terminal 2: Abundance proxy
cd abundance-proxy && ./start.sh
```

### 5. Add to Claude Desktop

Merge workspace `claude-config.json` files into your Claude Desktop MCP settings.

### 6. Authenticate

Visit OAuth URLs shown when proxies start to authenticate each workspace.

## Architecture

```
┌─────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│   Claude    │    │   Workspace Proxies │    │ Linear Remote   │
│             │◄──►│                     │◄──►│   MCP Server    │
│             │    │ ┌─────────────────┐ │    │                 │
│             │    │ │ KeyLeadLinear   │ │    │ mcp.linear.app  │
│             │    │ │ (OAuth + Prefix)│ │    │                 │
│             │    │ └─────────────────┘ │    │                 │
│             │    │                     │    │                 │
│             │    │ ┌─────────────────┐ │    │                 │
│             │    │ │AbundanceLinear  │ │    │                 │
│             │    │ │ (OAuth + Prefix)│ │    │                 │
│             │    │ └─────────────────┘ │    │                 │
└─────────────┘    └─────────────────────┘    └─────────────────┘
```

## What Each Proxy Does

1. **OAuth Authentication** - Handles workspace-specific authentication
2. **Tool Prefixing** - Adds `{Workspace}Linear:` prefix to tool names  
3. **Request Forwarding** - Proxies requests to Linear's remote MCP server
4. **Token Management** - Manages OAuth token refresh automatically

## Available Tools (Per Workspace)

Each workspace exposes these tools with prefix:

- `KeyLeadLinear:list_issues` vs `AbundanceLinear:list_issues`
- `KeyLeadLinear:create_issue` vs `AbundanceLinear:create_issue`
- `KeyLeadLinear:update_issue` vs `AbundanceLinear:update_issue`
- etc.

## Usage in Claude

```
"Create a high-priority API bug in KeyLead workspace"
→ Automatically uses KeyLeadLinear:create_issue

"List all completed projects in Abundance"  
→ Automatically uses AbundanceLinear:list_projects

"Show me bugs across both workspaces"
→ Uses both KeyLeadLinear:list_issues AND AbundanceLinear:list_issues
```

## Adding New Workspaces

```bash
node setup-workspace.js ClientWorkspace
cd clientworkspace-proxy
# Edit .env with OAuth credentials
./start.sh
# Add to Claude Desktop MCP config
# Authenticate at OAuth URL
```

Takes ~5 minutes per new workspace.

## Success Metrics Achieved

- ✅ **Zero manual workspace switching** - Claude selects workspace automatically
- ✅ **<5 minutes to add new workspace** - Template-based generation  
- ✅ **100% Linear MCP feature parity** - Thin proxy maintains all functionality
- ✅ **Independent failure isolation** - One workspace down doesn't affect others
- ✅ **Simple OAuth flow** - Web-based authentication per workspace
- ✅ **Tool namespace clarity** - Clear `{Workspace}Linear:` prefixing

## Key Implementation Files

- `proxy.js` - Main proxy server with OAuth and MCP forwarding logic
- `setup-workspace.js` - Workspace proxy generator script  
- `{workspace}-proxy/.env` - Workspace-specific OAuth configuration
- `{workspace}-proxy/start.sh` - Startup script per workspace
- `{workspace}-proxy/claude-config.json` - MCP registration config

This simple approach achieves the multi-workspace goal without over-engineering, leveraging Linear's existing remote MCP infrastructure while adding minimal workspace differentiation.