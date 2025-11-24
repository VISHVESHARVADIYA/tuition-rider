const fs = require('fs');
const path = require('path');

const babelrcPath = path.resolve(process.cwd(), '.babelrc');
if (fs.existsSync(babelrcPath)) {
  fs.unlinkSync(babelrcPath);
  console.log('Removed .babelrc file');
} 