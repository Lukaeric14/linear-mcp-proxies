#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import fetch from 'node-fetch';

/**
 * Simple Linear MCP Workspace Proxy
 * 
 * This proxy wraps Linear's remote MCP server (https://mcp.linear.app/sse) 
 * and adds workspace-specific authentication and tool prefixing.
 */

class LinearWorkspaceProxy {
  constructor(workspaceName) {
    this.workspaceName = workspaceName;
    this.toolPrefix = `${workspaceName}Linear`;
    this.port = process.env[`${workspaceName.toUpperCase()}_PORT`] || 3000;
    this.oauthClientId = process.env[`${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID`];
    this.oauthClientSecret = process.env[`${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET`];
    this.accessToken = null;
    
    this.server = new Server({
      name: `${workspaceName}Linear`,
      version: '1.0.0',
    });
    
    this.linearClient = null;
    this.setupOAuthServer();
    this.setupMCPProxy();
  }

  setupOAuthServer() {
    this.app = express();
    
    // OAuth authentication route
    this.app.get('/auth', (req, res) => {
      const authUrl = new URL('https://linear.app/oauth/authorize');
      authUrl.searchParams.set('client_id', this.oauthClientId);
      authUrl.searchParams.set('redirect_uri', `http://localhost:${this.port}/oauth/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'read,write');
      
      res.redirect(authUrl.toString());
    });

    // OAuth callback
    this.app.get('/oauth/callback', async (req, res) => {
      try {
        const { code } = req.query;
        
        const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.oauthClientId,
            client_secret: this.oauthClientSecret,
            redirect_uri: `http://localhost:${this.port}/oauth/callback`,
            code: code
          })
        });

        const tokenData = await tokenResponse.json();
        this.accessToken = tokenData.access_token;
        
        // Initialize Linear MCP client connection with token
        await this.connectToLinearMCP();
        
        res.send(`
          <h1>✅ ${this.workspaceName} Workspace Connected</h1>
          <p>You can close this window and return to Claude.</p>
          <script>setTimeout(() => window.close(), 2000);</script>
        `);
      } catch (error) {
        console.error('OAuth error:', error);
        res.status(500).send(`Authentication failed: ${error.message}`);
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        workspace: this.workspaceName,
        authenticated: !!this.accessToken,
        connected: !!this.linearClient
      });
    });

    this.app.listen(this.port, () => {
      console.log(`${this.workspaceName} proxy OAuth server running on port ${this.port}`);
      if (!this.accessToken) {
        console.log(`🔗 Authenticate at: http://localhost:${this.port}/auth`);
      }
    });
  }

  async connectToLinearMCP() {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Connect to Linear's remote MCP server
    // Note: This is a simplified approach - in practice you'd connect to Linear's SSE endpoint
    // with the access token and proxy the MCP protocol
    
    console.log(`🔌 Connected to Linear MCP for ${this.workspaceName} workspace`);
    this.linearClient = { connected: true }; // Placeholder
  }

  setupMCPProxy() {
    // Set up tool handlers that proxy to Linear's remote MCP server
    // Each tool gets prefixed with workspace name for Claude to distinguish
    
    const linearTools = [
      'list_issues',
      'get_issue', 
      'create_issue',
      'update_issue',
      'add_comment',
      'list_projects',
      'list_teams',
      'get_user'
    ];

    linearTools.forEach(toolName => {
      const proxiedToolName = `${this.toolPrefix}:${toolName}`;
      
      this.server.tool(proxiedToolName, {
        description: `${toolName.replace('_', ' ')} in ${this.workspaceName} Linear workspace`,
        inputSchema: {
          type: 'object',
          properties: {}, // Would be populated based on Linear's actual schema
          additionalProperties: true
        }
      }, async (args) => {
        if (!this.linearClient) {
          throw new Error(`${this.workspaceName} workspace not authenticated. Visit http://localhost:${this.port}/auth`);
        }

        // Forward request to Linear's remote MCP server with our access token
        // This is where the actual proxying logic would go
        
        return {
          content: [{
            type: 'text',
            text: `[PROXY] ${toolName} called for ${this.workspaceName} workspace with args: ${JSON.stringify(args)}`
          }]
        };
      });
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Get workspace name from command line args or environment
const workspaceName = process.argv[2] || process.env.WORKSPACE_NAME;

if (!workspaceName) {
  console.error('Usage: node proxy.js <WorkspaceName>');
  console.error('Or set WORKSPACE_NAME environment variable');
  process.exit(1);
}

// Validate OAuth credentials
const oauthClientId = process.env[`${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID`];
const oauthClientSecret = process.env[`${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET`];

if (!oauthClientId || !oauthClientSecret) {
  console.error(`❌ Missing OAuth credentials for ${workspaceName} workspace`);
  console.error(`Set these environment variables:`);
  console.error(`${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID=...`);
  console.error(`${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET=...`);
  process.exit(1);
}

// Start the proxy
const proxy = new LinearWorkspaceProxy(workspaceName);
proxy.start().catch(console.error);