# Multi-Workspace Linear MCP Proxy System
## Product Requirements Document (PRD)

### Executive Summary

**Problem:** Claude's MCP interface doesn't support multiple instances of the same service connection, preventing users from accessing multiple Linear workspaces simultaneously. Current implementation forces manual workspace switching and re-authentication.

**Solution:** A set of lightweight workspace-specific MCP proxy servers that expose multiple Linear workspaces as distinct services to Claude. Each proxy maintains a dedicated connection to one workspace, allowing Claude to naturally select the appropriate workspace based on user context.

**Business Impact:** Eliminates workspace switching friction while maintaining simplicity and enabling future scaling to additional workspaces with minimal overhead.

---

## 1. Problem Statement

### Current Pain Points
- **Single workspace limitation:** Claude MCP can only connect to one Linear workspace at a time
- **Manual workspace switching:** Users must disconnect and reconnect to access different workspaces
- **Context loss:** Each workspace switch loses access to previously connected workspaces
- **No native multi-instance support:** MCP interface treats each service type as singular

### User Impact
- **Product managers** lose 15-20 minutes daily switching between client workspaces
- **Engineering teams** can't simultaneously access internal and client Linear instances
- **Consultants** experience significant overhead managing multiple client workspaces

### Business Justification
A simple proxy approach leverages Claude's existing tool selection intelligence while requiring minimal development overhead compared to complex routing solutions.

---

## 2. Solution Overview

### Core Value Proposition
**"Multiple Linear workspaces, zero switching"** - Access all Linear workspaces simultaneously through workspace-specific proxy services that Claude intelligently selects.

### Key Capabilities
1. **Workspace-Specific Proxies:** Independent MCP servers for each Linear workspace
2. **Claude-Driven Selection:** Natural workspace selection based on user context and prompts
3. **Identical Functionality:** Full Linear MCP feature parity across all workspace proxies
4. **Scalable Addition:** Easy addition of new workspaces without affecting existing proxies

### Success Metrics
- **Zero manual workspace switches** during multi-workspace sessions
- **100% feature parity** with native Linear MCP per workspace
- **<30 seconds** to add new workspace proxy
- **Transparent user experience** - Claude handles workspace selection

---

## 3. User Stories & Requirements

### Primary User: Multi-Workspace Product Manager
**As a** product manager working across KeyLead and client projects  
**I want to** create issues in any workspace through natural language  
**So that** Claude automatically selects the right workspace without manual switching

**Example Usage:**
- "Create a high-priority issue in KeyLead about the API integration"
- "Check the status of design issues in the Abundance workspace"
- "List all bugs across both KeyLead and client workspaces"

**Acceptance Criteria:**
- Claude correctly identifies workspace from context
- All Linear functions work identically across workspaces
- No manual workspace selection required

### Secondary User: Engineering Lead
**As an** engineering lead managing internal and client work  
**I want** seamless access to multiple Linear instances  
**So that** I can coordinate cross-workspace dependencies efficiently

**Acceptance Criteria:**
- Can reference issues across workspaces in single conversation
- Claude maintains workspace context throughout discussion
- Error handling doesn't affect other workspace connections

---

## 4. Technical Requirements

### 4.1 Functional Requirements

#### FR1: Workspace-Specific Proxy Servers
- **FR1.1:** Independent MCP server per Linear workspace
- **FR1.2:** Unique service identifier for each workspace proxy
- **FR1.3:** Identical tool interface across all workspace proxies
- **FR1.4:** Independent authentication and connection management

#### FR2: Tool Namespace Management
- **FR2.1:** Clear tool naming convention (e.g., `KeyLead_Linear:create_issue`)
- **FR2.2:** Consistent tool descriptions identifying target workspace
- **FR2.3:** Avoid tool name conflicts between workspace proxies
- **FR2.4:** Maintain Linear MCP API compatibility per proxy

#### FR3: Scalable Proxy Architecture
- **FR3.1:** Template-based proxy generation for new workspaces
- **FR3.2:** Configuration-driven workspace setup
- **FR3.3:** Independent deployment and lifecycle management
- **FR3.4:** No cross-proxy dependencies or shared state

