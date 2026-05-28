/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const fs = require('fs');
/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/punit/OneDrive/Desktop/occupyo/src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/role !== "OWNER"/g, 'role !== "OWNER" && user.role !== "ADMIN"');
  content = content.replace(/role !== "TENANT"/g, 'role !== "TENANT" && user.role !== "ADMIN"');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});
