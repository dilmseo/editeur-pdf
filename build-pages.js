/* Génère une page par outil et par langue, plus le sitemap et robots.txt.
       node build-pages.js
   Chaque langue a son préfixe d'URL et ses propres slugs ; les pages d'une même
   famille se déclarent mutuellement en hreflang, faute de quoi les traductions se
   feraient concurrence au lieu de s'additionner. Le français reste à la racine :
   c'est le marché principal, et ses adresses sont déjà indexées. */
const fs = require('fs');
const path = require('path');
const base = require('./outils-data.js');
const { SITE } = base;

const RACINE = __dirname;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const JOUR = new Date().toISOString().slice(0, 10);
const jsonEsc = s => JSON.stringify(String(s));

const COCHE = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>';
const CROIX = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const LOGO  = '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h10M5 18h7"/></svg>';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231762e0'/%3E%3Cpath d='M9 10h14M9 16h10M9 22h7' stroke='%23fff' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";

/* ---------------- textes de gabarit, langue par langue ---------------- */

const UI_FR = {
  langue: 'fr', htmlLang: 'fr', nom: 'Français',
  navOutils: 'Outils', navConfiance: 'Confidentialité', navQuestions: 'Questions',
  navEditer: 'Modifier un PDF', filAccueil: 'Accueil',
  pastille: 'Gratuit · sans compte · aucun fichier téléversé',
  deposer: 'Déposez votre fichier ici', deposerPluriel: 'Déposez vos fichiers ici',
  choisir: 'ou cliquez pour le choisir', choisirPluriel: 'ou cliquez pour les choisir',
  convertir: 'Convertir', pret: "C'est prêt", telecharger: 'Télécharger',
  encore: 'Traiter un autre fichier',
  avisQuestion: 'Ça vous a rendu service ?', avisLien: 'Donner mon avis',
  commentFaire: 'Comment faire', quandSert: 'Quand cet outil sert vraiment',
  garde: 'Conservé', perdu: 'Non repris',
  gardePerduTitre: "Ce que la conversion conserve, et ce qu'elle perd",
  gardePerduIntro: "Convertir dans un navigateur impose des limites qu'un service hébergé n'a pas. Les voici en clair, pour que vous sachiez à quoi vous attendre avant de commencer.",
  formatTitre: 'Bon à savoir sur le format',
  renvoisTitre: "Et si ce n'est pas le bon outil ?",
  gratuitTitre: "Pourquoi c'est gratuit",
  gratuitP1: "Les services de conversion en ligne reçoivent votre fichier sur leurs serveurs, le traitent, puis promettent de l'effacer. Chaque document leur coûte du temps de calcul : c'est pour cela qu'ils facturent, et qu'ils limitent la taille des fichiers.",
  gratuitP2fort: "Ici, la conversion se fait sur votre ordinateur.",
  gratuitP2: " La page ne contient aucun code serveur : votre document ne peut pas être reçu, puisqu'il n'est jamais envoyé. Il n'y a donc rien à facturer, rien à limiter, et rien à effacer ensuite. Coupez votre connexion après le chargement de la page : tout continue de fonctionner.",
  questionsTitre: 'Questions fréquentes',
  autresTitre: 'Les autres outils',
  inverseTexte: lien => `Besoin du chemin inverse ? ${lien} fait exactement l'opération contraire, avec les mêmes garanties.`,
  editeurRenvoi: "corriger une ligne déjà écrite, même sur un document scanné. C'est la fonction que les autres services réservent à leurs formules payantes, et le point de départ naturel quand il faut retoucher avant de convertir.",
  piedPhrase: 'Construit avec pdf.js, pdf-lib et fflate — tout est embarqué, aucun appel réseau.',
  codeSource: 'Code source',
  etapes: multiple => [
    `Déposez ${multiple ? 'vos fichiers' : 'votre fichier'} sur la page, ou cliquez pour ${multiple ? 'les' : 'le'} choisir dans vos dossiers.`,
    "Lancez le traitement. Il se déroule dans votre navigateur : rien n'est envoyé sur un serveur.",
    "Téléchargez le résultat. Sans compte, sans filigrane et sans attente dans une file."
  ],
  etapesNoms: ['Ouvrir le fichier', 'Lancer le traitement', 'Télécharger le résultat'],
  plan: { autres: 'Autres outils', editeur: "Modifier le texte d'un PDF", fusion: 'Fusionner des PDF' }
};

