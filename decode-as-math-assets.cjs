const fs = require('fs');
const directory = 'public/lesson-assets/as-math';
for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.b64'))) {
  const source = fs.readFileSync(`${directory}/${file}`, 'utf8');
  fs.writeFileSync(`${directory}/${file.slice(0, -4)}`, Buffer.from(source, 'base64'));
}

