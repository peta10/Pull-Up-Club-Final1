/**
 * This script helps set up the Deno environment for Supabase Edge Functions
 * Run with: node setup-deno.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

console.log('Setting up Deno environment for Supabase Edge Functions...');

// Check if Deno is installed
try {
  execSync('deno --version', { stdio: 'ignore' });
  console.log('✅ Deno is already installed');
} catch (error) {
  console.log('❌ Deno is not installed');
  console.log('Please install Deno using one of these methods:');
  console.log('- Windows (PowerShell): irm https://deno.land/install.ps1 | iex');
  console.log('- macOS/Linux: curl -fsSL https://deno.land/install.sh | sh');
  console.log('Then run this script again.');
  process.exit(1);
}

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if VS Code is installed
const appDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support') : 
  path.join(process.env.HOME, '.config'));

const isVSCodeInstalled = fs.existsSync(path.join(appDataPath, 'Code'));

if (isVSCodeInstalled) {
  console.log('✅ VS Code is installed');
  console.log('Please install the Deno extension for VS Code:');
  console.log('1. Open VS Code');
  console.log('2. Press Ctrl+P (Cmd+P on macOS)');
  console.log('3. Type: ext install denoland.vscode-deno');
  console.log('4. Press Enter');
} else {
  console.log('ℹ️ VS Code not detected. If you use VS Code, please install the Deno extension.');
}

console.log('\n✅ Setup complete! You can now work with Supabase Edge Functions.');
console.log('The project includes:');
console.log('- deno.json: Configuration for Deno');
console.log('- deno-types.d.ts: Type declarations for Deno modules');
console.log('- .vscode/settings.json: VS Code settings for Deno');
console.log('\nTo run a Supabase function locally:');
console.log('deno run --allow-net --allow-env --allow-read supabase/functions/function-name/index.ts'); 