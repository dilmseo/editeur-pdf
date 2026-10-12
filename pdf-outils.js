/* Opérations sur les PDF eux-mêmes : compresser, découper, réorganiser, annoter.
   pdf-lib recopie les pages sans les réencoder, donc la plupart de ces outils ne
   perdent rien. Les deux exceptions — compresser et déverrouiller — passent par un
   rematriçage et le disent clairement, plutôt que de laisser croire le contraire. */
(() => {
'use strict';

const lire = f => f.arrayBuffer().then(b => new Uint8Array(b));
const blobPdf = o => new Blob([o], { type: 'application/pdf' });
const base = f => f.name.replace(/\.[^.]+$/, '');
/* Suffixes des fichiers produits, traduisibles : un anglophone ne doit pas
   recevoir un « -compresse.pdf ». */
const SUF = Object.assign({
  compresse: '-compresse', decoupe: '-decoupe', pages: '-pages', extrait: '-extrait',
  allege: '-allege', reorganise: '-reorganise', pivote: '-pivote', rogne: '-rogne',
  numerote: '-numerote', filigrane: '-filigrane', anonymise: '-anonymise',
  deverrouille: '-deverrouille', signe: '-signe'
}, (typeof window !== 'undefined' && window.TEXTES && window.TEXTES.SUFFIXES) || {});
const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

const charger = (bytes) => PDFDocument.load(bytes, { ignoreEncryption: true });

/* « 1,3,5-8 » → [0,2,4,5,6,7]. Les numéros sont ceux de l'utilisateur, donc à
   partir de 1 ; on rend des indices à partir de 0, dédoublonnés et bornés. */
function analyserPlages(txt, n){
  const out = new Set();
  for (const bloc of String(txt || '').split(/[,;\s]+/)){
    if (!bloc) continue;
    const m = /^(\d+)\s*(?:[-–à]\s*(\d+))?$/.exec(bloc.trim());
    if (!m) continue;
    const a = Math.max(1, +m[1]);
    const b = m[2] ? Math.min(n, +m[2]) : Math.min(n, a);
    for (let i = a; i <= b; i++) out.add(i - 1);
  }
  return [...out].sort((x, y) => x - y);
}

async function copierVers(src, indices){
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  return out;
}

/* ------------------------------ compresser ------------------------------ */

async function compresserPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const NIVEAUX = { forte: [96, 0.55], moyenne: [132, 0.72], douce: [170, 0.85] };
  const [dpi, qualite] = NIVEAUX[opts.niveau] || NIVEAUX.moyenne;
  const src = await lire(f);
  const pdf = await pdfjsLib.getDocument({ data: src.slice(0) }).promise;
  const doc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const nat = pg.getViewport({ scale: 1 });
    const vp = pg.getViewport({ scale: dpi / 72 });
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height));
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    const b = await new Promise(r => c.toBlob(r, 'image/jpeg', qualite));
    const img = await doc.embedJpg(new Uint8Array(await b.arrayBuffer()));
    const page = doc.addPage([nat.width, nat.height]);
    page.drawImage(img, { x: 0, y: 0, width: nat.width, height: nat.height });
    avance?.(i / pdf.numPages);
  }
  const out = await doc.save();

  // Un PDF de texte pur est déjà très compact : le rematricer l'alourdirait.
  // Dans ce cas on rend l'original et on le dit, au lieu de livrer pire.
  if (out.length >= src.length * 0.97){
    return { nom: f.name, blob: blobPdf(src), inchange: true,
             avant: src.length, apres: src.length };
  }
  return { nom: base(f) + SUF.compresse + '.pdf', blob: blobPdf(out),
           avant: src.length, apres: out.length };
}

/* -------------------------------- découper ------------------------------- */

