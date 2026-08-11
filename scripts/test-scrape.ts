import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { prisma } from '../src/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ExtractSchema = z.object({
  pricePerMonth: z.number().nullable(),
  sizeSqft: z.number().nullable(),
  address: z.string(),
  description: z.string()
});

async function run() {
  const query = "Minneapolis commercial real estate for lease";
  const searchUrl = `https://lite.duckduckgo.com/lite/`;
  const searchBody = new URLSearchParams({ q: query, kl: "us-en" }).toString();
  
  const res = await fetch(searchUrl, {
    method: 'POST', body: searchBody,
    headers: { "User-Agent": "Mozilla/5.0", "Content-Type": "application/x-www-form-urlencoded" }
  });
  
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const results = [];
  const rows = $("tr").toArray();
  for (let i = 0; i < rows.length; i++) {
    const el = rows[i];
    const titleEl = $(el).find(".result-snippet");
    if (titleEl.length > 0) {
      const prevRow = $(el).prev();
      const linkEl = prevRow.find(".result-link");
      results.push({ title: linkEl.text().trim(), snippet: titleEl.text().trim() });
    }
  }
  
  console.log("Scraped results:", results.length);
  console.log(results.slice(0, 2));
}

run();
