/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
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
  deverrouille: '-deverrouille', signe: '-signe',
  repare: '-repare', sansBlanches: '-sans-pages-blanches', aplati: '-aplati',
  assaini: '-assaini', metadonnees: '-metadonnees', comparaison: '-comparaison'
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

/* ===================== PDF → texte, sans reconnaissance ===================== */

/* Distinct de l'OCR : ici le texte est deja dans le fichier, on le releve. C'est
   instantane et exact, la ou la reconnaissance approxime. L'outil bascule de
   lui-meme vers un avertissement si la page est une image. */
async function pdfVersTexte(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await lire(f);
  const pdf = await pdfjsLib.getDocument({ data: src.slice(0) }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const tc = await pg.getTextContent();
    /* On regroupe par ligne de base pour ne pas obtenir un mot par ligne : les
       fragments d'une meme ligne partagent leur ordonnee a peu de chose pres. */
    const lignes = [];
    let cur = null;
    for (const it of tc.items){
      if (!it.str) continue;
      const y = it.transform[5];
      if (cur && Math.abs(cur.y - y) < 2.5) cur.t += it.str;
      else { cur = { y, t: it.str }; lignes.push(cur); }
    }
    pages.push(lignes.map(l => l.t.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n'));
    avance?.(i / pdf.numPages);
  }
  const vide = pages.join('').replace(/\s/g, '').length < 20;
  if (vide) throw new Error(MSG.scanne);

  const txt = pages.map((t, i) => (pdf.numPages > 1 ? `--- Page ${i + 1} ---\n` : '') + t).join('\n\n');
  if (opts.sortie === 'docx' && window.Conv?.texteVersDocx)
    return window.Conv.texteVersDocx(base(f) + '.docx', pages);
  return { nom: base(f) + '.txt', blob: new Blob([txt], { type: 'text/plain;charset=utf-8' }),
           texte: txt.slice(0, 4000) };
}

/* ============================ reparer un PDF ============================ */

/* pdf.js est beaucoup plus tolerant que la plupart des lecteurs : il accepte des
   tables de references cassees, des objets mal fermes, des longueurs fausses. On
   s'en sert comme d'un filtre — ce qu'il parvient a lire, pdf-lib le reecrit
   proprement. Ca ne ressuscite pas un fichier tronque, mais ca rattrape la
   majorite des « impossible d'ouvrir ce document ». */
async function reparerPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const src = await lire(f);
  let pagesLues = 0, parRendu = false;
  let doc;

  try {
    // Chemin rapide : si pdf-lib accepte le fichier, une simple reecriture suffit.
    const brut = await charger(src);
    doc = await PDFDocument.create();
    const copiees = await doc.copyPages(brut, brut.getPageIndices());
    copiees.forEach(p => doc.addPage(p));
    pagesLues = copiees.length;
    avance?.(0.8);
  } catch {
    doc = null;
  }

  if (!doc || !pagesLues){
    /* Chemin de secours : pdf.js lit, on redessine chaque page. Le texte devient
       une image — c'est le prix a payer quand la structure est irrecuperable, et
       la page de l'outil le dit. */
    parRendu = true;
    const pdf = await pdfjsLib.getDocument({ data: src.slice(0) }).promise;
    doc = await PDFDocument.create();
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
      doc.addPage([nat.width, nat.height])
         .drawImage(img, { x: 0, y: 0, width: nat.width, height: nat.height });
      pagesLues++;
      avance?.(i / pdf.numPages);
    }
  }

  if (!pagesLues) throw new Error(MSG.irreparable);
  const out = await doc.save();
  return { nom: base(f) + SUF.repare + '.pdf', blob: blobPdf(out),
           note: parRendu ? MSG.repareParRendu : MSG.repareStructure };
}

/* ======================= supprimer les pages blanches ====================== */

/* Une page « blanche » n'est presque jamais parfaitement blanche : un scan laisse
   du grain, une poussiere, un liseré de bord. On rend donc la page en petit, on
   ignore une marge, et on compte la proportion de pixels nettement plus sombres
   que le fond. Le seuil est reglable parce qu'un scan sale demande plus de
   tolerance qu'un PDF natif. */
async function supprimerPagesBlanches(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const SEUILS = { stricte: 0.0004, normale: 0.0015, tolerante: 0.006 };
  const seuil = SEUILS[opts.sensibilite] ?? SEUILS.normale;

  const src = await lire(f);
  const pdf = await pdfjsLib.getDocument({ data: src.slice(0) }).promise;
  const garder = [], retirees = [];

  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const vp = pg.getViewport({ scale: 0.5 });
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height));
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;

    // on ignore 3 % de marge : les bords de scan sont souvent gris
    const m = Math.round(Math.min(c.width, c.height) * 0.03);
    const d = ctx.getImageData(m, m, Math.max(1, c.width - 2 * m), Math.max(1, c.height - 2 * m)).data;
    let sombres = 0;
    for (let p = 0; p < d.length; p += 4){
      if (d[p] < 215 || d[p + 1] < 215 || d[p + 2] < 215) sombres++;
    }
    const part = sombres / (d.length / 4);
    (part > seuil ? garder : retirees).push(i - 1);
    avance?.(i / pdf.numPages * 0.9);
  }

  if (!garder.length) throw new Error(MSG.toutesBlanches);
  if (!retirees.length) return { nom: f.name, blob: f, inchange: true, note: MSG.aucuneBlanche };

  const brut = await charger(src);
  const out = await copierVers(brut, garder);
  avance?.(1);
  return { nom: base(f) + SUF.sansBlanches + '.pdf', blob: blobPdf(await out.save()),
           note: MSG.blanchesRetirees(retirees.length, retirees.map(i => i + 1).join(', ')) };
}

