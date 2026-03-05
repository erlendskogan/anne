// ╔══════════════════════════════════════════════════════════╗
// ║        SUPABASE-KONFIGURASJON – FYLL INN HER            ║
// ╠══════════════════════════════════════════════════════════╣
// ║ Slik finner du disse verdiene:                           ║
// ║ 1. Gå til https://supabase.com og åpne prosjektet ditt  ║
// ║ 2. Gå til Settings → API                                ║
// ║ 3. Kopier "Project URL" og "anon public"-nøkkelen       ║
// ╚══════════════════════════════════════════════════════════╝

const SUPABASE_URL      = 'https://epbnklmtqqhdwpvligql.supabase.co';   // f.eks. https://xyzxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYm5rbG10cXFoZHdwdmxpZ3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTg0MDIsImV4cCI6MjA4ODI5NDQwMn0.LZKiZgdDiiBQxL1YMmOpzB1jzaGbbtJXc_8KmFffqJU';   // den lange "anon public"-nøkkelen

// Sjekker om konfigurasjonen er fylt inn
const SUPABASE_CONFIGURED = SUPABASE_URL !== 'FYLL-INN';
