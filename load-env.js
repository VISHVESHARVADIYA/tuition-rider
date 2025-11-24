const fs = require('fs');
const path = require('path');

// Load .env file if it exists
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Set default values if not present
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; 