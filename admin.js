// ============================================================
//  Admin-panel – Annes Herrefrisør
//  Håndterer innlogging, lasting av innhold og lagring til
//  Supabase.
// ============================================================

const DAGSNAVN = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

const STANDARDINNHOLD = {
  priser: {
    klipp: [
      { tjeneste: 'Herreklipp',         pris: '310 – 645,-' },
      { tjeneste: 'Studentklipp',       pris: '515,-' },
      { tjeneste: 'Barn opp til 12 år', pris: '515,-' }
    ],
    skjegg: [
      { tjeneste: 'Skjegg',        pris: '200 – 290,-' },
      { tjeneste: 'Vask',          pris: '100,-' },
      { tjeneste: 'Vask og føhn',  pris: '235,-' }
    ],
    farge: [
      { tjeneste: 'Striping',               pris: '580 – 740,-' },
      { tjeneste: 'Striping av hele håret', pris: '740 – 1020,-' },
      { tjeneste: 'Farging',                pris: '670 – 1050,-' }
    ]
  },
  aapeningstider: [
    { dag: 'Mandag',  tid: '09:00 – 17:00', stengt: false },
    { dag: 'Tirsdag', tid: '09:00 – 17:00', stengt: false },
    { dag: 'Onsdag',  tid: '09:00 – 17:00', stengt: false },
    { dag: 'Torsdag', tid: '09:00 – 17:00', stengt: false },
    { dag: 'Fredag',  tid: '09:00 – 16:00', stengt: false },
    { dag: 'Lørdag',  tid: 'Stengt',        stengt: true },
    { dag: 'Søndag',  tid: 'Stengt',        stengt: true }
  ],
  kontakt: {
    telefon: '73 52 09 40 / 919 97 424',
    adresse: 'Prinsens gt. 12, 7012 Trondheim'
  }
};

// --- Elementer ---
const setupGuide    = document.getElementById('setup-guide');
const loginSeksjon  = document.getElementById('login-seksjon');
const editorSeksjon = document.getElementById('editor-seksjon');
const loginForm     = document.getElementById('login-form');
const loginFeil     = document.getElementById('login-feil');
const loginBtn      = document.getElementById('login-btn');
const btnLoggUt     = document.getElementById('btn-logg-ut');
const brukerNavn    = document.getElementById('bruker-navn');
const btnLagre      = document.getElementById('btn-lagre');
const statusMelding = document.getElementById('status-melding');

function visSeksjon(seksjon) {
  [setupGuide, loginSeksjon, editorSeksjon].forEach(el => el.classList.remove('synlig'));
  seksjon.classList.add('synlig');
}

// --- Ikke konfigurert ---
if (!SUPABASE_CONFIGURED) {
  visSeksjon(setupGuide);
} else {

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  visSeksjon(loginSeksjon);

  // --- Sjekk om allerede innlogget ---
  db.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      brukerNavn.textContent = session.user.email;
      visSeksjon(editorSeksjon);
      lastInnhold();
    }
  });

  // Lytt på endringer i innloggingstilstand
  db.auth.onAuthStateChange((event, session) => {
    if (session) {
      brukerNavn.textContent = session.user.email;
      visSeksjon(editorSeksjon);
      lastInnhold();
    } else {
      brukerNavn.textContent = '';
      visSeksjon(loginSeksjon);
    }
  });

  // --- Innlogging ---
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginFeil.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logger inn…';

    const epost  = document.getElementById('epost').value.trim();
    const passord = document.getElementById('passord').value;

    const { error } = await db.auth.signInWithPassword({ email: epost, password: passord });

    if (error) {
      loginFeil.textContent = tolkFeil(error.message);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Logg inn';
    }
  });

  // --- Logg ut ---
  btnLoggUt.addEventListener('click', () => db.auth.signOut());

  // --- Last eksisterende innhold inn i skjemaet ---
  async function lastInnhold() {
    const { data, error } = await db
      .from('nettside')
      .select('data')
      .eq('id', 1)
      .single();

    fyllSkjema(!error && data ? data.data : STANDARDINNHOLD);
  }

  function fyllSkjema(d) {
    // Priser
    ['klipp', 'skjegg', 'farge'].forEach(kat => {
      const tjenester = d.priser?.[kat] ?? STANDARDINNHOLD.priser[kat];
      tjenester.forEach((t, i) => {
        const rad = document.querySelector(`.pris-rad[data-kat="${kat}"][data-idx="${i}"]`);
        if (!rad) return;
        rad.querySelector('.input-tjeneste').value = t.tjeneste;
        rad.querySelector('.input-pris').value     = t.pris;
      });
    });

    // Åpningstider
    const timer = d.aapeningstider ?? STANDARDINNHOLD.aapeningstider;
    timer.forEach((rad, i) => {
      const input = document.querySelector(`.input-tid[data-dag="${i}"]`);
      if (input) input.value = rad.stengt ? 'Stengt' : rad.tid;
    });

    // Kontakt
    const kontakt = d.kontakt ?? STANDARDINNHOLD.kontakt;
    document.getElementById('input-telefon').value = kontakt.telefon;
    document.getElementById('input-adresse').value = kontakt.adresse;
  }

  // --- Lagre ---
  btnLagre.addEventListener('click', async () => {
    btnLagre.disabled = true;
    btnLagre.textContent = 'Lagrer…';
    statusMelding.textContent = '';
    statusMelding.className = 'status-melding';

    const { error } = await db
      .from('nettside')
      .upsert({ id: 1, data: lesSkjema() });

    if (error) {
      statusMelding.textContent = '✗ Noe gikk galt – prøv igjen.';
      statusMelding.classList.add('feil');
      console.error(error);
    } else {
      statusMelding.textContent = '✓ Endringer lagret!';
      statusMelding.classList.add('suksess');
    }

    btnLagre.disabled = false;
    btnLagre.textContent = 'Lagre endringer';
    setTimeout(() => { statusMelding.textContent = ''; }, 5000);
  });

  function lesSkjema() {
    const priser = {};
    ['klipp', 'skjegg', 'farge'].forEach(kat => {
      priser[kat] = [0, 1, 2].map(i => {
        const rad = document.querySelector(`.pris-rad[data-kat="${kat}"][data-idx="${i}"]`);
        return {
          tjeneste: rad.querySelector('.input-tjeneste').value.trim(),
          pris:     rad.querySelector('.input-pris').value.trim()
        };
      });
    });

    const aapeningstider = DAGSNAVN.map((dag, i) => {
      const input  = document.querySelector(`.input-tid[data-dag="${i}"]`);
      const tid    = input ? input.value.trim() : '';
      const stengt = tid.toLowerCase() === 'stengt' || tid === '';
      return { dag, tid: stengt ? 'Stengt' : tid, stengt };
    });

    const kontakt = {
      telefon: document.getElementById('input-telefon').value.trim(),
      adresse: document.getElementById('input-adresse').value.trim()
    };

    return { priser, aapeningstider, kontakt };
  }

  function tolkFeil(melding) {
    if (melding.includes('Invalid login'))  return 'Feil e-post eller passord.';
    if (melding.includes('Email not confirmed')) return 'E-posten er ikke bekreftet ennå.';
    if (melding.includes('Too many requests')) return 'For mange forsøk – vent litt og prøv igjen.';
    return 'Noe gikk galt. Sjekk e-post og passord.';
  }
}
