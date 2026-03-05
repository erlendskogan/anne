// Laster innhold fra Supabase og oppdaterer nettsiden.
// Hvis Supabase ikke er konfigurert, vises den hardkodede HTML-en som vanlig.

(function () {
  if (!SUPABASE_CONFIGURED) return;

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const dagIds = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lordag', 'sondag'];

  db.from('nettside').select('data').eq('id', 1).single()
    .then(({ data: rad, error }) => {
      if (error || !rad) return;
      const d = rad.data;

      // --- Priser ---
      if (d.priser) {
        oppdaterPrisKategori('klipp',  d.priser.klipp);
        oppdaterPrisKategori('skjegg', d.priser.skjegg);
        oppdaterPrisKategori('farge',  d.priser.farge);
      }

      // --- Åpningstider ---
      if (d.aapeningstider) {
        d.aapeningstider.forEach((rad, i) => {
          const tidEl = document.getElementById('tid-' + dagIds[i]);
          const radEl = tidEl && tidEl.closest('.dag-rad');
          if (!tidEl) return;
          tidEl.textContent = rad.stengt ? 'Stengt' : rad.tid;
          if (radEl) radEl.classList.toggle('stengt', !!rad.stengt);
        });
      }

      // --- Kontakt ---
      if (d.kontakt) {
        const telEl  = document.getElementById('kontakt-telefon');
        const adrEl  = document.getElementById('kontakt-adresse');
        const telLink = document.getElementById('tel-link');
        if (telEl)   telEl.textContent = d.kontakt.telefon;
        if (adrEl)   adrEl.textContent = d.kontakt.adresse;
        if (telLink) {
          const nummer = d.kontakt.telefon.replace(/\s/g, '').split('/')[0];
          telLink.href = 'tel:' + nummer;
        }
      }
    })
    .catch(() => {
      // Stille feil – nettsiden viser hardkodet innhold som fallback
    });

  function oppdaterPrisKategori(kategori, tjenester) {
    if (!Array.isArray(tjenester)) return;
    tjenester.forEach((t, i) => {
      const prisEl     = document.getElementById('pris-' + kategori + '-' + i);
      const tjenesteEl = document.getElementById('tjeneste-' + kategori + '-' + i);
      if (prisEl)     prisEl.textContent     = t.pris;
      if (tjenesteEl) tjenesteEl.textContent = t.tjeneste;
    });
  }
})();
