import fs from 'fs';

const html = fs.readFileSync('telegram.html', 'utf8');

// Find occurrences of "123" or similar
const lines = html.split('\n');
console.log('Total lines:', lines.length);

const matchedLines = [];
lines.forEach((line, i) => {
  if (line.includes('RaeesPashtoMoveis2') || line.includes('/123') || line.includes('video') || line.includes('tgme_widget_message')) {
    matchedLines.push({ index: i + 1, text: line.trim() });
  }
});

console.log('Matches found:', matchedLines.length);
matchedLines.slice(0, 30).forEach(m => {
  console.log(`Line ${m.index}: ${m.text.substring(0, 150)}`);
});