async function diviserPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await charger(await lire(f));
  const n = src.getPageCount();
  const nom = base(f);

  if (opts.mode === 'plages' && String(opts.plages || '').trim()){
    const morceaux = String(opts.plages).split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const sorties = {};
    for (let k = 0; k < morceaux.length; k++){
      const idx = analyserPlages(morceaux[k], n);
      if (!idx.length) continue;
      const out = await copierVers(src, idx);
      sorties[`${nom}-${morceaux[k].replace(/[^\d-]/g, '')}.pdf`] = new Uint8Array(await out.save());
      avance?.((k + 1) / morceaux.length);
    }
    const noms = Object.keys(sorties);
    if (!noms.length) throw new Error("Aucune plage valide. Exemple attendu : 1-3, 5, 8-10");
    if (noms.length === 1) return { nom: noms[0], blob: blobPdf(sorties[noms[0]]) };
    return { nom: nom + SUF.decoupe + '.zip', blob: new Blob([fflate.zipSync(sorties)], { type: 'application/zip' }) };
  }

  if (n === 1) throw new Error("Ce document n'a qu'une page : il n'y a rien à découper.");
  const sorties = {};
  for (let i = 0; i < n; i++){
    const out = await copierVers(src, [i]);
    sorties[`${nom}-page-${String(i + 1).padStart(2, '0')}.pdf`] = new Uint8Array(await out.save());
    avance?.((i + 1) / n);
  }
  return { nom: nom + SUF.pages + '.zip', blob: new Blob([fflate.zipSync(sorties)], { type: 'application/zip' }) };
}

/* ------------------- pages : extraire, supprimer, ordonner ---------------- */

async function extrairePages(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await charger(await lire(f));
  const idx = opts.pages?.length ? opts.pages : analyserPlages(opts.plages, src.getPageCount());
  if (!idx.length) throw new Error('Sélectionnez au moins une page à extraire.');
  const out = await copierVers(src, idx);
  avance?.(1);
  return { nom: base(f) + SUF.extrait + '.pdf', blob: blobPdf(await out.save()) };
}

async function supprimerPages(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await charger(await lire(f));
  const n = src.getPageCount();
  const retirer = new Set(opts.pages?.length ? opts.pages : analyserPlages(opts.plages, n));
  if (!retirer.size) throw new Error('Sélectionnez au moins une page à supprimer.');
  const garder = [...Array(n).keys()].filter(i => !retirer.has(i));
  if (!garder.length) throw new Error('Vous ne pouvez pas supprimer toutes les pages.');
  const out = await copierVers(src, garder);
  avance?.(1);
  return { nom: base(f) + SUF.allege + '.pdf', blob: blobPdf(await out.save()) };
}

async function organiserPages(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await charger(await lire(f));
  const n = src.getPageCount();
  let ordre = opts.ordre?.length ? opts.ordre : [...Array(n).keys()];
  if (opts.inverser) ordre = [...ordre].reverse();
  const out = await copierVers(src, ordre.filter(i => i >= 0 && i < n));
  // les rotations choisies dans l'aperçu suivent la page, pas son rang
  if (opts.rotations) out.getPages().forEach((p, k) => {
    const r = opts.rotations[ordre[k]] || 0;
    if (r) p.setRotation(degrees(((p.getRotation().angle || 0) + r) % 360));
  });
  avance?.(1);
  return { nom: base(f) + SUF.reorganise + '.pdf', blob: blobPdf(await out.save()) };
}

async function pivoterPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  const global = +opts.angle || 0;
  doc.getPages().forEach((p, i) => {
    const r = (opts.rotations && opts.rotations[i] != null) ? opts.rotations[i] : global;
    if (r) p.setRotation(degrees((((p.getRotation().angle || 0) + r) % 360 + 360) % 360));
  });
  avance?.(1);
  return { nom: base(f) + SUF.pivote + '.pdf', blob: blobPdf(await doc.save()) };
}

/* --------------------------------- rogner -------------------------------- */

async function rognerPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  const b = opts.boite || { g: 0, h: 0, d: 0, b: 0 };   // fractions retirées de chaque bord
  doc.getPages().forEach(p => {
    const { width, height } = p.getSize();
    const x = width * b.g, y = height * b.b;
    const w = width * (1 - b.g - b.d), h = height * (1 - b.h - b.b);
    if (w > 10 && h > 10){
      p.setCropBox(x, y, w, h);
      p.setMediaBox(x, y, w, h);
    }
  });
  avance?.(1);
  return { nom: base(f) + SUF.rogne + '.pdf', blob: blobPdf(await doc.save()) };
}

