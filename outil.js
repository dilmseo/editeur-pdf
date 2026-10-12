/* Pilote d'une page d'outil. La page déclare window.OUTIL_COURANT ; le reste —
   réglages, aperçu des pages, planche à signer, rognage — est monté ici d'après
   la fiche de l'outil, pour que chaque page n'embarque que ce dont elle a besoin. */
(() => {
'use strict';

const $ = id => document.getElementById(id);
const cle = window.OUTIL_COURANT;
const O = OUTILS_DATA.OUTILS[cle];
if (!O) return;

/* Tout outil reçoit (fichiers, réglages, avancement) et rend {nom, blob}. */
const APPELS = {
  pdfVersDocx:   (f, o, p) => Conv.pdfVersDocx(f[0], p),
  pdfVersXlsx:   (f, o, p) => Conv.pdfVersXlsx(f[0], p),
  pdfVersPptx:   (f, o, p) => Conv.pdfVersPptx(f[0], p),
  pdfVersJpg:    (f, o, p) => Conv.pdfVersJpg(f[0], p),
  pdfVersPng:    (f, o, p) => Conv.pdfVersPng(f[0], p),
  docxVersPdf:   (f, o, p) => Conv.docxVersPdf(f[0], p),
  xlsxVersPdf:   (f, o, p) => Conv.xlsxVersPdf(f[0], p),
  pptxVersPdf:   (f, o, p) => Conv.pptxVersPdf(f[0], p),
  imagesVersPdf: (f, o, p) => Conv.imagesVersPdf(f, p),
  fusionnerPdf:  (f, o, p) => Conv.fusionnerPdf(f, p)
};
for (const nom in (window.Outils || {})) if (typeof Outils[nom] === 'function') APPELS[nom] = Outils[nom];

let fichiers = [];
let doc = null;                 // document pdf.js courant, pour les aperçus
const etat = { pages: [], ordre: [], rotations: {}, boite: { g:0, h:0, d:0, b:0 }, signature: null };

const entree = $('fichier');
entree.accept = O.accept;
entree.multiple = !!O.multiple;

const poids = n => n < 1024 ? n + ' o'
                 : n < 1048576 ? (n / 1024).toFixed(0) + ' Ko'
                 : (n / 1048576).toFixed(1) + ' Mo';

/* ------------------------------- réglages ------------------------------- */

const reglages = {};
(function monterReglages(){
  const hote = $('reglages');
  if (!hote || !O.options?.length) return;
  for (const o of O.options){
    reglages[o.id] = o.defaut ?? '';
    const bloc = document.createElement('div');
    bloc.className = 'reglage';
    const lab = document.createElement('label');
    lab.textContent = o.label; lab.htmlFor = 'opt-' + o.id;
    bloc.append(lab);

    if (o.type === 'choix'){
      const seg = document.createElement('div');
      seg.className = 'segments';
      o.valeurs.forEach(([v, t, aide]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.dataset.v = v;
        b.innerHTML = `<b>${t}</b>` + (aide ? `<span>${aide}</span>` : '');
        if (v === reglages[o.id]) b.classList.add('on');
        b.onclick = () => {
          reglages[o.id] = v;
          [...seg.children].forEach(x => x.classList.toggle('on', x === b));
          majApercu();
        };
        seg.append(b);
      });
      bloc.append(seg);
    } else if (o.type === 'liste'){
      const s = document.createElement('select');
      s.id = 'opt-' + o.id;
      o.valeurs.forEach(([v, t]) => s.add(new Option(t, v)));
      s.value = reglages[o.id];
      s.onchange = () => { reglages[o.id] = s.value; majApercu(); };
      bloc.append(s);
    } else {
      const i = document.createElement('input');
      i.id = 'opt-' + o.id;
      i.type = o.type === 'nombre' ? 'number' : o.type === 'motdepasse' ? 'password' : 'text';
      if (o.min != null) i.min = o.min;
      if (o.max != null) i.max = o.max;
      i.placeholder = o.exemple || '';
      i.value = reglages[o.id];
      i.oninput = () => { reglages[o.id] = i.value; majApercu(); };
      bloc.append(i);
    }
    if (o.aide){ const p = document.createElement('p'); p.className = 'aide'; p.textContent = o.aide; bloc.append(p); }
    hote.append(bloc);
  }
})();

/* ------------------------- aperçu : planche de pages --------------------- */

const peut = c => (O.capacites || []).includes(c);

async function construirePages(){
  const hote = $('panneau');
  hote.innerHTML = '';
  const bytes = new Uint8Array(await fichiers[0].arrayBuffer());
  doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  etat.pages = [...Array(doc.numPages).keys()];
  etat.ordre = [...etat.pages];
  etat.rotations = {};
  const choisies = new Set(peut('selection') ? [] : etat.pages);

  const barre = document.createElement('div');
  barre.className = 'barre-pages';
  const info = document.createElement('span');
  const maj = () => {
    info.textContent = peut('selection')
      ? `${choisies.size} page(s) sélectionnée(s) sur ${doc.numPages}`
      : `${doc.numPages} page(s)`;
    reglages.pages = [...choisies].sort((a, b) => a - b);
    reglages.ordre = etat.ordre.slice();
    reglages.rotations = { ...etat.rotations };
    $('go').disabled = peut('selection') && !choisies.size;
  };
  if (peut('selection')){
    const tout = document.createElement('button');
    tout.type = 'button'; tout.className = 'mini'; tout.textContent = 'Tout sélectionner';
    tout.onclick = () => { etat.pages.forEach(i => choisies.add(i)); dessiner(); };
    const rien = document.createElement('button');
    rien.type = 'button'; rien.className = 'mini'; rien.textContent = 'Tout désélectionner';
    rien.onclick = () => { choisies.clear(); dessiner(); };
    barre.append(tout, rien);
  }
  if (peut('rotation')){
    for (const [t, a] of [['↺ Tout pivoter à gauche', -90], ['↻ Tout pivoter à droite', 90]]){
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mini'; b.textContent = t;
      b.onclick = () => { etat.pages.forEach(i => etat.rotations[i] = ((etat.rotations[i] || 0) + a + 360) % 360); dessiner(); };
      barre.append(b);
    }
  }
  if (peut('ordre')){
    const inv = document.createElement('button');
    inv.type = 'button'; inv.className = 'mini'; inv.textContent = '⇅ Inverser l\'ordre';
    inv.onclick = () => { etat.ordre.reverse(); dessiner(); };
    barre.append(inv);
  }
  barre.append(info);
  hote.append(barre);

  const grille = document.createElement('div');
  grille.className = 'planche';
  hote.append(grille);

  const rendus = {};
  async function vignette(i){
    if (rendus[i]) return rendus[i];
    const pg = await doc.getPage(i + 1);
    const vp = pg.getViewport({ scale: 1 });
    const s = Math.min(150 / vp.width, 190 / vp.height);
    const v = pg.getViewport({ scale: s });
    const c = document.createElement('canvas');
    c.width = Math.round(v.width); c.height = Math.round(v.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: v }).promise;
    return (rendus[i] = c.toDataURL('image/jpeg', 0.72));
  }

  function dessiner(){
    grille.innerHTML = '';
    etat.ordre.forEach((i, rang) => {
      const d = document.createElement('div');
      d.className = 'vignette' + (choisies.has(i) ? ' prise' : '');
      const img = document.createElement('img');
      img.alt = 'Page ' + (i + 1);
      img.style.transform = `rotate(${etat.rotations[i] || 0}deg)`;
      vignette(i).then(src => img.src = src);
      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = peut('ordre') ? `${rang + 1} (p. ${i + 1})` : `Page ${i + 1}`;
      d.append(img, n);

      if (peut('selection')) d.onclick = () => {
        choisies.has(i) ? choisies.delete(i) : choisies.add(i);
        d.classList.toggle('prise'); maj();
      };
      const cmd = document.createElement('div');
      cmd.className = 'cmd';
      if (peut('rotation')){
        const r = document.createElement('button');
        r.type = 'button'; r.title = 'Pivoter cette page'; r.textContent = '↻';
        r.onclick = e => { e.stopPropagation(); etat.rotations[i] = ((etat.rotations[i] || 0) + 90) % 360; dessiner(); };
        cmd.append(r);
      }
      if (peut('ordre')){
        const g = document.createElement('button');
        g.type = 'button'; g.title = 'Avancer'; g.textContent = '‹'; g.disabled = rang === 0;
        g.onclick = e => { e.stopPropagation(); [etat.ordre[rang-1], etat.ordre[rang]] = [etat.ordre[rang], etat.ordre[rang-1]]; dessiner(); };
        const dr = document.createElement('button');
        dr.type = 'button'; dr.title = 'Reculer'; dr.textContent = '›'; dr.disabled = rang === etat.ordre.length - 1;
        dr.onclick = e => { e.stopPropagation(); [etat.ordre[rang+1], etat.ordre[rang]] = [etat.ordre[rang], etat.ordre[rang+1]]; dessiner(); };
        cmd.prepend(g); cmd.append(dr);
      }
      if (cmd.children.length) d.append(cmd);
      grille.append(d);
    });
    maj();
  }
  dessiner();
}

/* ----------------------------- aperçu : rogner --------------------------- */

async function construireRognage(){
  const hote = $('panneau');
  hote.innerHTML = '<p class="aide">Faites glisser les bords sur l\'aperçu. Le rognage s\'applique à toutes les pages.</p>';
  const bytes = new Uint8Array(await fichiers[0].arrayBuffer());
  doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pg = await doc.getPage(1);
  const v0 = pg.getViewport({ scale: 1 });
  const s = Math.min(460 / v0.width, 560 / v0.height);
  const vp = pg.getViewport({ scale: s });
  const cadre = document.createElement('div');
  cadre.className = 'rognage';
  cadre.style.width = Math.round(vp.width) + 'px';
  const c = document.createElement('canvas');
  c.width = Math.round(vp.width); c.height = Math.round(vp.height);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  await pg.render({ canvasContext: ctx, viewport: vp }).promise;
  const zone = document.createElement('div');
  zone.className = 'zone-rogne';
  cadre.append(c, zone);
  hote.append(cadre);

  const poser = () => {
    const b = etat.boite;
    zone.style.left = b.g * 100 + '%'; zone.style.right = b.d * 100 + '%';
    zone.style.top = b.h * 100 + '%'; zone.style.bottom = b.b * 100 + '%';
    reglages.boite = { ...b };
  };
  for (const bord of ['g', 'h', 'd', 'b']){
    const p = document.createElement('i');
    p.className = 'poignee ' + bord;
    p.onmousedown = e => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      const bouge = ev => {
        const fx = Math.min(.9, Math.max(0, (ev.clientX - r.left) / r.width));
        const fy = Math.min(.9, Math.max(0, (ev.clientY - r.top) / r.height));
        if (bord === 'g') etat.boite.g = Math.min(fx, 1 - etat.boite.d - .05);
        if (bord === 'd') etat.boite.d = Math.min(1 - fx, 1 - etat.boite.g - .05);
        if (bord === 'h') etat.boite.h = Math.min(fy, 1 - etat.boite.b - .05);
        if (bord === 'b') etat.boite.b = Math.min(1 - fy, 1 - etat.boite.h - .05);
        poser();
      };
      const fin = () => { document.removeEventListener('mousemove', bouge); document.removeEventListener('mouseup', fin); };
      document.addEventListener('mousemove', bouge); document.addEventListener('mouseup', fin);
    };
    zone.append(p);
  }
  poser();
}