/* Assemble la version d'une langue : le fonctionnel vient toujours du catalogue
   français, seuls les mots changent. Une traduction ne peut donc pas casser un outil. */
function fusionner(trad){
  const outils = {};
  for (const cle of Object.keys(base.OUTILS)){
    const o = base.OUTILS[cle];
    outils[cle] = Object.assign({}, o, (trad && trad.OUTILS[cle]) || {});
  }
  return outils;
}

const LANGUES = [
  { code: 'fr', prefixe: '', ui: UI_FR, outils: fusionner(null),
    groupes: base.GROUPES.map(g => g.titre) }
];
for (const code of ['en']){
  const trad = require('./textes/' + code + '.js');
  LANGUES.push({ code, prefixe: '/' + code, ui: trad.UI, outils: fusionner(trad),
                 groupes: trad.UI.accueil.groupes, trad });
}

const urlDe = (lang, cle) => `${SITE}${lang.prefixe}/${lang.outils[cle].slug}/`;
const accueilDe = lang => `${SITE}${lang.prefixe}/`;

/* ---------------- fragments ---------------- */

function selecteurLangue(langCourante, cle){
  if (LANGUES.length < 2) return '';
  return '<span class="langues">' + LANGUES.map(l => {
    const u = cle ? urlDe(l, cle) : accueilDe(l);
    return l.code === langCourante.code
      ? `<b>${l.code.toUpperCase()}</b>`
      : `<a href="${u}" hreflang="${l.ui.htmlLang}">${l.code.toUpperCase()}</a>`;
  }).join('') + '</span>';
}

