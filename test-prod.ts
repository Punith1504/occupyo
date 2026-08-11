async function test() {
  const url = "https://occupyo.com/api/semantic-search";
  const body = JSON.stringify({ query: "warehouse in mn" });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
