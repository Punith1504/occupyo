const { spawn } = require('child_process');

async function main() {
  console.log("Starting Next.js server...");
  const server = spawn('npm', ['run', 'dev'], { shell: true });
  
  server.stdout.on('data', (data) => {
    console.log(`SERVER OUT: ${data}`);
  });
  server.stderr.on('data', (data) => {
    console.error(`SERVER ERR: ${data}`);
  });

  // Wait 15 seconds for server to start
  await new Promise(r => setTimeout(r, 15000));

  console.log("Sending search request...");
  try {
    const res = await fetch("http://localhost:3000/api/semantic-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "warehouse in mn" })
    });
    const text = await res.text();
    console.log(`FETCH STATUS: ${res.status}`);
    console.log(`FETCH RESPONSE: ${text}`);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }

  // Kill server
  console.log("Killing server...");
  server.kill();
  process.exit(0);
}

main();