/* ============================= aplatir un PDF ============================= */

/* Aplatir, c'est figer ce qui etait encore interactif : champs de formulaire
   remplis, cases cochees, listes. Le contenu reste visible et imprimable, mais
   plus personne ne peut le rouvrir et le changer. */
async function aplatirPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  avance?.(0.4);

  let champs = 0;
  try {
    const form = doc.getForm();
    champs = form.getFields().length;
    if (champs) form.flatten();
  } catch (e) {
    /* Certains formulaires portent des apparences que pdf-lib ne sait pas
       regenerer. Plutot que d'echouer, on retire le formulaire : les valeurs
       deja dessinees restent a l'ecran, les champs ne sont plus modifiables. */
    try { doc.catalog.delete(PDFLib.PDFName.of('AcroForm')); } catch {}
  }
  avance?.(0.9);

  const out = await doc.save();
  return { nom: base(f) + SUF.aplati + '.pdf', blob: blobPdf(out),
           note: champs ? MSG.aplatiChamps(champs) : MSG.aplatiSansChamp };
}

/* ============================= assainir un PDF ============================ */

/* Un PDF peut embarquer du JavaScript, des fichiers joints et une action lancee
   a l'ouverture. Ce sont les vecteurs utilises par les pieces jointes piegees.
   On les retire sans toucher au contenu visible. */
async function assainirPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  const { PDFName, PDFDict } = PDFLib;
  const retires = [];
  const cat = doc.catalog;

  const oter = (dict, nom, libelle) => {
    try {
      if (dict && dict.get && dict.get(PDFName.of(nom)) !== undefined){
        dict.delete(PDFName.of(nom));
        retires.push(libelle);
      }
    } catch {}
  };

  oter(cat, 'OpenAction', MSG.actionOuverture);
  oter(cat, 'AA', MSG.actionsAuto);

  try {
    const noms = cat.get(PDFName.of('Names'));
    if (noms instanceof PDFDict){
      oter(noms, 'JavaScript', MSG.javascript);
      oter(noms, 'EmbeddedFiles', MSG.fichiersJoints);
    }
  } catch {}

  // actions automatiques posees au niveau des pages
  let pagesNettoyees = 0;
  for (const p of doc.getPages()){
    try {
      if (p.node.get(PDFName.of('AA')) !== undefined){
        p.node.delete(PDFName.of('AA'));
        pagesNettoyees++;
      }
    } catch {}
  }
  if (pagesNettoyees) retires.push(MSG.actionsPages(pagesNettoyees));
  avance?.(0.9);

  const out = await doc.save();
  return { nom: base(f) + SUF.assaini + '.pdf', blob: blobPdf(out),
           note: retires.length ? MSG.assaini(retires.join(' · ')) : MSG.rienAAssainir };
}

/* ========================= modifier les metadonnees ======================= */

async function ecrireMetadonnees(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const doc = await charger(await lire(f));
  avance?.(0.5);

  const pose = [];
  const mettre = (cle, methode, libelle) => {
    const v = String(opts[cle] ?? '').trim();
    if (!v) return;
    try { doc[methode](cle === 'motsCles' ? v.split(/[,;]\s*/).filter(Boolean) : v); pose.push(libelle); }
    catch {}
  };
  mettre('titre',    'setTitle',    'Titre');
  mettre('auteur',   'setAuthor',   'Auteur');
  mettre('sujet',    'setSubject',  'Sujet');
  mettre('motsCles', 'setKeywords', 'Mots-clés');

  /* Le producteur devient le notre : laisser « pdf-lib » renseignerait la
     bibliotheque plutot que l'outil, et pretendre qu'un autre logiciel a ecrit le
     fichier serait un faux. Chaque appel est isole : si un lecteur refuse l'un
     d'eux, les autres doivent quand meme passer. */
  for (const [m, v] of [['setProducer', 'VoilàPDF'], ['setCreator', 'VoilàPDF'],
                        ['setModificationDate', new Date()]]){
    try { doc[m](v); } catch {}
  }
  avance?.(0.95);

  if (!pose.length) throw new Error(MSG.aucunChamp);
  const out = await doc.save();
  return { nom: base(f) + SUF.metadonnees + '.pdf', blob: blobPdf(out),
           note: MSG.metaPosees(pose.join(', ')) };
}

/* =========================== comparer deux PDF =========================== */

/* Comparaison du texte, ligne a ligne, page par page. On ne compare pas les
   pixels : deux rendus identiques peuvent differer d'un antialiasing, et deux
   pages visuellement proches peuvent dire le contraire l'une de l'autre. C'est
   le texte qui porte le sens. */
