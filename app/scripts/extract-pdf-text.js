import fs from 'fs';
import pdf from 'pdf-parse';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/extract-pdf-text.js <absolute-pdf-path>');
    process.exit(1);
  }
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    console.log('--- PDF TEXT START ---');
    console.log(data.text);
    console.log('--- PDF TEXT END ---');
  } catch (err) {
    console.error('Failed to parse PDF:', err.message);
    process.exit(2);
  }
}

main();
