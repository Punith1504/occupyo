const cheerio = require('cheerio');

async function testDDG() {
  const searchUrl = `https://lite.duckduckgo.com/lite/`;
  const searchBody = new URLSearchParams({
    q: "warehouse in rochester Minnesota commercial real estate for lease",
    kl: "us-en"
  }).toString();

  const res = await fetch(searchUrl, {
    method: 'POST',
    body: searchBody,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  const html = await res.text();
  console.log("Response OK:", res.ok);
  console.log("HTML length:", html.length);
  
  const $ = cheerio.load(html);
  
  const snippets = $(".result-snippet").length;
  const links = $(".result-link").length;
  console.log("Snippets found:", snippets);
  console.log("Links found:", links);

  const mockProperties = [];
  const rows = $("tr").toArray();
  for (let i = 0; i < rows.length; i++) {
      if (mockProperties.length >= 3) break;
      const el = rows[i];
      const titleEl = $(el).find(".result-snippet");
      if (titleEl.length > 0) {
        const prevRow = $(el).prev();
        const linkEl = prevRow.find(".result-link");
        const title = linkEl.text().trim();
        let url = linkEl.attr("href") || "";
        console.log("Found:", { title, url, snippet: titleEl.text().trim() });
      }
  }
}

testDDG().catch(console.error);
