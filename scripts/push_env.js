const { spawnSync } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));

const varsToPush = ['DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'OPENAI_API_KEY'];

for (const key of varsToPush) {
  if (envConfig[key]) {
    console.log(`\n--- Pushing ${key} ---`);
    
    // First, try removing it from production,preview
    spawnSync('npx.cmd', ['vercel@58.9.2', 'env', 'rm', key, 'production,preview', '-y']);
    
    // Then add it using --value and --yes
    const addRes = spawnSync('npx.cmd', ['vercel@58.9.2', 'env', 'add', key, 'production,preview', '--value', envConfig[key], '--yes']);
    
    if (addRes.status === 0) {
      console.log(`Successfully pushed ${key} to Vercel!`);
    } else {
      console.error(`Failed to push ${key}`, addRes.stderr?.toString());
    }
  }
}