#### FR4: Workspace Context Clarity
- **FR4.1:** Clear workspace identification in tool descriptions
- **FR4.2:** Consistent naming patterns for easy Claude recognition
- **FR4.3:** Error messages include workspace context
- **FR4.4:** Tool discovery includes workspace metadata

### 4.2 Non-Functional Requirements

#### NFR1: Performance
- **Response Time:** Identical to native Linear MCP per workspace
- **Startup Time:** <10 seconds per proxy server
- **Resource Efficiency:** <100MB memory per proxy

#### NFR2: Reliability
- **Independent Failure:** One workspace failure doesn't affect others
- **Connection Recovery:** Automatic reconnection per workspace
- **Error Isolation:** Workspace-specific error handling

#### NFR3: Scalability
- **Proxy Capacity:** Support 10+ workspace proxies
- **Easy Addition:** <5 minutes to add new workspace proxy
- **Resource Scaling:** Linear resource usage per additional workspace

#### NFR4: Maintainability
- **Template-Based:** Consistent proxy structure across workspaces
- **Configuration-Driven:** Workspace details externalized
- **Version Consistency:** All proxies use same Linear MCP codebase

---

## 5. Technical Architecture

### 5.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────────────────────────┐    ┌─────────────────┐
│   Claude MCP    │    │        Workspace Proxies            │    │  Linear APIs    │
│    Interface    │    │                                     │    │                 │
│                 │◄──►│ ┌─────────────────┐                │◄──►│ ┌─────────────┐ │
│                 │    │ │  KeyLead_Linear │                │    │ │   KeyLead   │ │
│                 │    │ │     Proxy       │────────────────┼────┼─│  Workspace  │ │
│                 │    │ └─────────────────┘                │    │ └─────────────┘ │
│                 │    │                                     │    │                 │
│                 │    │ ┌─────────────────┐                │    │ ┌─────────────┐ │
│                 │    │ │ Abundance_Linear│                │    │ │  Abundance  │ │
│                 │    │ │     Proxy       │────────────────┼────┼─│  Workspace  │ │
│                 │    │ └─────────────────┘                │    │ └─────────────┘ │
│                 │    │                                     │    │                 │
│                 │    │ ┌─────────────────┐                │    │ ┌─────────────┐ │
│                 │    │ │  Client_Linear  │                │    │ │   Client    │ │
│                 │    │ │     Proxy       │────────────────┼────┼─│  Workspace  │ │
│                 │    │ └─────────────────┘                │    │ └─────────────┘ │
└─────────────────┘    └─────────────────────────────────────┘    └─────────────────┘
```

### 5.2 Proxy Server Components

#### Core Proxy Structure
Each workspace proxy contains:
- **Linear MCP Base:** Cloned Linear MCP server codebase
- **Workspace Config:** Hardcoded workspace credentials and endpoint
- **Service Identity:** Unique MCP service name and tool prefixes
- **Error Handling:** Workspace-specific error context and recovery

#### Service Naming Convention
```
Service Pattern: {Workspace}Linear
Tool Pattern: {Workspace}Linear:{function_name}

