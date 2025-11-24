const { execSync } = require('child_process');

try {
  console.log('Starting robust build process...');
  
  // Fix any pre-build issues
  execSync('node fix-supabase-ts.js', { stdio: 'inherit' });
  execSync('node remove-babelrc.js', { stdio: 'inherit' });
  execSync('node scripts/copy-fonts.js', { stdio: 'inherit' });
  execSync('node scripts/remove-conflicting-routes.js', { stdio: 'inherit' });
  
  // Run the actual build
  execSync('next build', { stdio: 'inherit' });
  
  // Apply any post-build fixes
  execSync('node scripts/fix-self-not-defined.js', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 