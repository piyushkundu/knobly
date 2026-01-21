import fs from 'fs';

const path = 'g:/My Drive/newwebtttttt/htdocs-20260117T043853Z-3-001/htdocs/admin.html';

let content = fs.readFileSync(path, 'utf8');

// Fix the broken template string
const brokenPattern = /\{\{ b\.description \|\| 'No\r?\n\s+description' \}\}/g;
const fixedString = "{{ b.description || 'No description' }}";

content = content.replace(brokenPattern, fixedString);

fs.writeFileSync(path, content);
console.log('Fixed!');