/* ---------------------------- aperçu : signature ------------------------- */

function construireSignature(){
  const hote = $('panneau');
  hote.innerHTML = '';
  const aide = document.createElement('p');
  aide.className = 'aide';
  aide.textContent = 'Dessinez votre signature dans le cadre, à la souris ou au doigt.';
  const c = document.createElement('canvas');
  c.className = 'planche-signature'; c.width = 760; c.height = 240;
  const ctx = c.getContext('2d');
  ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#141A24';
  let trace = false, vide = true;
  const pt = e => {
    const r = c.getBoundingClientRect();
    const s = (e.touches ? e.touches[0] : e);
    return [(s.clientX - r.left) * c.width / r.width, (s.clientY - r.top) * c.height / r.height];
  };
  const debut = e => { e.preventDefault(); trace = true; vide = false; const [x, y] = pt(e); ctx.beginPath(); ctx.moveTo(x, y); };
  const suite = e => { if (!trace) return; e.preventDefault(); const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); };
  const fin = () => { if (!trace) return; trace = false; reglages.signature = vide ? null : c.toDataURL('image/png'); };
  c.addEventListener('mousedown', debut); c.addEventListener('mousemove', suite);
  document.addEventListener('mouseup', fin);
  c.addEventListener('touchstart', debut, { passive: false });
  c.addEventListener('touchmove', suite, { passive: false });
  c.addEventListener('touchend', fin);
  const effacer = document.createElement('button');
  effacer.type = 'button'; effacer.className = 'mini'; effacer.textContent = 'Effacer';
  effacer.onclick = () => { ctx.clearRect(0, 0, c.width, c.height); vide = true; reglages.signature = null; };
  hote.append(aide, c, effacer);
}