function hreflangs(cle){
  return LANGUES.map(l =>
      `<link rel="alternate" hreflang="${l.ui.htmlLang}" href="${cle ? urlDe(l, cle) : accueilDe(l)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${cle ? urlDe(LANGUES[0], cle) : accueilDe(LANGUES[0])}">`;
}

function page(lang, cle){
  const o = lang.outils[cle];
  const ui = lang.ui;
  const url = urlDe(lang, cle);
  const et = ui.etapes(!!o.multiple);
  const lien = (k, texte) => `<a href="${lang.prefixe}/${lang.outils[k].slug}/">${esc(texte || lang.outils[k].carte)}</a>`;
  const carteOutil = k => {
    const x = lang.outils[k];
    return `<a href="${lang.prefixe}/${x.slug}/"><span class="ico ${x.couleur}"><svg viewBox="0 0 24 24">${x.ico}</svg></span>${esc(x.carte)}</a>`;
  };
  const plan = () => base.GROUPES.map((gr, i) =>
      `<div><strong>${esc(lang.groupes[i])}</strong><ul>` +
      gr.cles.map(k => k === cle
        ? `<li><span aria-current="page">${esc(lang.outils[k].carte)}</span></li>`
        : `<li>${lien(k)}</li>`).join('') + '</ul></div>').join('\n    ')
    + `\n    <div><strong>${esc(ui.plan.autres)}</strong><ul>`
    + `<li><a href="${lang.prefixe}/">${esc(ui.plan.editeur)}</a></li>`
    + (cle === 'fusion' ? `<li><span aria-current="page">${esc(ui.plan.fusion)}</span></li>`
                        : `<li>${lien('fusion')}</li>`) + '</ul></div>';

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SITE + '/#editeur', name: 'Éditeur PDF', url: SITE + '/',
        logo: { '@type': 'ImageObject', url: SITE + '/apercu-editeur.png' },
        sameAs: ['https://github.com/dilmseo/editeur-pdf'] },
      { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'Éditeur PDF',
        inLanguage: LANGUES.map(l => l.ui.htmlLang), publisher: { '@id': SITE + '/#editeur' } },
      { '@type': 'ImageObject', '@id': url + '#image', url: SITE + '/apercu-editeur.png',
        width: 1360, height: 850 },
      { '@type': 'WebPage', '@id': url + '#page', url, name: o.titreSeo, description: o.meta,
        inLanguage: ui.htmlLang, isPartOf: { '@id': SITE + '/#site' },
        primaryImageOfPage: { '@id': url + '#image' },
        breadcrumb: { '@id': url + '#fil' }, dateModified: JOUR },
      { '@type': 'BreadcrumbList', '@id': url + '#fil', itemListElement: [
          { '@type': 'ListItem', position: 1, name: ui.filAccueil, item: accueilDe(lang) },
          { '@type': 'ListItem', position: 2, name: o.carte, item: url } ] },
      { '@type': 'SoftwareApplication', '@id': url + '#outil', name: o.titre, url,
        description: o.meta, applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows, macOS, Linux, Android, iOS',
        browserRequirements: 'Navigateur récent avec JavaScript',
        isAccessibleForFree: true, inLanguage: ui.htmlLang, featureList: o.garde,
        publisher: { '@id': SITE + '/#editeur' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR',
                  availability: 'https://schema.org/InStock' } },
      { '@type': 'HowTo', '@id': url + '#mode-emploi', name: o.h1, description: o.chapo,
        inLanguage: ui.htmlLang, totalTime: 'PT1M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
        step: et.map((t, i) => ({ '@type': 'HowToStep', position: i + 1,
          name: ui.etapesNoms[i], text: t, url: url + '#etape-' + (i + 1) })) },
      { '@type': 'FAQPage', '@id': url + '#questions', inLanguage: ui.htmlLang,
        mainEntityOfPage: { '@id': url + '#page' },
        mainEntity: o.faq.map(f => ({ '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r } })) }
    ]
  };

  return `<!doctype html>
<html lang="${ui.htmlLang}">
<head>
<meta charset="utf-8">
<title>${esc(o.titreSeo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(o.meta)}">
<link rel="canonical" href="${url}">
${hreflangs(cle)}
<meta property="og:type" content="website">
<meta property="og:locale" content="${ui.htmlLang === 'fr' ? 'fr_FR' : 'en_GB'}">
<meta property="og:site_name" content="Éditeur PDF">
<meta property="og:title" content="${esc(o.titreSeo)}">
<meta property="og:description" content="${esc(o.meta)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/apercu-editeur.png">
<meta property="og:image:width" content="1360">
<meta property="og:image:height" content="850">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/apercu-editeur.png">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style-outil.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>

<div class="hnav"><div class="in">
  <a class="brand" href="${lang.prefixe}/"><i>${LOGO}</i>Éditeur PDF</a>
  <nav>
    <a href="${lang.prefixe}/#outils">${esc(ui.navOutils)}</a>
    <a href="${lang.prefixe}/#confiance">${esc(ui.navConfiance)}</a>
    <a href="${lang.prefixe}/#questions">${esc(ui.navQuestions)}</a>
    ${selecteurLangue(lang, cle)}
    <a class="cta-nav" href="${lang.prefixe}/">${esc(ui.navEditer)}</a>
  </nav>
</div></div>

<header class="tete"><div class="sec">
  <p class="fil"><a href="${lang.prefixe}/">${esc(ui.filAccueil)}</a> › ${esc(o.carte)}</p>
  <h1>${esc(o.h1)}</h1>
  <p class="chapo">${esc(o.chapo)}</p>
  <p style="margin-top:18px"><span class="pastille"><b></b>${esc(ui.pastille)}</span></p>

  <label class="zone" id="zone" for="fichier">
    <div class="gros">${esc(o.multiple ? ui.deposerPluriel : ui.deposer)}</div>
    <div class="pet">${esc(o.multiple ? ui.choisirPluriel : ui.choisir)}</div>
  </label>
  <input id="fichier" type="file" hidden>
  <ul class="liste" id="liste"></ul>
  <div class="panneau" id="panneau" hidden></div>
  <div class="reglages" id="reglages" hidden></div>
  <button class="go" id="go" disabled>${esc(o.actionTexte || ui.convertir)}</button>

  <div class="barre" id="barre" hidden><i></i></div>
  <div class="etat" id="etat" hidden></div>
  <div class="err" id="err" hidden></div>

  <div class="fini" id="fini" hidden>
    <div class="ok"><svg viewBox="0 0 24 24"><path d="m4 12.5 5.5 5.5L20 7"/></svg></div>
    <b>${esc(ui.pret)}</b>
    <div class="nom" id="fini-nom"></div>
    <div class="note-fini" id="fini-note" hidden></div>
    <a class="dl" id="dl" download>${esc(ui.telecharger)}</a>
    <button class="encore" id="encore">${esc(ui.encore)}</button>
    <a class="avis" href="https://g.page/r/CfBfIXTvKKmwEAE/review" target="_blank" rel="noopener">
      ${esc(ui.avisQuestion)}<br><b>${esc(ui.avisLien)}</b></a>
  </div>
</div></header>

<main class="sec corps">

  <p class="intro">${esc(o.contexte)}</p>

  <h2>${esc(ui.commentFaire)}</h2>
  <div class="etapes">
    ${et.map(t => `<div class="etape"><p>${esc(t)}</p></div>`).join('\n    ')}
  </div>

  <h2>${esc(ui.quandSert)}</h2>
  <div class="usages">
    ${o.usages.map(u => `<div class="usage"><h3>${esc(u.t)}</h3><p>${esc(u.d)}</p></div>`).join('\n    ')}
  </div>

  <h2>${esc(ui.gardePerduTitre)}</h2>
  <p>${esc(ui.gardePerduIntro)}</p>
  <div class="deux">
    <div class="bloc oui">
      <h3>${esc(ui.garde)}</h3>
      <ul>${o.garde.map(t => `<li>${COCHE}<span>${esc(t)}</span></li>`).join('')}</ul>
    </div>
    <div class="bloc non">
      <h3>${esc(ui.perdu)}</h3>
      <ul>${o.perdu.map(t => `<li>${CROIX}<span>${esc(t)}</span></li>`).join('')}</ul>
    </div>
  </div>
  ${o.inverse ? `<p class="apres">${ui.inverseTexte(lien(o.inverse))}</p>` : ''}

  <h2>${esc(ui.formatTitre)}</h2>
  <p>${esc(o.format)}</p>

  <h2>${esc(ui.renvoisTitre)}</h2>
  <ul class="renvois">
    ${o.lies.map(l => `<li>${lien(l.cle)} — ${esc(l.r)}</li>`).join('\n    ')}
  </ul>

  <h2>${esc(ui.gratuitTitre)}</h2>
  <div class="confiance">
    <p style="margin:0">${esc(ui.gratuitP1)}</p>
    <p style="margin:12px 0 0"><b>${esc(ui.gratuitP2fort)}</b>${esc(ui.gratuitP2)}</p>
  </div>

  <h2>${esc(ui.questionsTitre)}</h2>
  ${o.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${esc(f.q)}</summary>
    <p>${esc(f.r)}</p>
  </details>`).join('\n  ')}

  <h2>${esc(ui.autresTitre)}</h2>
  <div class="autres">
    ${o.lies.map(l => carteOutil(l.cle)).join('\n    ')}
  </div>
  <p class="apres"><a href="${lang.prefixe}/"><strong>${esc(ui.plan.editeur)}</strong></a> —
     ${esc(ui.editeurRenvoi)}</p>
</main>

<nav class="plan" aria-label="${esc(ui.autresTitre)}"><div class="in">
  ${plan()}
</div></nav>

<div class="pied"><div class="in">
  <span>${esc(ui.piedPhrase)}</span>
  <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a>
</div></div>

<script src="/vendor/pdf.min.js"></script>
<script src="/vendor/pdf-lib.min.js"></script>
<script src="/vendor/fflate.min.js"></script>${o.tesseract ? '\n<script src="/vendor/tesseract.min.js"></script>' : ''}
<script src="/outils-data.js"></script>${lang.code === 'fr' ? '' : `\n<script src="/textes/${lang.code}.js"></script>`}
<script src="/convert.js"></script>
<script src="/pdf-outils.js"></script>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
window.OUTIL_COURANT = ${jsonEsc(cle)};
window.LANGUE = ${jsonEsc(lang.code)};
</script>
<script src="/outil.js"></script>
</body>
</html>
`;
}

/* ---------------- page d'accueil d'une langue traduite ----------------
   Le français garde sa page écrite à la main, qui embarque l'éditeur. Les autres
   langues reçoivent un sommaire complet : c'est la page qui capte les requêtes
   génériques et distribue vers les 24 outils traduits. */
function accueilTraduit(lang){
  const ui = lang.ui, a = ui.accueil, url = accueilDe(lang);
  const carte = k => {
    const x = lang.outils[k];
    return `<a href="${lang.prefixe}/${x.slug}/"><span class="ico ${x.couleur}"><svg viewBox="0 0 24 24">${x.ico}</svg></span>${esc(x.carte)}</a>`;
  };
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SITE + '/#editeur', name: 'Éditeur PDF', url: SITE + '/',
        logo: { '@type': 'ImageObject', url: SITE + '/apercu-editeur.png' },
        sameAs: ['https://github.com/dilmseo/editeur-pdf'] },
      { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'Éditeur PDF',
        inLanguage: LANGUES.map(l => l.ui.htmlLang), publisher: { '@id': SITE + '/#editeur' } },
      { '@type': 'WebPage', '@id': url + '#page', url, name: a.titreSeo, description: a.meta,
        inLanguage: ui.htmlLang, isPartOf: { '@id': SITE + '/#site' }, dateModified: JOUR },
      { '@type': 'ItemList', '@id': url + '#liste', name: ui.navOutils,
        numberOfItems: Object.keys(lang.outils).length,
        itemListElement: Object.keys(lang.outils).map((k, i) => ({
          '@type': 'ListItem', position: i + 1, name: lang.outils[k].titre, url: urlDe(lang, k) })) },
      { '@type': 'FAQPage', '@id': url + '#questions', inLanguage: ui.htmlLang,
        mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r } })) }
    ]
  };

  return `<!doctype html>
<html lang="${ui.htmlLang}">
<head>
<meta charset="utf-8">
<title>${esc(a.titreSeo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(a.meta)}">
<link rel="canonical" href="${url}">
${hreflangs(null)}
<meta property="og:type" content="website">
<meta property="og:locale" content="${ui.htmlLang === 'fr' ? 'fr_FR' : 'en_GB'}">
<meta property="og:site_name" content="Éditeur PDF">
<meta property="og:title" content="${esc(a.titreSeo)}">
<meta property="og:description" content="${esc(a.meta)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/apercu-editeur.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style-outil.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>

<div class="hnav"><div class="in">
  <a class="brand" href="${lang.prefixe}/"><i>${LOGO}</i>Éditeur PDF</a>
  <nav>
    <a href="#outils">${esc(ui.navOutils)}</a>
    <a href="#confiance">${esc(ui.navConfiance)}</a>
    <a href="#questions">${esc(ui.navQuestions)}</a>
    ${selecteurLangue(lang, null)}
  </nav>
</div></div>

<header class="tete"><div class="sec">
  <p style="margin:0 0 6px"><span class="pastille"><b></b>${esc(a.badge)}</span></p>
  <h1>${esc(a.h1a)} ${esc(a.h1b)} ${esc(a.h1c)}</h1>
  <p class="chapo">${esc(a.accroche)} <strong>${esc(a.accrocheFort)}</strong>${esc(a.accrocheFin)}</p>
  <p class="apres" style="margin-top:22px">
    <strong>${esc(a.demoAvant)} <s>${esc(a.demoAvantDate)}</s> → ${esc(a.demoApresDate)}</strong><br>
    ${esc(a.legende)}</p>
  <p style="margin-top:26px"><a class="dl" style="display:inline-block" href="#outils">${esc(a.ctaOutils)}</a></p>
  <img src="/apercu-editeur.png" width="1360" height="850" loading="lazy" decoding="async"
       alt="${esc(a.legende)}" style="width:100%;height:auto;border-radius:14px;margin-top:26px;box-shadow:0 20px 50px -20px rgba(20,26,36,.45)">
  <p class="fil" style="margin-top:12px">${esc(a.noteEditeur)}</p>
</div></header>

<main class="sec corps">
  <h2 id="outils">${esc(a.titreOutils)}</h2>
  <p>${esc(a.introOutils)}</p>
  ${base.GROUPES.map((gr, i) => `
  <h3 style="margin:30px 0 10px">${esc(lang.groupes[i])}</h3>
  <div class="autres">
    ${gr.cles.map(carte).join('\n    ')}
  </div>`).join('')}
  <h3 style="margin:30px 0 10px">${esc(ui.plan.autres)}</h3>
  <div class="autres">
    ${carte('fusion')}
  </div>

  <h2 id="confiance">${esc(a.titreConfiance)}</h2>
  <p>${a.introConfiance}</p>
  <div class="deux">
    <div class="bloc non">
      <h3>${esc(a.euxTitre)}</h3>
      <ul>${a.eux.map(t => `<li>${CROIX}<span>${t}</span></li>`).join('')}</ul>
    </div>
    <div class="bloc oui">
      <h3>${esc(a.nousTitre)}</h3>
      <ul>${a.nous.map(t => `<li>${COCHE}<span>${t}</span></li>`).join('')}</ul>
    </div>
  </div>

  <h2>${esc(ui.gratuitTitre)}</h2>
  <div class="confiance">
    <p style="margin:0">${esc(ui.gratuitP1)}</p>
    <p style="margin:12px 0 0"><b>${esc(ui.gratuitP2fort)}</b>${esc(ui.gratuitP2)}</p>
  </div>

  <h2 id="questions">${esc(a.titreQuestions)}</h2>
  ${a.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${esc(f.q)}</summary>
    <p>${esc(f.r)}</p>
  </details>`).join('\n  ')}
</main>

<div class="pied"><div class="in">
  <span>${esc(ui.piedPhrase)}</span>
  <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a>
</div></div>
</body>
</html>
`;
}

/* ---------------- écriture ---------------- */

let n = 0;
const urls = [];
for (const lang of LANGUES){
  urls.push({ loc: accueilDe(lang), cle: null, prio: lang.code === 'fr' ? '1.0' : '0.9' });
  if (lang.code !== 'fr'){
    const d = path.join(RACINE, lang.prefixe.replace(/^\//, ''));
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), accueilTraduit(lang), 'utf8');
  }
  for (const cle of Object.keys(lang.outils)){
    const dossier = path.join(RACINE, lang.prefixe.replace(/^\//, ''), lang.outils[cle].slug);
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, 'index.html'), page(lang, cle), 'utf8');
    urls.push({ loc: urlDe(lang, cle), cle, prio: '0.8' });
    n++;
  }
}

/* Le sitemap porte les alternatives : c'est la déclaration de langues la plus sûre,
   un lien hreflang oublié dans une page passant alors inaperçu. */
const alt = u => LANGUES.map(l =>
  `    <xhtml:link rel="alternate" hreflang="${l.ui.htmlLang}" href="${u.cle ? urlDe(l, u.cle) : accueilDe(l)}"/>`).join('\n');

fs.writeFileSync(path.join(RACINE, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n${alt(u)}\n` +
    `    <lastmod>${JOUR}</lastmod>\n    <priority>${u.prio}</priority>\n  </url>`).join('\n') +
  '\n</urlset>\n', 'utf8');

fs.writeFileSync(path.join(RACINE, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

console.log(`${n} page(s) d'outil sur ${LANGUES.length} langue(s), sitemap de ${urls.length} adresses.`);
module.exports = { LANGUES, urlDe, accueilDe, hreflangs, selecteurLangue, UI_FR, esc, LOGO, FAVICON, JOUR };
