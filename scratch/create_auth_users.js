const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually from .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
  'owner@caterflow.com',
  'admin@caterflow.com',
  'kitchen@caterflow.com',
  'logistic@caterflow.com'
];
const password = 'caterflow123';

async function registerAll() {
  console.log('Memulai pendaftaran otomatis ke Supabase Auth...');
  for (const email of users) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          console.log(`[Info] ${email} sudah terdaftar sebelumnya.`);
        } else {
          console.error(`[Error] Gagal mendaftarkan ${email}:`, error.message);
        }
      } else {
        console.log(`[Sukses] Berhasil mendaftarkan ${email}`);
      }
    } catch (err) {
      console.error(`[Error] Kesalahan sistem untuk ${email}:`, err);
    }
  }
  console.log('Proses selesai.');
}

registerAll();
