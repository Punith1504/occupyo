const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/app/dashboard/**/*.{ts,tsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/user\.role !== "ADMIN"/g, '(user.role as string) !== "ADMIN"')
    .replace(/user\.role !== "OWNER"/g, '(user.role as string) !== "OWNER"')
    .replace(/user\.role !== "TENANT"/g, '(user.role as string) !== "TENANT"');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', file);
  }
});
