// Supabase client — loaded before main.js on every page
// The UMD bundle exposes window.supabase
const SUPABASE_URL     = 'https://pnqwrrtlonqopsexuqyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucXdycnRsb25xb3BzZXh1cXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjk5NDYsImV4cCI6MjA5MTg0NTk0Nn0.IE-2ol419ohQHInKv6LZ_PritfiX---O-B10DnmybsE';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
