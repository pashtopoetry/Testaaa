import fetch from 'node-fetch';
import fs from 'fs';

async function main() {
  const url = 'https://t.me/s/RaeesPashtoMoveis2/123';
  const response = await fetch(url);
  const html = await response.text();
  fs.writeFileSync('telegram.html', html);
  console.log('Saved telegram.html!');
}
main();