/* ------------------------- numéroter et filigraner ------------------------ */

const COINS = {
  'bas-centre':  (w, h, tw) => [(w - tw) / 2, 28],
  'bas-droite':  (w, h, tw) => [w - tw - 40, 28],
  'bas-gauche':  (w, h, tw) => [40, 28],
  'haut-centre': (w, h, tw) => [(w - tw) / 2, h - 40],
  'haut-droite': (w, h, tw) => [w - tw - 40, h - 40],
  'haut-gauche': (w, h, tw) => [40, h - 40]
};

async function numeroterPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const taille = +opts.taille || 11;
  const debut = +opts.debut || 1;
  const pages = doc.getPages();
  const total = pages.length;
  pages.forEach((p, i) => {
    const num = debut + i;
    const txt = (opts.format === 'sur-total') ? `${num} / ${total + debut - 1}`
              : (opts.format === 'page-n')    ? `Page ${num}`
              : String(num);
    const { width, height } = p.getSize();
    const tw = police.widthOfTextAtSize(txt, taille);
    const [x, y] = (COINS[opts.position] || COINS['bas-centre'])(width, height, tw);
    p.drawText(txt, { x, y, size: taille, font: police, color: rgb(0.25, 0.28, 0.33) });
  });
  avance?.(1);
  return { nom: base(f) + SUF.numerote + '.pdf', blob: blobPdf(await doc.save()) };
}

async function filigranePdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  const police = await doc.embedFont(StandardFonts.HelveticaBold);
  const txt = (opts.texte || 'CONFIDENTIEL').slice(0, 60);
  const opacite = Math.min(1, Math.max(0.03, (+opts.opacite || 12) / 100));
  const c = opts.couleur === 'rouge' ? rgb(0.78, 0.22, 0.14)
          : opts.couleur === 'bleu'  ? rgb(0.11, 0.29, 0.8) : rgb(0.35, 0.37, 0.4);
  doc.getPages().forEach(p => {
    const { width, height } = p.getSize();
    let taille = +opts.taille || 54;
    while (taille > 6 && police.widthOfTextAtSize(txt, taille) > Math.hypot(width, height) * 0.8) taille -= 2;
    const tw = police.widthOfTextAtSize(txt, taille);
    const angle = opts.angle === 'droit' ? 0 : 35;
    const rad = angle * Math.PI / 180;
    p.drawText(txt, {
      x: width / 2 - Math.cos(rad) * tw / 2 + Math.sin(rad) * taille * 0.35,
      y: height / 2 - Math.sin(rad) * tw / 2 - Math.cos(rad) * taille * 0.35,
      size: taille, font: police, color: c, opacity: opacite, rotate: degrees(angle)
    });
  });
  avance?.(1);
  return { nom: base(f) + SUF.filigrane + '.pdf', blob: blobPdf(await doc.save()) };
}

/* ------------------------------ métadonnées ------------------------------ */

async function nettoyerMetadonnees(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  doc.setTitle(''); doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]);
  doc.setProducer(''); doc.setCreator('');
  try { doc.setCreationDate(new Date(0)); doc.setModificationDate(new Date(0)); } catch {}
  avance?.(1);
  return { nom: base(f) + SUF.anonymise + '.pdf', blob: blobPdf(await doc.save()) };
}

async function lireMetadonnees(fichier){
  const doc = await charger(await lire(fichier));
  const sur = (f, d) => { try { const v = doc[f](); return v ? String(v) : null; } catch { return d; } };
  return {
    Titre: sur('getTitle'), Auteur: sur('getAuthor'), Sujet: sur('getSubject'),
    'Mots-clés': (() => { try { return (doc.getKeywords() || '') + '' || null; } catch { return null; } })(),
    Logiciel: sur('getProducer'), 'Créé par': sur('getCreator'),
    Création: (() => { try { return doc.getCreationDate()?.toLocaleString('fr-FR') || null; } catch { return null; } })(),
    Pages: doc.getPageCount()
  };
}

