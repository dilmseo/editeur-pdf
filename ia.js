/* Résumé et traduction, exécutés sur la machine de l'utilisateur.
   Deux moteurs très différents cohabitent ici, et c'est délibéré :

   — le résumé par défaut est EXTRACTIF. Il choisit les phrases les plus
     représentatives du document au lieu d'en rédiger de nouvelles. C'est
     instantané, ça ne pèse rien, ça marche dans toutes les langues, et surtout
     ça n'invente rien : sur un contrat ou une convocation, garder les mots
     d'origine vaut mieux qu'une reformulation plausible.
   — la traduction, elle, appelle un vrai modèle de langue (Marian/opus-mt) via
     transformers.js. Le modèle pèse une centaine de mégaoctets et se télécharge
     au premier clic depuis Hugging Face, puis reste dans le cache du navigateur.

   Ce que le modèle télécharge, ce sont ses propres poids. Le document, lui, ne
   part nulle part : il est lu, découpé et traduit dans l'onglet. Les pages le
   disent en clair plutôt que de laisser croire à un « zéro réseau » absolu. */
(() => {
'use strict';

const CDN_MODELES = {
  'fr-en': 'Xenova/opus-mt-fr-en',
  'en-fr': 'Xenova/opus-mt-en-fr',
  'resume-en': 'Xenova/distilbart-cnn-6-6'
};

/* Mots-outils écartés du comptage : sans eux, « le » et « de » domineraient
   tous les scores et le résumé choisirait les phrases les plus longues. */
const VIDES = new Set((
  'le la les un une des du de d l et ou mais donc or ni car que qui quoi dont ou a au aux ce cet cette ces ' +
  'se sa son ses leur leurs mon ma mes ton ta tes notre nos votre vos il elle ils elles on nous vous je tu me te ' +
  'est sont etait etaient ete fut sera seront avoir ai as ont avait avaient eu etre suis es sommes etes ' +
  'pas ne plus moins tres bien tout tous toute toutes meme aussi alors ainsi dans sur sous avec sans pour par ' +
  'en y entre vers chez depuis apres avant pendant selon dont lorsque quand si comme afin ' +
  'the a an and or but so nor for yet of to in on at by with from as is are was were be been being has have had ' +
  'do does did will would can could should may might must this that these those it its he she they we you i not ' +
  'there their his her our your my no all any some such than then when while which who whom whose what how'
).split(/\s+/));

const sansAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const motsDe = s => sansAccent(String(s).toLowerCase())
  .replace(/[^a-z0-9'’\s-]/g, ' ')
  .split(/[\s'’-]+/)
  .filter(m => m.length > 2 && !VIDES.has(m));

/* ------------------------------------------------------------------ *
 *  Lecture : du PDF vers des paragraphes                              *
 * ------------------------------------------------------------------ */

/* pdf.js rend des lignes, pas des paragraphes. Les recoller est tout l'enjeu :
   un résumé calculé sur des lignes isolées coupe les phrases en deux, et une
   traduction ligne à ligne perd le contexte dont le modèle a besoin. */
function recoller(pages){
  const out = [];
  for (const page of pages){
    if (!page.lignes.length) continue;
    const colonne = Math.max(...page.lignes.map(l => l.w)) || page.largeur;
    let cur = null, prec = null;

    for (const l of page.lignes){
      const texte = l.texte.replace(/\s+/g, ' ').trim();
      if (!texte) continue;
      let neuf = !cur;
      if (prec){
        const interligne = Math.max(prec.size, l.size) || 10;
        neuf = neuf
          || (prec.y - l.y) > interligne * 1.85            // une ligne blanche
          || /[.!?…:;»"]\s*$/.test(prec.texte)             // la phrase est close
          || /^\s*([-–—•*·]|\(?\d{1,2}[.)])\s/.test(texte) // une puce commence
          || Math.abs(l.size - prec.size) > 1.3            // changement de corps
          || prec.w < colonne * 0.62;                      // ligne courte = fin de bloc
      }
      if (neuf){ cur = { t: texte }; out.push(cur); }
      else {
        /* césure de fin de ligne : « adminis- » + « tration ». On ne recolle
           que si la suite commence en minuscule, sinon on casserait les vrais
           traits d'union (« Saint-Étienne » en fin de ligne). */
        if (/[a-zà-öø-ÿ]-$/.test(cur.t) && /^[a-zà-öø-ÿ]/.test(texte))
          cur.t = cur.t.slice(0, -1) + texte;
        else cur.t += ' ' + texte;
      }
      prec = { y: l.y, size: l.size, w: l.w, texte };
    }
  }
  return out.map(p => p.t.trim()).filter(t => t.length > 1);
}

/* Reconnaissance sans coordonnées : Tesseract rend des lignes, on les recolle
   avec les mêmes règles que plus haut, moins celles qui demandent une position. */
function recollerTexte(brut){
  const out = [];
  let cur = null, prec = '';
  for (const ligne of String(brut).split(/\r?\n/)){
    const t = ligne.replace(/\s+/g, ' ').trim();
    if (!t){ cur = null; prec = ''; continue; }
    const neuf = !cur
      || /[.!?…:;»"]$/.test(prec)
      || /^([-–—•*·]|\(?\d{1,2}[.)])\s/.test(t)
      || /^[A-ZÀ-Ý0-9][^a-zà-öø-ÿ]{4,}$/.test(t);   // un titre tout en capitales
    if (neuf){ cur = { t }; out.push(cur); }
    else if (/[a-zà-öø-ÿ]-$/.test(cur.t) && /^[a-zà-öø-ÿ]/.test(t)) cur.t = cur.t.slice(0, -1) + t;
    else cur.t += ' ' + t;
    prec = t;
  }
  return out.map(p => p.t.trim()).filter(t => t.length > 1);
}

/* Un scan n'a pas de texte à lire : plutôt que de renvoyer l'utilisateur vers un
   autre outil, on lance la reconnaissance ici même. C'est long — quelques
   secondes par page — donc l'étape se nomme à l'écran au lieu d'avancer en
   silence. Le moteur n'est chargé que sur les pages qui en déclarent le besoin. */
async function reconnaitre(bytes, avance, borneB){
  const m = MSG();
  if (typeof Tesseract === 'undefined') throw new Error(m.vide);
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  const worker = await Tesseract.createWorker('fra', 1, {
    workerPath: '/vendor/tesseract-worker.min.js',
    corePath: '/vendor/', langPath: '/vendor/lang', gzip: true
  });
  const paras = [];
  try {
    for (let i = 1; i <= pdf.numPages; i++){
      const pg = await pdf.getPage(i);
      const vp = pg.getViewport({ scale: 3 });
      const c = document.createElement('canvas');
      c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: ctx, viewport: vp }).promise;
      const { data } = await worker.recognize(c);
      paras.push(...recollerTexte(data.text || ''));
      avance?.(borneB * (i / pdf.numPages), `${m.reconnaissance} ${i}/${pdf.numPages}`);
    }
  } finally { await worker.terminate(); }
  return paras;
}

async function lireParagraphes(fichier, avance, borneB){
  if (!window.Conv?.fragments) throw new Error('Module de lecture indisponible.');
  const bytes = new Uint8Array(await fichier.arrayBuffer());
  const pages = await window.Conv.fragments(bytes, false, p => avance?.(p * borneB));
  let paras = recoller(pages);
  /* Moins de quarante caractères sur tout le document : ce n'est pas un texte
     maigre, c'est une image. */
  if (paras.join(' ').replace(/\s/g, '').length < 40)
    paras = await reconnaitre(bytes, avance, borneB);
  if (!paras.length || paras.join(' ').replace(/\s/g, '').length < 40)
    throw new Error(MSG().vide);
  return paras;
}

/* ------------------------------------------------------------------ *
 *  Découpe en phrases                                                 *
 * ------------------------------------------------------------------ */

/* On évite de couper sur les abréviations courantes et les initiales, sans quoi
   « M. Dupont » devient deux phrases et le résumé rend des moignons. */
const ABREV = /\b(M|MM|Mme|Mmes|Dr|Pr|St|Ste|cf|etc|art|al|av|bd|ed|vol|no|n°|p|pp|fig|ex|Mr|Mrs|Ms|Jr|Sr|vs|Inc|Ltd|Co)\.$/i;

function phrasesDe(texte){
  const brut = String(texte).split(/(?<=[.!?…])\s+/);
  const out = [];
  for (const p of brut){
    const prec = out[out.length - 1];
    if (prec && (ABREV.test(prec.trim()) || /\b[A-ZÀ-Ý]\.$/.test(prec.trim())))
      out[out.length - 1] = prec + ' ' + p;
    else out.push(p);
  }
  return out.map(s => s.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ *
 *  Résumé extractif                                                   *
 * ------------------------------------------------------------------ */

/* Score d'une phrase = somme des fréquences de ses mots pleins, divisée par la
   racine de sa longueur. Sans cette division, les phrases les plus longues
   gagnent mécaniquement ; avec une division par la longueur entière, ce sont
   les plus courtes. La racine est le compromis mesuré sur nos documents. */
function resumeExtractif(paragraphes, part){
  const phrases = [];
  paragraphes.forEach((p, ip) => phrasesDe(p).forEach(t => {
    if (t.replace(/\s/g, '').length >= 25) phrases.push({ t, ip, rang: phrases.length });
  }));
  if (phrases.length < 3) return paragraphes.slice(0, 3);

  const freq = new Map();
  for (const ph of phrases) for (const m of motsDe(ph.t)) freq.set(m, (freq.get(m) || 0) + 1);
  const max = Math.max(1, ...freq.values());

  for (const ph of phrases){
    const mots = motsDe(ph.t);
    const brut = mots.reduce((s, m) => s + (freq.get(m) || 0) / max, 0);
    /* Une prime dégressive aux premières phrases : l'objet d'un courrier, d'un
       rapport ou d'un contrat est presque toujours énoncé en tête. */
    const tete = 1 + 0.35 * Math.exp(-ph.rang / 6);
    ph.score = mots.length ? (brut / Math.sqrt(mots.length)) * tete : 0;
  }

  const n = Math.min(phrases.length, Math.max(3, Math.round(phrases.length * part)));
  const gardees = [...phrases].sort((a, b) => b.score - a.score).slice(0, n)
                              .sort((a, b) => a.rang - b.rang);

  /* On regroupe par paragraphe d'origine : le résumé garde ainsi la structure
     du document au lieu d'être un mur de phrases décousues. */
  const blocs = [];
  let courant = null;
  for (const ph of gardees){
    if (!courant || courant.ip !== ph.ip){ courant = { ip: ph.ip, t: [] }; blocs.push(courant); }
    courant.t.push(ph.t);
  }
  return blocs.map(b => b.t.join(' '));
}

/* ------------------------------------------------------------------ *
 *  Modèles : chargement différé et mesuré                             *
 * ------------------------------------------------------------------ */

let LIB = null;
async function bibliotheque(){
  if (LIB) return LIB;
  try {
    LIB = await import('/vendor/transformers.min.js');
  } catch {
    try { LIB = await import('./vendor/transformers.min.js'); }
    catch { throw new Error(MSG().libIntrouvable); }
  }
  const { env } = LIB;
  env.allowLocalModels = false;          // les poids viennent du dépôt Hugging Face
  env.useBrowserCache = true;            // ...et n'y retournent jamais : cache du navigateur
  env.backends.onnx.wasm.wasmPaths = new URL('vendor/ort/', location.origin + '/').href;
  env.backends.onnx.wasm.numThreads = 1; // sans COOP/COEP, le multithread n'est pas disponible
  return LIB;
}

const PIPELINES = new Map();

/* Le téléchargement est la partie longue et il faut qu'elle se voie : on agrège
   l'avancement de tous les fichiers du modèle en un seul pourcentage, et on
   affiche les mégaoctets, seule grandeur que l'utilisateur peut rapporter à sa
   connexion. */
async function moteur(tache, cle, surEtat, borneA, borneB){
  const deja = PIPELINES.get(cle);
  if (deja) { surEtat?.(borneB, null); return deja; }

  const { pipeline } = await bibliotheque();
  const suivis = new Map();
  const m = MSG();

  const p = await pipeline(tache, CDN_MODELES[cle], {
    quantized: true,
    progress_callback: e => {
      if (e.status === 'progress' && e.total){
        suivis.set(e.file, { l: e.loaded, t: e.total });
      } else if (e.status === 'done' && suivis.has(e.file)){
        const s = suivis.get(e.file); s.l = s.t;
      } else if (e.status !== 'progress') return;
      let l = 0, t = 0;
      for (const s of suivis.values()){ l += s.l; t += s.t; }
      if (!t) return;
      const f = l / t;
      surEtat?.(borneA + (borneB - borneA) * f,
                `${m.telechargement} ${Math.round(f * 100)} % · ${(l / 1048576).toFixed(0)}/${(t / 1048576).toFixed(0)} Mo`);
    }
  });
  PIPELINES.set(cle, p);
  return p;
}

/* ------------------------------------------------------------------ *
 *  Traduction                                                         *
 * ------------------------------------------------------------------ */

/* Marian borne son entrée à 512 jetons. On regroupe donc des phrases entières
   sous une limite de caractères prudente : couper au milieu d'une phrase
   dégraderait la traduction bien plus qu'un découpage un peu court. */
function lotsDe(paragraphes, limite){
  const lots = [];
  paragraphes.forEach((p, ip) => {
    let bloc = '';
    for (const ph of phrasesDe(p)){
      const morceaux = ph.length > limite
        ? ph.match(new RegExp(`[\\s\\S]{1,${limite}}(?=\\s|$)`, 'g')) || [ph]
        : [ph];
      for (const mo of morceaux){
        if (bloc && (bloc.length + mo.length + 1) > limite){ lots.push({ ip, t: bloc }); bloc = ''; }
        bloc = bloc ? bloc + ' ' + mo : mo;
      }
    }
    if (bloc) lots.push({ ip, t: bloc });
  });
  return lots;
}

async function traduirePdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const sens = opts.sens === 'en-fr' ? 'en-fr' : 'fr-en';
  const m = MSG();

  const paras = await lireParagraphes(f, avance, 0.05);
  const trad = await moteur('translation', sens, avance, 0.05, 0.45);

  const lots = lotsDe(paras, 420);
  const rendus = new Map();
  for (let i = 0; i < lots.length; i++){
    const r = await trad(lots[i].t, { max_new_tokens: 512 });
    const sortie = (Array.isArray(r) ? r[0] : r)?.translation_text || '';
    const d = rendus.get(lots[i].ip) || [];
    d.push(sortie.trim());
    rendus.set(lots[i].ip, d);
    avance?.(0.45 + 0.55 * ((i + 1) / lots.length),
             `${m.traduction} ${i + 1}/${lots.length}`);
  }

  const sortie = paras.map((_, i) => (rendus.get(i) || []).join(' ')).filter(Boolean);
  if (!sortie.length) throw new Error(m.rienTraduit);
  return rendre(f, sortie, opts.sortie, SUF().traduit, null);
}

/* ------------------------------------------------------------------ *
 *  Résumé                                                             *
 * ------------------------------------------------------------------ */

const PARTS = { court: 0.12, moyen: 0.22, long: 0.35 };

async function resumerPdf(fichiers, opts = {}, avance){
  const f = fichiers[0];
  const m = MSG();
  const paras = await lireParagraphes(f, avance, 0.05);
  let sortie;

  if (opts.moteur === 'redige'){
    /* Rédaction abstractive : distilbart ne connaît que l'anglais, la page le dit.
       Son entrée tient 1024 jetons, d'où des blocs d'environ 3 000 caractères. */
    const resumeur = await moteur('summarization', 'resume-en', avance, 0.05, 0.6);
    const blocs = [];
    let bloc = '';
    for (const p of paras){
      if (bloc && bloc.length + p.length > 3000){ blocs.push(bloc); bloc = ''; }
      bloc = bloc ? bloc + '\n' + p : p;
    }
    if (bloc) blocs.push(bloc);

    sortie = [];
    for (let i = 0; i < blocs.length; i++){
      const r = await resumeur(blocs[i], { min_length: 40, max_new_tokens: 140 });
      const t = (Array.isArray(r) ? r[0] : r)?.summary_text || '';
      if (t.trim()) sortie.push(t.trim());
      avance?.(0.6 + 0.4 * ((i + 1) / blocs.length), `${m.redaction} ${i + 1}/${blocs.length}`);
    }
  } else {
    avance?.(0.6, m.analyse);
    sortie = resumeExtractif(paras, PARTS[opts.longueur] || PARTS.moyen);
    avance?.(1);
  }

  if (!sortie.length) throw new Error(m.rienResume);
  const mots = sortie.join(' ').split(/\s+/).filter(Boolean).length;
  const total = paras.join(' ').split(/\s+/).filter(Boolean).length;
  const r = rendre(f, sortie, opts.sortie, SUF().resume, m.titreResume + ' — ' + f.name);
  r.texte = sortie.join('\n\n');
  r.note = m.compte(mots, total, Math.max(1, Math.round(100 - mots / total * 100)));
  return r;
}

/* ------------------------------------------------------------------ *
 *  Sortie commune                                                     *
 * ------------------------------------------------------------------ */

function rendre(fichier, paragraphes, format, suffixe, titre){
  const nom = fichier.name.replace(/\.[^.]+$/, '') + suffixe;
  if (format === 'pdf')  return window.Conv.proseVersPdf(nom + '.pdf', paragraphes, titre);
  if (format === 'docx') return window.Conv.proseVersDocx(nom + '.docx', paragraphes);
  return { nom: nom + '.txt',
           blob: new Blob([paragraphes.join('\n\n')], { type: 'text/plain;charset=utf-8' }) };
}

/* ------------------------------------------------------------------ *
 *  Mots : français par défaut, traduits si la page l'est              *
 * ------------------------------------------------------------------ */

const FR = {
  telechargement: 'Téléchargement du modèle…',
  traduction: 'Traduction du passage',
  redaction: 'Rédaction du résumé, bloc',
  analyse: 'Analyse du document…',
  reconnaissance: 'Document scanné : reconnaissance de la page',
  vide: "Ce document ne contient aucun texte exploitable, même après reconnaissance.",
  rienTraduit: "Aucun passage n'a pu être traduit.",
  rienResume: "Le document est trop court pour en tirer un résumé.",
  libIntrouvable: "Le moteur de langue n'a pas pu être chargé. Rechargez la page et réessayez.",
  titreResume: 'Résumé',
  compte: (m, t, p) => `${m} mots au lieu de ${t}, soit ${p} % de moins.`
};

const MSG = () => Object.assign({}, FR, (window.TEXTES && window.TEXTES.IA) || {});
const SUF = () => Object.assign({ traduit: '-traduit', resume: '-resume' },
                                (window.TEXTES && window.TEXTES.SUFFIXES) || {});

window.IA = { traduirePdf, resumerPdf };
})();