/* --------------------------- aperçu : métadonnées ------------------------ */

async function construireMetadonnees(){
  const hote = $('panneau');
  hote.innerHTML = '<p class="aide">Voici ce que votre fichier révèle aujourd\'hui :</p>';
  const t = document.createElement('dl');
  t.className = 'metas';
  try {
    const m = await Outils.lireMetadonnees(fichiers[0]);
    let vide = true;
    for (const k in m){
      if (m[k] == null || m[k] === '') continue;
      if (k !== 'Pages') vide = false;
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = m[k];
      t.append(dt, dd);
    }
    hote.append(t);
    if (vide){
      const p = document.createElement('p');
      p.className = 'aide';
      p.textContent = "Ce document ne porte déjà aucune métadonnée identifiante.";
      hote.append(p);
    }
  } catch { hote.append(document.createTextNode('Métadonnées illisibles.')); }
}

async function majApercu(){ /* les réglages seuls n'exigent aucun redessin */ }

async function construirePanneau(){
  const hote = $('panneau');
  if (!hote || !O.panneau || !fichiers.length) return;
  hote.hidden = false;
  hote.innerHTML = '<p class="aide">Lecture du document…</p>';
  try {
    if (O.panneau === 'pages') await construirePages();
    else if (O.panneau === 'rogner') await construireRognage();
    else if (O.panneau === 'signature') construireSignature();
    else if (O.panneau === 'metadonnees') await construireMetadonnees();
  } catch (e) {
    hote.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'aide';
    p.textContent = 'Aperçu indisponible : ' + (e.message || e) + " — l'outil fonctionne quand même.";
    hote.append(p);
  }
}

