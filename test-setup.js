#!/usr/bin/env node

/**
 * Test Setup Verification
 * Validates that workspace proxies are properly configured
 */

import fs from 'fs';
import fetch from 'node-fetch';

async function testWorkspaceSetup(workspaceName) {
  const workspaceDir = `${workspaceName.toLowerCase()}-proxy`;
  const envPath = `${workspaceDir}/.env`;
  
  console.log(`\n🧪 Testing ${workspaceName} workspace setup...`);
  
  // Check if workspace directory exists
  if (!fs.existsSync(workspaceDir)) {
    console.log(`❌ Workspace directory missing: ${workspaceDir}`);
    return false;
  }
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log(`❌ Environment file missing: ${envPath}`);
    return false;
  }
  
  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const env = {};
  
  envLines.forEach(line => {
    const [key, value] = line.split('=', 2);
    if (key && value) {
      env[key] = value;
    }
  });
  
  // Check required environment variables
  const requiredVars = [
    'WORKSPACE_NAME',
    `${workspaceName.toUpperCase()}_PORT`,
    `${workspaceName.toUpperCase()}_OAUTH_CLIENT_ID`,
    `${workspaceName.toUpperCase()}_OAUTH_CLIENT_SECRET`
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your_') || env[varName].includes('_here')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing or placeholder OAuth credentials: ${missingVars.join(', ')}`);
    console.log(`   Edit ${envPath} with real OAuth credentials from Linear`);
    return false;
  }
  
  // Test port availability
  const port = env[`${workspaceName.toUpperCase()}_PORT`];
  try {
    const response = await fetch(`http://localhost:${port}/health`, { timeout: 1000 });
    if (response.ok) {
      const health = await response.json();
      console.log(`✅ Proxy server running on port ${port}`);
      console.log(`   Authenticated: ${health.authenticated ? '✅' : '❌'}`);
      console.log(`   Connected: ${health.connected ? '✅' : '❌'}`);
      
      if (!health.authenticated) {
        console.log(`   🔗 Authenticate at: http://localhost:${port}/auth`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Proxy server not running on port ${port}`);
    console.log(`   Start with: cd ${workspaceDir} && ./start.sh`);
  }
  
  // Check required files
  const requiredFiles = [
    `${workspaceDir}/start.sh`,
    `${workspaceDir}/claude-config.json`,
    `${workspaceDir}/README.md`
  ];
  
  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath.split('/').pop()}`);
    } else {
      console.log(`❌ Missing file: ${filePath}`);
    }
  });
  
  return missingVars.length === 0;
}

async function main() {
  console.log('🔍 Linear MCP Multi-Workspace Proxy Setup Test\n');
  
  // Test main files
  const mainFiles = ['proxy.js', 'setup-workspace.js', 'package.json'];
  console.log('📁 Main files:');
  mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
    }
  });
  
  // Find workspace directories
  const workspaces = [];
  const items = fs.readdirSync('.');
  items.forEach(item => {
    if (item.endsWith('-proxy') && fs.statSync(item).isDirectory()) {
      const workspaceName = item.replace('-proxy', '');
      workspaces.push(workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1));
    }
  });
  
  if (workspaces.length === 0) {
    console.log(`\n❌ No workspace proxies found. Create some with:`);
    console.log(`   node setup-workspace.js KeyLead`);
    console.log(`   node setup-workspace.js Abundance`);
    return;
  }
  
  console.log(`\n📋 Found ${workspaces.length} workspace proxies: ${workspaces.join(', ')}`);
  
  // Test each workspace
  let allGood = true;
  for (const workspace of workspaces) {
    const result = await testWorkspaceSetup(workspace);
    allGood = allGood && result;
  }
  
  console.log(`\n${allGood ? '🎉' : '⚠️'} Overall Status: ${allGood ? 'Ready to use!' : 'Needs configuration'}`);
  
  if (!allGood) {
    console.log(`\n📝 Next steps:`);
    console.log(`1. Configure OAuth credentials in workspace .env files`);
    console.log(`2. Start workspace proxies: cd <workspace>-proxy && ./start.sh`);
    console.log(`3. Authenticate at OAuth URLs shown in terminal`);
    console.log(`4. Add claude-config.json contents to Claude Desktop MCP settings`);
  }
}

main().catch(console.error);