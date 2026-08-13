const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/prisma\.lease/g, 'prisma.booking');
      content = content.replace(/prisma\.image/g, 'prisma.media');
      content = content.replace(/LeaseStatus\.ACTIVE/g, 'BookingStatus.ACTIVE');
      content = content.replace(/LeaseStatus\.APPROVED/g, 'BookingStatus.APPROVED');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
