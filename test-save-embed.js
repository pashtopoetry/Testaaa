import fetch from 'node-fetch';
import fs from 'fs';

async function main() {
  const url = 'https://t.me/RaeesPashtoMoveis2/123?embed=1';
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
  });
  const html = await response.text();
  fs.writeFileSync('embed.html', html);
  console.log('Saved embed.html!');
}
main();