/* ------------------------------ déverrouiller ----------------------------- */

async function deverrouillerPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await lire(f);
  // pdf.js sait déchiffrer, pdf-lib non : on repasse donc par le rendu des pages.
  // Le texte devient non sélectionnable — c'est annoncé sur la page de l'outil.
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: src.slice(0), password: opts.motdepasse || '' }).promise;
  } catch (e) {
    if (/password/i.test(e?.message || '') || e?.name === 'PasswordException')
      throw new Error("Ce document demande un mot de passe. Saisissez-le pour continuer.");
    throw e;
  }
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const nat = pg.getViewport({ scale: 1 });
    const vp = pg.getViewport({ scale: 2 });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const img = await doc.embedJpg(new Uint8Array(await b.arrayBuffer()));
    const page = doc.addPage([nat.width, nat.height]);
    page.drawImage(img, { x: 0, y: 0, width: nat.width, height: nat.height });
    avance?.(i / pdf.numPages);
  }
  return { nom: base(f) + SUF.deverrouille + '.pdf', blob: blobPdf(await doc.save()) };
}

/* -------------------------------- signature ------------------------------- */

async function signerPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  if (!opts.signature) throw new Error('Dessinez votre signature avant de valider.');
  const doc = await charger(await lire(f));
  const bytes = Uint8Array.from(atob(opts.signature.split(',')[1]), c => c.charCodeAt(0));
  const img = await doc.embedPng(bytes);
  const pages = doc.getPages();
  const cible = Math.min(pages.length - 1, Math.max(0, (+opts.page || pages.length) - 1));
  const p = pages[cible];
  const { width, height } = p.getSize();
  const w = width * (opts.largeur || 0.26);
  const h = w * (img.height / img.width);
  const x = width * (opts.x ?? 0.62), y = height * (opts.y ?? 0.1);
  p.drawImage(img, { x, y, width: w, height: h });
  avance?.(1);
  return { nom: base(f) + SUF.signe + '.pdf', blob: blobPdf(await doc.save()) };
}

/* ------------------------- reconnaissance de texte ------------------------ */

async function ocrVersTexte(fichiers, opts = {}, avance){
  const f = fichiers[0];
  if (typeof Tesseract === 'undefined') throw new Error('Moteur de reconnaissance indisponible sur cette page.');
  const src = await lire(f);
  const pdf = await pdfjsLib.getDocument({ data: src.slice(0) }).promise;
  const worker = await Tesseract.createWorker('fra', 1, {
    workerPath: '/vendor/tesseract-worker.min.js',
    corePath: '/vendor/', langPath: '/vendor/lang', gzip: true,
    logger: m => { if (m.status === 'recognizing text') opts.onOcr?.(m.progress); }
  });
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const vp = pg.getViewport({ scale: 3 });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    const { data } = await worker.recognize(c);
    pages.push((data.text || '').replace(/\n{3,}/g, '\n\n').trim());
    avance?.(i / pdf.numPages);
  }
  await worker.terminate();
  const txt = pages.map((t, i) => (pdf.numPages > 1 ? `--- Page ${i + 1} ---\n` : '') + t).join('\n\n');
  if (!txt.trim()) throw new Error("Aucun texte n'a pu être reconnu sur ce document.");
  if (opts.sortie === 'docx' && window.Conv?.texteVersDocx)
    return window.Conv.texteVersDocx(base(f) + '.docx', pages);
  return { nom: base(f) + '.txt', blob: new Blob([txt], { type: 'text/plain;charset=utf-8' }) };
}

window.Outils = {
  compresserPdf, diviserPdf, extrairePages, supprimerPages, organiserPages,
  pivoterPdf, rognerPdf, numeroterPdf, filigranePdf, nettoyerMetadonnees,
  lireMetadonnees, deverrouillerPdf, signerPdf, ocrVersTexte, analyserPlages
};
})();
