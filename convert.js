/* Moteur de conversion, entièrement côté navigateur.
   Les formats Office sont des archives ZIP de fichiers XML : fflate les ouvre et
   les referme, DOMParser lit le XML, pdf.js lit les PDF et pdf-lib les écrit.
   Aucun octet ne sort de la machine — c'est la contrainte qui fixe la fidélité :
   on reconstruit le contenu, pas la maquette exacte. */
(() => {
'use strict';

const EMU   = 12700;                      // unités Office par point typographique
const te    = new TextEncoder();
const u8    = s => te.encode(s);
const texte = b => new TextDecoder('utf-8').decode(b);
const esc   = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const XML   = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const zip   = f => fflate.zipSync(f, { level: 6 });
const dezip = b => fflate.unzipSync(b);
const lire  = f => f.arrayBuffer().then(b => new Uint8Array(b));
const xml   = s => new DOMParser().parseFromString(s, 'application/xml');
const sousNom = (nom, ext) => nom.replace(/\.[^.]+$/, '') + '.' + ext;

/* Les nœuds Office portent des espaces de noms : on cherche par nom local. */
const tous = (n, local) => [...n.getElementsByTagName('*')].filter(e => e.localName === local);
const un   = (n, local) => tous(n, local)[0] || null;
const att  = (e, nom) => {
  if (!e) return null;
  for (const a of e.attributes) if (a.localName === nom) return a.value;
  return null;
};
/* Attention : dans <p:sldId id="256" r:id="rId2"/>, les deux attributs ont le
   même nom local « id ». Il faut donc exiger l'espace de noms des relations,
   sinon on récupère le numéro de diapositive au lieu de la relation. */
const relId = e => {
  if (!e) return null;
  for (const a of e.attributes)
    if (a.localName === 'id' && (a.prefix === 'r' || (a.namespaceURI || '').includes('/relationships')))
      return a.value;
  return null;
};

/* ============================ lecture des PDF ============================ */

async function ouvrirPdf(bytes){
  return pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
}

async function rendrePages(bytes, echelle, onProgres){
  const pdf = await ouvrirPdf(bytes);
  const out = [];
  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const vp = pg.getViewport({ scale: echelle });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    out.push({ canvas: c, largeur: vp.width / echelle, hauteur: vp.height / echelle });
    onProgres?.(i / pdf.numPages);
  }
  return out;
}

/* Fragments d'une page, regroupés par ligne de base. `coupures` à true garde
   les blocs séparés dès qu'un blanc large les sépare : c'est ce qui permet de
   retrouver des colonnes dans un tableau. */
async function fragments(bytes, coupures, onProgres){
  const pdf = await ouvrirPdf(bytes);
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++){
    const pg = await pdf.getPage(i);
    const tc = await pg.getTextContent();
    const vue = pg.view;
    const lignes = [];
    let cur = null;
    for (const it of tc.items){
      if (!it.str || !it.str.trim()) continue;
      const tr = it.transform;
      const size = Math.hypot(tr[0], tr[1]) || Math.hypot(tr[2], tr[3]) || 10;
      const x = tr[4], y = tr[5], w = it.width || 0;
      const st = tc.styles?.[it.fontName] || {};
      const ff = (st.fontFamily || '').toLowerCase();
      const serif = ff.includes('serif') && !ff.includes('sans');
      const trou = cur ? x - (cur.x + cur.w) : 0;
      const suite = cur && Math.abs(cur.y - y) < size * 0.35
                        && trou > -size * 0.8
                        && trou < size * (coupures ? 1.2 : 2.5);
      if (suite){
        if (trou > size * 0.17 && !/\s$/.test(cur.texte) && !/^\s/.test(it.str)) cur.texte += ' ';
        cur.texte += it.str;
        cur.w = (x + w) - cur.x;
      } else {
        cur = { texte: it.str, x, y, w, size, serif };
        lignes.push(cur);
      }
    }
    // ordre de lecture : de haut en bas, puis de gauche à droite
    lignes.sort((a, b) => Math.abs(a.y - b.y) > 2.5 ? b.y - a.y : a.x - b.x);
    pages.push({ lignes, largeur: vue[2] - vue[0], hauteur: vue[3] - vue[1] });
    onProgres?.(i / pdf.numPages);
  }
  return pages;
}