Examples:
- KeyLeadLinear:create_issue
- AbundanceLinear:list_projects  
- ClientLinear:update_issue
```

### 5.3 Technology Stack

#### Proxy Implementation
- **Base:** Linear's official MCP server codebase
- **Customization:** Minimal configuration changes per workspace
- **Runtime:** Node.js with workspace-specific environment variables
- **Deployment:** Independent process per workspace proxy

#### Configuration Management
- **Environment Variables:** Workspace credentials and API endpoints
- **Service Config:** MCP service registration and tool naming
- **Template System:** Consistent proxy generation and management
- **Secrets Management:** Secure credential storage per workspace

---

## 6. Implementation Phases

### Phase 1: OAuth Application Setup (Sprint 1 - Day 1-2)
**Deliverables:**
- Create OAuth applications in KeyLead and Abundance workspaces
- Document OAuth credentials securely
- Set up workspace-specific callback URLs
- Verify OAuth flow for each workspace independently

**Success Criteria:**
- OAuth apps created in both target workspaces
- Authentication flow working for each workspace
- Secure credential storage implemented

**Prerequisites:** Must be workspace admin in target workspaces

### Phase 2: Proxy Server Development (Sprint 1 - Day 3-5)
**Deliverables:**
- Clone and customize Linear MCP server codebase for each workspace
- Implement OAuth authentication flow per proxy
- Configure unique service names and tool prefixes
- Basic error handling and workspace isolation

**Success Criteria:**
- 2 workspace proxies running independently
- Claude can distinguish and use both services
- OAuth authentication working per proxy
- All Linear MCP functions operational per workspace

### Phase 3: Scalability & Operations (Sprint 2 - Day 1-3)
**Deliverables:**
- Automated proxy generation script with OAuth setup
- Configuration management for OAuth credentials
- Monitoring and health checks per proxy
- Documentation for adding new workspaces

**Success Criteria:**
- Can add new workspace proxy in <10 minutes (excluding OAuth app creation)
- Independent monitoring per workspace
- Clear operational procedures including OAuth management

### Phase 4: Enhancement & Polish (Sprint 2 - Day 4-5)
**Deliverables:**
- Enhanced tool descriptions for better Claude recognition
- Improved error messages with workspace context
- OAuth token refresh handling
- User documentation and troubleshooting guides

**Success Criteria:**
- Optimal Claude workspace selection accuracy
- Robust OAuth token management
- Production-ready operational characteristics

---

## 7. Configuration Architecture

### 7.1 OAuth Application Setup Per Workspace

**Prerequisites:** You must be a workspace admin in each target workspace to create OAuth applications.

#### 7.1.1 Create OAuth Applications

**For each workspace, create a separate OAuth application:**

1. **KeyLead Workspace:**
   - Navigate to KeyLead workspace → Settings → API → OAuth Applications
   - Create "KeyLead MCP Proxy" OAuth app
   - Set callback URL: `http://localhost:3001/oauth/callback`
   - Note Client ID and Client Secret

2. **Abundance Workspace:**
   - Navigate to Abundance workspace → Settings → API → OAuth Applications  
   - Create "Abundance MCP Proxy" OAuth app
   - Set callback URL: `http://localhost:3002/oauth/callback`
   - Note Client ID and Client Secret

3. **Future Client Workspaces:**
   - Repeat process for each additional workspace
   - Use unique port numbers for callback URLs

### 7.2 Workspace Configuration Template

```yaml
# workspace-config.template.yaml
workspace:
  name: "{WORKSPACE_NAME}"
  slug: "{WORKSPACE_SLUG}"
  
mcp:
  service_name: "{WORKSPACE_NAME}Linear"
  tool_prefix: "{WORKSPACE_NAME}Linear"
  description: "Linear workspace for {WORKSPACE_NAME}"

oauth:
  client_id: "${OAUTH_CLIENT_ID}"
  client_secret: "${OAUTH_CLIENT_SECRET}"
  redirect_uri: "http://localhost:${PORT}/oauth/callback"
  scopes: "read,write"

linear:
  api_endpoint: "https://api.linear.app/graphql"
  oauth_authorize_url: "https://linear.app/oauth/authorize"
  oauth_token_url: "https://api.linear.app/oauth/token"

server:
  port: ${PORT}
  health_check_path: "/health"
```

### 7.3 OAuth Authentication Flow Per Proxy

```typescript
// OAuth flow implementation per workspace proxy
app.get('/auth', (req, res) => {
  const authUrl = new URL('https://linear.app/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', process.env.OAUTH_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'read,write');
  authUrl.searchParams.set('state', generateSecureState());
  
  res.redirect(authUrl.toString());
});

app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state parameter for CSRF protection
  if (!verifyState(state)) {
    return res.status(400).send('Invalid state parameter');
  }
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
      code: code
    })
  });
  
  const { access_token } = await tokenResponse.json();
  
  // Store token securely and initialize Linear client
  await storeAccessToken(access_token);
  initializeLinearClient(access_token);
  
  res.send('Authentication successful! Proxy is now connected to Linear.');
});
```