/* ------------------------------ liste et flux ---------------------------- */

function cacher(){
  $('fini').hidden = true; $('err').hidden = true;
  $('barre').hidden = true; $('etat').hidden = true;
  $('barre').firstElementChild.style.width = '0%';
  const a = $('dl');
  if (a.href.startsWith('blob:')) URL.revokeObjectURL(a.href);
}

function majListe(){
  const ul = $('liste');
  ul.innerHTML = '';
  fichiers.forEach((f, i) => {
    const li = document.createElement('li');
    const n = document.createElement('span'); n.textContent = f.name;
    const t = document.createElement('span'); t.className = 'taille'; t.textContent = poids(f.size);
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Retirer';
    b.onclick = () => { fichiers.splice(i, 1); apresChangement(); };
    li.append(n, t, b); ul.append(li);
  });
  $('go').disabled = !fichiers.length;
  $('go').textContent = O.actionTexte || (fichiers.length > 1 ? `Traiter les ${fichiers.length} fichiers` : 'Convertir');
}

function apresChangement(){
  cacher(); majListe();
  const p = $('panneau');
  if (p){ p.hidden = !fichiers.length; p.innerHTML = ''; }
  if (fichiers.length) construirePanneau();
  const r = $('reglages');
  if (r) r.hidden = !fichiers.length;
}

function ajouter(liste){
  const fs = [...liste];
  if (!fs.length) return;
  fichiers = O.multiple ? fichiers.concat(fs) : [fs[0]];
  apresChangement();
}

entree.onchange = e => ajouter(e.target.files);
$('encore').onclick = () => { fichiers = []; entree.value = ''; apresChangement(); };

['dragover', 'drop'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
document.addEventListener('dragover', () => $('zone').classList.add('over'));
document.addEventListener('dragleave', e => { if (!e.relatedTarget) $('zone').classList.remove('over'); });
document.addEventListener('drop', e => { $('zone').classList.remove('over'); ajouter(e.dataTransfer?.files || []); });

$('go').onclick = async () => {
  if (!fichiers.length) return;
  cacher();
  $('go').disabled = true;
  $('barre').hidden = false; $('etat').hidden = false;
  $('etat').textContent = 'Lecture du fichier…';
  const avance = p => {
    $('barre').firstElementChild.style.width = Math.round(p * 100) + '%';
    $('etat').textContent = 'Traitement… ' + Math.round(p * 100) + ' %';
  };
  try {
    reglages.onOcr = avance;
    const r = await APPELS[O.fonction](fichiers, reglages, avance);
    avance(1);
    $('barre').hidden = true; $('etat').hidden = true;
    let detail = r.nom + ' — ' + poids(r.blob.size);
    if (r.avant && r.apres && !r.inchange)
      detail += ` · ${poids(r.avant)} → ${poids(r.apres)}, soit ${Math.round((1 - r.apres / r.avant) * 100)} % de moins`;
    $('fini-nom').textContent = detail;
    $('fini-note').textContent = r.inchange
      ? "Ce fichier était déjà au plus juste : le compresser l'aurait alourdi, nous vous rendons l'original."
      : '';
    $('fini-note').hidden = !r.inchange;
    $('dl').href = URL.createObjectURL(r.blob);
    $('dl').download = r.nom;
    $('fini').hidden = false;
    $('fini').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    console.error(e);
    $('barre').hidden = true; $('etat').hidden = true;
    $('err').textContent = (e.message || e);
    $('err').hidden = false;
  }
  $('go').disabled = false;
};

majListe();
if ($('reglages')) $('reglages').hidden = true;
if ($('panneau')) $('panneau').hidden = true;
})();