async function comparerPdf(fichiers, opts = {}, avance){
  if (fichiers.length < 2) throw new Error(MSG.deuxFichiers);
  const [a, b] = fichiers;

  const lignesDe = async (f, part) => {
    const pdf = await pdfjsLib.getDocument({ data: (await lire(f)).slice(0) }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++){
      const tc = await (await pdf.getPage(i)).getTextContent();
      const lig = [];
      let cur = null;
      for (const it of tc.items){
        if (!it.str) continue;
        const y = it.transform[5];
        if (cur && Math.abs(cur.y - y) < 2.5) cur.t += it.str;
        else { cur = { y, t: it.str }; lig.push(cur); }
      }
      pages.push(lig.map(l => l.t.replace(/\s+/g, ' ').trim()).filter(Boolean));
      avance?.(part * (i / pdf.numPages));
    }
    return pages;
  };

  const pa = await lignesDe(a, 0.4);
  const pb = await lignesDe(b, 0.8);

  const rapport = [];
  rapport.push(MSG.compEntete(a.name, b.name));
  if (pa.length !== pb.length) rapport.push(MSG.compPages(pa.length, pb.length));

  let differentes = 0;
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++){
    const la = pa[i] || [], lb = pb[i] || [];
    const seulA = la.filter(x => !lb.includes(x));
    const seulB = lb.filter(x => !la.includes(x));
    if (!seulA.length && !seulB.length) continue;
    differentes++;
    rapport.push('');
    rapport.push(MSG.compPage(i + 1));
    seulA.forEach(x => rapport.push('  - ' + x));
    seulB.forEach(x => rapport.push('  + ' + x));
  }
  avance?.(1);

  if (!differentes && pa.length === pb.length)
    rapport.push('', MSG.compIdentiques);
  else
    rapport.splice(1, 0, MSG.compResume(differentes, n));

  const texte = rapport.join('\n');
  const nom = base(a) + SUF.comparaison;
  if (opts.sortie === 'pdf' && window.Conv?.proseVersPdf)
    return Object.assign(await window.Conv.proseVersPdf(nom + '.pdf', rapport.filter(l => l !== ''),
                                                        MSG.compTitre), { texte });
  return { nom: nom + '.txt', blob: new Blob([texte], { type: 'text/plain;charset=utf-8' }), texte };
}

/* --- mots des messages, traduisibles --- */
const MSG = Object.assign({
  scanne: "Ce PDF ne contient pas de texte à relever : c'est un document scanné. Passez-le par la reconnaissance de caractères.",
  irreparable: "Ce fichier est trop endommagé : aucune page n'a pu être lue.",
  repareStructure: "Structure réécrite proprement. Le texte reste sélectionnable.",
  repareParRendu: "La structure était irrécupérable : les pages ont été redessinées depuis leur rendu. Le document s'ouvre à nouveau, mais son texte est devenu une image.",
  toutesBlanches: 'Toutes les pages ont été jugées blanches : baissez la sensibilité.',
  aucuneBlanche: "Aucune page blanche détectée : le document vous est rendu tel quel.",
  blanchesRetirees: (n, l) => `${n} page(s) blanche(s) retirée(s) : ${l}.`,
  aplatiChamps: n => `${n} champ(s) de formulaire figé(s).`,
  aplatiSansChamp: "Ce document ne contenait aucun champ de formulaire ; il a simplement été réenregistré.",
  actionOuverture: "action à l'ouverture", actionsAuto: 'actions automatiques',
  javascript: 'JavaScript embarqué', fichiersJoints: 'fichiers joints',
  actionsPages: n => `actions sur ${n} page(s)`,
  assaini: l => `Retiré : ${l}.`,
  rienAAssainir: "Ce document ne contenait ni JavaScript, ni fichier joint, ni action automatique.",
  aucunChamp: 'Renseignez au moins un champ à écrire.',
  metaPosees: l => `Écrit : ${l}.`,
  deuxFichiers: 'Déposez deux PDF à comparer.',
  compTitre: 'Comparaison',
  compEntete: (a, b) => `Comparaison de « ${a} » (-) et « ${b} » (+)`,
  compResume: (d, n) => `${d} page(s) différente(s) sur ${n}.`,
  compPages: (a, b) => `Nombre de pages : ${a} contre ${b}.`,
  compPage: n => `Page ${n}`,
  compIdentiques: 'Les deux documents contiennent exactement le même texte.'
}, (typeof window !== 'undefined' && window.TEXTES && window.TEXTES.MSG_OUTILS) || {});

window.Outils = {
  compresserPdf, diviserPdf, extrairePages, supprimerPages, organiserPages,
  pivoterPdf, rognerPdf, numeroterPdf, filigranePdf, nettoyerMetadonnees,
  lireMetadonnees, deverrouillerPdf, signerPdf, ocrVersTexte, analyserPlages,
  pdfVersTexte, reparerPdf, supprimerPagesBlanches, aplatirPdf, assainirPdf,
  ecrireMetadonnees, comparerPdf
};
})();