### 7.4 Environment Configuration Per Proxy

```bash
# keylead-proxy/.env
WORKSPACE_NAME=KeyLead
OAUTH_CLIENT_ID=keylead_oauth_client_id_here
OAUTH_CLIENT_SECRET=keylead_oauth_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3001/oauth/callback
PORT=3001
MCP_SERVICE_NAME=KeyLeadLinear

# abundance-proxy/.env  
WORKSPACE_NAME=Abundance
OAUTH_CLIENT_ID=abundance_oauth_client_id_here
OAUTH_CLIENT_SECRET=abundance_oauth_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3002/oauth/callback
PORT=3002
MCP_SERVICE_NAME=AbundanceLinear

# client-proxy/.env (template for future workspaces)
WORKSPACE_NAME=Client
OAUTH_CLIENT_ID=client_oauth_client_id_here
OAUTH_CLIENT_SECRET=client_oauth_client_secret_here
OAUTH_REDIRECT_URI=http://localhost:3003/oauth/callback
PORT=3003
MCP_SERVICE_NAME=ClientLinear
```

---

## 8. Success Metrics & KPIs

### Primary Metrics
- **Workspace Access:** 100% successful access to all configured workspaces
- **Tool Parity:** 100% Linear MCP function availability per workspace
- **Selection Accuracy:** Claude correctly identifies workspace context >95% of time
- **Setup Time:** <5 minutes to add new workspace proxy

### Secondary Metrics
- **Error Isolation:** Workspace failures don't affect other workspaces
- **Resource Usage:** Linear scaling of memory/CPU per additional workspace
- **User Satisfaction:** Zero workspace switching friction reported
- **Operational Overhead:** <10 minutes/week maintenance across all proxies

### Technical Metrics
- **Response Time:** Identical to native Linear MCP performance
- **Uptime:** 99.9% per workspace proxy
- **Memory Usage:** <100MB per proxy server
- **Startup Time:** <10 seconds per proxy

---

## 10. Future Enhancements (out of scope)

### Phase 4+: Advanced Proxy Features
- **Shared Caching:** Cross-workspace metadata caching for performance
- **Unified Monitoring:** Single dashboard for all workspace proxy health
- **Auto-Discovery:** Automatic workspace detection and proxy generation

### Additional Workspace Types
- **GitHub Workspaces:** Similar proxy pattern for multiple GitHub organizations
- **Notion Workspaces:** Multi-workspace Notion access
- **Slack Workspaces:** Cross-workspace Slack integration

### Enterprise Features
- **Centralized Management:** Admin interface for workspace proxy management
- **Access Control:** User-specific workspace proxy access
- **Audit Logging:** Cross-workspace operation tracking

---

## 11. Getting Started Guide

### Quick Setup for New Workspace

1. **Clone Proxy Template**
   ```bash
   cp -r workspace-proxy-template {workspace-name}-linear-proxy
   cd {workspace-name}-linear-proxy
   ```

2. **Configure Workspace**
   ```bash
   # Edit .env file
   WORKSPACE_NAME={WorkspaceName}
   LINEAR_API_TOKEN={workspace_api_token}
   PORT={unique_port}
   ```

3. **Start Proxy**
   ```bash
   npm install
   npm start
   ```

4. **Register with Claude**
   - Add MCP configuration for new service
   - Test tool availability and functionality

---

## 12. Conclusion

The Multi-Workspace Linear MCP Proxy System provides an elegant solution to Claude's single-service limitation through lightweight, workspace-specific proxy servers. This approach maximizes simplicity while enabling unlimited workspace scaling.

**Key Benefits:**
- **Immediate Solution:** Works with existing Linear MCP codebase
- **Minimal Development:** Simple configuration and deployment changes
- **Natural UX:** Claude handles workspace selection intelligently  
- **Future-Proof:** Easy scaling to additional workspaces and service types

**Recommendation:** Proceed with Phase 1 implementation, targeting 3-5 day completion for initial KeyLead and Abundance workspace proxies.

The proxy approach represents the optimal balance of simplicity, functionality, and maintainability for multi-workspace Linear access.