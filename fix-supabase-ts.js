const fs = require('fs');
const path = require('path');

// Create types directory if it doesn't exist
const typesDir = path.resolve(process.cwd(), 'types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir);
}

// Create supabase.d.ts file
const supabaseTypes = `
declare module '@supabase/supabase-js' {
  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            email: string;
            full_name: string;
            role: string;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            email: string;
            full_name: string;
            role: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            email?: string;
            full_name?: string;
            role?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }
}
`;

fs.writeFileSync(path.join(typesDir, 'supabase.d.ts'), supabaseTypes); 