const mediane = t => {
  if (!t.length) return 0;
  const s = [...t].sort((a, b) => a - b);
  return s[s.length >> 1];
};

/* ========================= PDF → images (PNG, JPG) ======================== */

const versBlob = (c, type, q) => new Promise(r => c.toBlob(r, type, q));

async function pdfVersImages(fichier, type, onProgres){
  const pages = await rendrePages(await lire(fichier), 2, onProgres);
  const ext = type === 'image/jpeg' ? 'jpg' : 'png';
  const base = fichier.name.replace(/\.[^.]+$/, '');
  const sorties = [];
  for (let i = 0; i < pages.length; i++)
    sorties.push({ nom: `${base}-page-${i + 1}.${ext}`,
                   blob: await versBlob(pages[i].canvas, type, 0.92) });
  if (sorties.length === 1) return sorties[0];
  const entrees = {};
  for (const s of sorties) entrees[s.nom] = new Uint8Array(await s.blob.arrayBuffer());
  return { nom: `${base}-images.zip`, blob: new Blob([zip(entrees)], { type: 'application/zip' }) };
}

/* ========================= images → PDF ========================= */

async function imagesVersPdf(fichiers){
  const doc = await PDFLib.PDFDocument.create();
  for (const f of fichiers){
    let bytes = await lire(f), type = f.type || '';
    if (!/png|jpe?g/i.test(type) && !/\.(png|jpe?g)$/i.test(f.name)){
      // format exotique (webp, gif…) : on le repasse en PNG par le canevas
      const img = await chargerImage(URL.createObjectURL(f));
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      bytes = new Uint8Array(await (await versBlob(c, 'image/png')).arrayBuffer());
      type = 'image/png';
    }
    const png = /png/i.test(type) || /\.png$/i.test(f.name);
    const img = png ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const base = fichiers.length === 1 ? fichiers[0].name.replace(/\.[^.]+$/, '') : 'images';
  return { nom: base + '.pdf', blob: new Blob([await doc.save()], { type: 'application/pdf' }) };
}

const chargerImage = src => new Promise((ok, non) => {
  const i = new Image(); i.onload = () => ok(i); i.onerror = non; i.src = src;
});

/* ========================= PDF → Word (.docx) ========================= */

function paquetDocx(corps, medias, rels){
  const f = {
    '[Content_Types].xml': u8(XML +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Default Extension="png" ContentType="image/png"/>' +
      '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>'),
    '_rels/.rels': u8(XML +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>'),
    'word/document.xml': u8(XML +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
      'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<w:body>' + corps +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>' +
      '</w:body></w:document>'),
    'word/_rels/document.xml.rels': u8(XML +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      (rels || '') + '</Relationships>')
  };
  for (const nom in (medias || {})) f['word/media/' + nom] = medias[nom];
  return zip(f);
}

async function pdfVersDocx(fichier, onProgres){
  const pages = await fragments(await lire(fichier), false, onProgres);
  let corps = '';
  pages.forEach((pg, i) => {
    const med = mediane(pg.lignes.map(l => l.size)) || 11;
    for (const l of pg.lignes){
      // Un corps de texte nettement plus grand que la médiane de la page est
      // presque toujours un titre : c'est la seule graisse qu'on peut déduire.
      const titre = l.size > med * 1.18;
      const police = l.serif ? 'Times New Roman' : 'Calibri';
      corps += '<w:p><w:pPr><w:spacing w:after="80" w:line="259" w:lineRule="auto"/></w:pPr>'
             + `<w:r><w:rPr><w:rFonts w:ascii="${police}" w:hAnsi="${police}"/>`
             + `<w:sz w:val="${Math.max(8, Math.round(l.size * 2))}"/>`
             + `<w:szCs w:val="${Math.max(8, Math.round(l.size * 2))}"/>`
             + (titre ? '<w:b/>' : '')
             + `</w:rPr><w:t xml:space="preserve">${esc(l.texte)}</w:t></w:r></w:p>`;
    }
    if (i < pages.length - 1)
      corps += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  });
  if (!corps) corps = '<w:p><w:r><w:t>Aucun texte trouvé dans ce PDF.</w:t></w:r></w:p>';
  return { nom: sousNom(fichier.name, 'docx'),
           blob: new Blob([paquetDocx(corps)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) };
}

/* ========================= PDF → Excel (.xlsx) ========================= */

const colonne = n => { let s = ''; n++; while (n > 0){ const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; } return s; };

function paquetXlsx(feuilles){
  const onglets = feuilles.map((f, i) =>
    `<sheet name="${esc(f.nom)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('');
  const relsWb = feuilles.map((f, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('');
  const types = feuilles.map((f, i) =>
    `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  const f = {
    '[Content_Types].xml': u8(XML +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      types + '</Types>'),
    '_rels/.rels': u8(XML +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>'),
    'xl/workbook.xml': u8(XML +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<sheets>${onglets}</sheets></workbook>`),
    'xl/_rels/workbook.xml.rels': u8(XML +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      relsWb + '</Relationships>')
  };
  feuilles.forEach((feuille, i) => {
    const lignes = feuille.lignes.map((cells, r) => {
      const cs = cells.map((v, c) => v === '' || v == null ? '' :
        `<c r="${colonne(c)}${r + 1}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`).join('');
      return `<row r="${r + 1}">${cs}</row>`;
    }).join('');
    f[`xl/worksheets/sheet${i + 1}.xml`] = u8(XML +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      `<sheetData>${lignes}</sheetData></worksheet>`);
  });
  return zip(f);
}

async function pdfVersXlsx(fichier, onProgres){
  const pages = await fragments(await lire(fichier), true, onProgres);
  const feuilles = pages.map((pg, i) => {
    // Les x de départ se regroupent en colonnes : une tolérance d'un demi-cadratin
    // suffit à recoller les cellules d'une même colonne malgré le crénage.
    const xs = pg.lignes.map(l => l.x).sort((a, b) => a - b);
    const bornes = [];
    for (const x of xs){
      if (!bornes.length || x - bornes[bornes.length - 1] > 9) bornes.push(x);
    }
    const colonneDe = x => {
      let best = 0, d = Infinity;
      bornes.forEach((b, k) => { const e = Math.abs(b - x); if (e < d){ d = e; best = k; } });
      return best;
    };
    const rangs = [];
    let yCourant = null, rang = null;
    for (const l of pg.lignes){
      if (yCourant === null || Math.abs(yCourant - l.y) > Math.max(2.5, l.size * 0.5)){
        rang = []; rangs.push(rang); yCourant = l.y;
      }
      const c = colonneDe(l.x);
      rang[c] = (rang[c] ? rang[c] + ' ' : '') + l.texte;
    }
    const large = rangs.reduce((m, r) => Math.max(m, r.length), 0);
    return { nom: 'Page ' + (i + 1),
             lignes: rangs.map(r => Array.from({ length: large }, (_, k) => r[k] ?? '')) };
  });
  return { nom: sousNom(fichier.name, 'xlsx'),
           blob: new Blob([paquetXlsx(feuilles)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) };
}

/* ========================= PDF → PowerPoint (.pptx) =========================
   Une diapositive par page, l'image de la page en plein cadre : c'est la seule
   transposition fidèle, une page PDF n'ayant pas de structure de diapositive. */

const THEME = XML +
  '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="T">' +
  '<a:themeElements><a:clrScheme name="O"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>' +
  '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2>' +
  '<a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1>' +
  '<a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>' +
  '<a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5>' +
  '<a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink>' +
  '<a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme>' +
  '<a:fontScheme name="O"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>' +
  '<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>' +
  '<a:fmtScheme name="O"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>' +
  '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>' +
  '<a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>' +
  '<a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>' +
  '<a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>' +
  '<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle>' +
  '<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>' +
  '<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>' +
  '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>' +
  '</a:fmtScheme></a:themeElements></a:theme>';

const NS_P = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
             'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
             'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';

function paquetPptx(diapos, cx, cy){
  const f = {};
  const idsDiapo = diapos.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join('');
  const relsPres = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>' +
    diapos.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join('') +
    `<Relationship Id="rId${diapos.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`;

  f['[Content_Types].xml'] = u8(XML +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="png" ContentType="image/png"/>' +
    '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>' +
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>' +
    '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' +
    diapos.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('') +
    '</Types>');

  f['_rels/.rels'] = u8(XML +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>' +
    '</Relationships>');

  f['ppt/presentation.xml'] = u8(XML +
    `<p:presentation ${NS_P}>` +
    '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>' +
    `<p:sldIdLst>${idsDiapo}</p:sldIdLst>` +
    `<p:sldSz cx="${cx}" cy="${cy}"/><p:notesSz cx="${cy}" cy="${cx}"/></p:presentation>`);
  f['ppt/_rels/presentation.xml.rels'] = u8(XML +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + relsPres + '</Relationships>');
  f['ppt/theme/theme1.xml'] = u8(THEME);

  f['ppt/slideMasters/slideMaster1.xml'] = u8(XML +
    `<p:sldMaster ${NS_P}><p:cSld><p:spTree>` +
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr/></p:spTree></p:cSld>' +
    '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>' +
    '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>');
  f['ppt/slideMasters/_rels/slideMaster1.xml.rels'] = u8(XML +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>' +
    '</Relationships>');

  f['ppt/slideLayouts/slideLayout1.xml'] = u8(XML +
    `<p:sldLayout ${NS_P} type="blank" preserve="1"><p:cSld name="Vide"><p:spTree>` +
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
    '<p:grpSpPr/></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>');
  f['ppt/slideLayouts/_rels/slideLayout1.xml.rels'] = u8(XML +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>' +
    '</Relationships>');

  diapos.forEach((d, i) => {
    f[`ppt/media/image${i + 1}.png`] = d.image;
    f[`ppt/slides/slide${i + 1}.xml`] = u8(XML +
      `<p:sld ${NS_P}><p:cSld><p:spTree>` +
      '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>' +
      `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/>` +
      `<a:chOff x="0" y="0"/><a:chExt cx="${cx}" cy="${cy}"/></a:xfrm></p:grpSpPr>` +
      '<p:pic><p:nvPicPr><p:cNvPr id="2" name="Page"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>' +
      '<p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>' +
      `<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>' +
      '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');
    f[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = u8(XML +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.png"/>` +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>' +
      '</Relationships>');
  });
  return zip(f);
}

async function pdfVersPptx(fichier, onProgres){
  const pages = await rendrePages(await lire(fichier), 1.8, p => onProgres?.(p * 0.85));
  const diapos = [];
  for (const pg of pages){
    const b = await versBlob(pg.canvas, 'image/png');
    diapos.push({ image: new Uint8Array(await b.arrayBuffer()) });
  }
  onProgres?.(0.95);
  const cx = Math.round(pages[0].largeur * EMU), cy = Math.round(pages[0].hauteur * EMU);
  return { nom: sousNom(fichier.name, 'pptx'),
           blob: new Blob([paquetPptx(diapos, cx, cy)], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }) };
}

/* ===================== mise en page commune vers PDF ===================== */

class Feuille {
  constructor(doc, largeur, hauteur, marge){
    this.doc = doc; this.L = largeur; this.H = hauteur; this.m = marge;
    this.page = doc.addPage([largeur, hauteur]);
    this.y = hauteur - marge;
  }
  place(h){
    if (this.y - h < this.m){ this.page = this.doc.addPage([this.L, this.H]); this.y = this.H - this.m; }
    this.y -= h;
    return this.y;
  }
}

/* Découpe un paragraphe à la largeur utile, en respectant les mots. */
function decouper(txt, police, taille, large){
  const mots = txt.split(/\s+/).filter(Boolean);
  const out = []; let ligne = '';
  for (const mot of mots){
    const essai = ligne ? ligne + ' ' + mot : mot;
    if (police.widthOfTextAtSize(essai, taille) <= large) { ligne = essai; continue; }
    if (ligne) out.push(ligne);
    // un mot seul plus large que la colonne : on le coupe
    let reste = mot;
    while (police.widthOfTextAtSize(reste, taille) > large && reste.length > 1){
      let n = reste.length;
      while (n > 1 && police.widthOfTextAtSize(reste.slice(0, n), taille) > large) n--;
      out.push(reste.slice(0, n)); reste = reste.slice(n);
    }
    ligne = reste;
  }
  if (ligne) out.push(ligne);
  return out.length ? out : [''];
}

/* WinAnsi couvre le latin-1 et la ponctuation typographique ; au-delà on
   remplace, pour ne pas faire échouer tout l'enregistrement sur un caractère. */
function sain(police, s){
  let out = '';
  for (const c of s){
    try { police.widthOfTextAtSize(c, 10); out += c; }
    catch { out += c.trim() ? '?' : ' '; }
  }
  return out;
}

async function policesStandard(doc){
  const F = PDFLib.StandardFonts;
  return {
    '':   await doc.embedFont(F.Helvetica),      B:  await doc.embedFont(F.HelveticaBold),
    I:    await doc.embedFont(F.HelveticaOblique), BI: await doc.embedFont(F.HelveticaBoldOblique)
  };
}

/* ========================= Word (.docx) → PDF ========================= */

async function docxVersPdf(fichier, onProgres){
  const z = dezip(await lire(fichier));
  const src = z['word/document.xml'];
  if (!src) throw new Error("Ce .docx ne contient pas de document Word lisible.");
  const d = xml(texte(src));
  const relsX = z['word/_rels/document.xml.rels'];
  const rels = {};
  if (relsX) for (const r of tous(xml(texte(relsX)), 'Relationship'))
    rels[att(r, 'Id')] = att(r, 'Target');

  const doc = await PDFLib.PDFDocument.create();
  const P = await policesStandard(doc);
  const f = new Feuille(doc, 595.28, 841.89, 56);
  const large = f.L - f.m * 2;
  const images = {};

  const corps = un(d, 'body');
  const blocs = corps ? [...corps.children] : [];
  for (let b = 0; b < blocs.length; b++){
    const n = blocs[b];
    onProgres?.(b / Math.max(1, blocs.length));
    if (n.localName === 'tbl'){
      for (const tr of tous(n, 'tr')){
        const cells = tous(tr, 'tc').map(tc => tous(tc, 't').map(t => t.textContent).join(''));
        if (!cells.length) continue;
        const colL = large / cells.length;
        const taille = 9.5;
        const hauteurs = cells.map(c => decouper(sain(P[''], c) || ' ', P[''], taille, colL - 8).length);
        const h = Math.max(...hauteurs) * taille * 1.3 + 6;
        const y = f.place(h);
        cells.forEach((c, k) => {
          const x = f.m + k * colL;
          f.page.drawRectangle({ x, y, width: colL, height: h, borderColor: PDFLib.rgb(.78, .8, .84), borderWidth: .7 });
          decouper(sain(P[''], c), P[''], taille, colL - 8).forEach((lg, j) => {
            f.page.drawText(lg, { x: x + 4, y: y + h - 4 - taille - j * taille * 1.3, size: taille, font: P[''] });
          });
        });
      }
      f.place(8);
      continue;
    }
    if (n.localName !== 'p') continue;

    // une image seule dans le paragraphe
    const blip = un(n, 'blip');
    if (blip){
      const id = att(blip, 'embed');
      const cible = rels[id];
      const bytes = cible && z['word/' + cible.replace(/^\.\.\//, '')];
      if (bytes){
        try {
          const png = /\.png$/i.test(cible);
          const img = images[cible] || (images[cible] = png ? await doc.embedPng(bytes) : await doc.embedJpg(bytes));
          const ext = un(n, 'extent');
          let w = ext ? +att(ext, 'cx') / EMU : img.width;
          let h = ext ? +att(ext, 'cy') / EMU : img.height;
          if (w > large){ h *= large / w; w = large; }
          const y = f.place(h + 8);
          f.page.drawImage(img, { x: f.m, y: y + 8, width: w, height: h });
        } catch { /* image illisible : on passe, le texte compte plus */ }
      }
    }

    const runs = tous(n, 'r');
    let txt = '', gras = false, ital = false, taille = 11;
    for (const r of runs){
      const t = tous(r, 't').map(x => x.textContent).join('');
      if (!t) continue;
      txt += t;
      const pr = un(r, 'rPr');
      if (pr){
        if (un(pr, 'b')) gras = true;
        if (un(pr, 'i')) ital = true;
        const sz = un(pr, 'sz');
        if (sz) taille = (+att(sz, 'val') || 22) / 2;
      }
    }
    if (!txt.trim()){ f.place(taille * 0.7); continue; }
    const police = P[(gras ? 'B' : '') + (ital ? 'I' : '')] || P[''];
    const jc = un(n, 'jc'), align = jc ? att(jc, 'val') : 'left';
    for (const lg of decouper(sain(police, txt), police, taille, large)){
      const y = f.place(taille * 1.42);
      const w = police.widthOfTextAtSize(lg, taille);
      const x = align === 'center' ? f.m + (large - w) / 2
              : align === 'right'  ? f.m + large - w : f.m;
      f.page.drawText(lg, { x, y, size: taille, font: police });
    }
    f.place(4);
  }
  return { nom: sousNom(fichier.name, 'pdf'),
           blob: new Blob([await doc.save()], { type: 'application/pdf' }) };
}

/* ========================= Excel (.xlsx) → PDF ========================= */

async function xlsxVersPdf(fichier, onProgres){
  const z = dezip(await lire(fichier));
  if (!z['xl/workbook.xml']) throw new Error("Ce .xlsx ne contient pas de classeur lisible.");
  const wb = xml(texte(z['xl/workbook.xml']));
  const rels = {};
  if (z['xl/_rels/workbook.xml.rels'])
    for (const r of tous(xml(texte(z['xl/_rels/workbook.xml.rels'])), 'Relationship'))
      rels[att(r, 'Id')] = att(r, 'Target');

  const partagees = [];
  if (z['xl/sharedStrings.xml'])
    for (const si of tous(xml(texte(z['xl/sharedStrings.xml'])), 'si'))
      partagees.push(tous(si, 't').map(t => t.textContent).join(''));

  const doc = await PDFLib.PDFDocument.create();
  const P = await policesStandard(doc);
  const onglets = tous(wb, 'sheet');
  const sorties = [];

  onglets.forEach((sh, i) => {
    let cible = rels[relId(sh)] || `worksheets/sheet${i + 1}.xml`;
    cible = 'xl/' + cible.replace(/^\//, '');
    const data = z[cible] || z[`xl/worksheets/sheet${i + 1}.xml`];
    if (!data) return;
    const ws = xml(texte(data));
    const lignes = [];
    for (const row of tous(ws, 'row')){
      const cells = [];
      for (const c of tous(row, 'c')){
        const ref = att(c, 'r') || '';
        const col = (ref.match(/^[A-Z]+/) || ['A'])[0];
        let k = 0; for (const ch of col) k = k * 26 + (ch.charCodeAt(0) - 64);
        const t = att(c, 't');
        const v = un(c, 'v'), is = un(c, 'is');
        let val = '';
        if (t === 's' && v) val = partagees[+v.textContent] ?? '';
        else if (t === 'inlineStr' && is) val = tous(is, 't').map(x => x.textContent).join('');
        else if (v) val = v.textContent;
        cells[k - 1] = val;
      }
      lignes.push(cells);
    }
    sorties.push({ nom: att(sh, 'name') || `Feuille ${i + 1}`, lignes });
    onProgres?.((i + 1) / onglets.length);
  });

  const L = 841.89, H = 595.28, m = 36;            // A4 paysage
  for (const feuille of sorties){
    const nbCol = feuille.lignes.reduce((x, r) => Math.max(x, r.length), 0) || 1;
    const large = (L - m * 2) / Math.min(nbCol, 12);
    const taille = Math.max(6.5, Math.min(9.5, 110 / Math.min(nbCol, 12)));
    const f = new Feuille(doc, L, H, m);
    f.page.drawText(sain(P.B, feuille.nom), { x: m, y: f.place(22), size: 13, font: P.B });
    f.place(6);
    feuille.lignes.forEach((r, ri) => {
      const h = taille * 1.9;
      const y = f.place(h);
      for (let k = 0; k < Math.min(nbCol, 12); k++){
        const x = m + k * large;
        f.page.drawRectangle({ x, y, width: large, height: h,
          borderColor: PDFLib.rgb(.82, .84, .88), borderWidth: .6,
          color: ri === 0 ? PDFLib.rgb(.94, .96, .99) : undefined });
        const brut = sain(P[''], String(r[k] ?? ''));
        if (!brut) continue;
        const police = ri === 0 ? P.B : P[''];
        let t = brut;
        while (t.length > 1 && police.widthOfTextAtSize(t, taille) > large - 6) t = t.slice(0, -1);
        f.page.drawText(t, { x: x + 3, y: y + h / 2 - taille * 0.36, size: taille, font: police });
      }
    });
  }
  if (!sorties.length) doc.addPage([L, H]);
  return { nom: sousNom(fichier.name, 'pdf'),
           blob: new Blob([await doc.save()], { type: 'application/pdf' }) };
}

/* ====================== PowerPoint (.pptx) → PDF ====================== */

async function pptxVersPdf(fichier, onProgres){
  const z = dezip(await lire(fichier));
  if (!z['ppt/presentation.xml']) throw new Error("Ce .pptx ne contient pas de présentation lisible.");
  const pres = xml(texte(z['ppt/presentation.xml']));
  const sz = un(pres, 'sldSz');
  const L = sz ? +att(sz, 'cx') / EMU : 960, H = sz ? +att(sz, 'cy') / EMU : 540;

  const relsP = {};
  for (const r of tous(xml(texte(z['ppt/_rels/presentation.xml.rels'])), 'Relationship'))
    relsP[att(r, 'Id')] = att(r, 'Target');
  const ordre = tous(pres, 'sldId').map(s => relsP[relId(s)]).filter(Boolean);

  const doc = await PDFLib.PDFDocument.create();
  const P = await policesStandard(doc);
  const cacheImg = {};

  for (let i = 0; i < ordre.length; i++){
    onProgres?.((i + 1) / ordre.length);
    const chemin = 'ppt/' + ordre[i].replace(/^\.\.\//, '').replace(/^\//, '');
    const data = z[chemin];
    if (!data) continue;
    const sld = xml(texte(data));
    const page = doc.addPage([L, H]);

    const relsFichier = chemin.replace(/([^/]+)$/, '_rels/$1.rels');
    const rels = {};
    if (z[relsFichier]) for (const r of tous(xml(texte(z[relsFichier])), 'Relationship'))
      rels[att(r, 'Id')] = att(r, 'Target');

    // images d'abord : elles servent de fond aux textes
    for (const pic of tous(sld, 'pic')){
      const blip = un(pic, 'blip'); if (!blip) continue;
      const cible = rels[att(blip, 'embed')]; if (!cible) continue;
      const bytes = z['ppt/' + cible.replace(/^\.\.\//, '')]; if (!bytes) continue;
      const off = un(pic, 'off'), ext = un(pic, 'ext'); if (!off || !ext) continue;
      try {
        const img = cacheImg[cible] || (cacheImg[cible] =
          /\.png$/i.test(cible) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes));
        const w = +att(ext, 'cx') / EMU, h = +att(ext, 'cy') / EMU;
        page.drawImage(img, { x: +att(off, 'x') / EMU, y: H - +att(off, 'y') / EMU - h, width: w, height: h });
      } catch { /* format d'image non géré */ }
    }

    for (const sp of tous(sld, 'sp')){
      const tx = un(sp, 'txBody'); if (!tx) continue;
      const off = un(sp, 'off'), ext = un(sp, 'ext');
      const x0 = off ? +att(off, 'x') / EMU : 40;
      const y0 = off ? +att(off, 'y') / EMU : 40;
      const w0 = ext ? +att(ext, 'cx') / EMU : L - 80;
      let y = H - y0;
      for (const par of tous(tx, 'p')){
        const runs = tous(par, 'r');
        if (!runs.length){ y -= 10; continue; }
        let txt = '', gras = false, ital = false, taille = 18;
        for (const r of runs){
          const t = un(r, 't'); if (!t) continue;
          txt += t.textContent;
          const pr = un(r, 'rPr');
          if (pr){
            if (att(pr, 'b') === '1') gras = true;
            if (att(pr, 'i') === '1') ital = true;
            const s = att(pr, 'sz'); if (s) taille = +s / 100;
          }
        }
        if (!txt.trim()){ y -= taille; continue; }
        const police = P[(gras ? 'B' : '') + (ital ? 'I' : '')] || P[''];
        for (const lg of decouper(sain(police, txt), police, taille, w0)){
          y -= taille * 1.25;
          if (y < 4) break;
          page.drawText(lg, { x: x0, y, size: taille, font: police });
        }
        y -= taille * 0.35;
      }
    }
  }
  if (!ordre.length) doc.addPage([L, H]);
  return { nom: sousNom(fichier.name, 'pdf'),
           blob: new Blob([await doc.save()], { type: 'application/pdf' }) };
}

/* ========================= fusion de PDF ========================= */

async function fusionnerPdf(fichiers, onProgres){
  const out = await PDFLib.PDFDocument.create();
  for (let i = 0; i < fichiers.length; i++){
    const src = await PDFLib.PDFDocument.load(await lire(fichiers[i]), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
    onProgres?.((i + 1) / fichiers.length);
  }
  return { nom: 'fusion.pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) };
}

/* Utilisé par la reconnaissance de texte pour rendre un .docx au lieu d'un .txt. */
function texteVersDocx(nom, paragraphes){
  let corps = '';
  paragraphes.forEach((bloc, i) => {
    for (const ligne of String(bloc).split(/\n/)){
      corps += '<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:rPr>'
             + '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>'
             + `<w:t xml:space="preserve">${esc(ligne)}</w:t></w:r></w:p>`;
    }
    if (i < paragraphes.length - 1) corps += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  });
  return { nom, blob: new Blob([paquetDocx(corps)],
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) };
}

window.Conv = {
  texteVersDocx,
  pdfVersPng:  (f, p) => pdfVersImages(f, 'image/png', p),
  pdfVersJpg:  (f, p) => pdfVersImages(f, 'image/jpeg', p),
  imagesVersPdf,
  pdfVersDocx, pdfVersXlsx, pdfVersPptx,
  docxVersPdf, xlsxVersPdf, pptxVersPdf,
  fusionnerPdf
};
})();
