/* Génère une page par outil : <slug>/index.html, plus sitemap.xml et robots.txt.
   Relancer après toute modification de outils-data.js :
       node build-pages.js
   Les pages sont écrites sur le disque et versionnées : le site reste statique,
   et chaque outil a une vraie adresse, indexable et partageable. */
const fs = require('fs');
const path = require('path');
const { OUTILS, GROUPES, SITE } = require('./outils-data.js');

const RACINE = __dirname;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonEsc = s => JSON.stringify(String(s));

const COCHE  = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>';
const CROIX  = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const LOGO   = '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h10M5 18h7"/></svg>';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231762e0'/%3E%3Cpath d='M9 10h14M9 16h10M9 22h7' stroke='%23fff' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";

function etapes(o){
  const quoi = o.multiple ? 'vos fichiers' : 'votre fichier';
  return [
    `Déposez ${quoi} sur la page, ou cliquez pour ${o.multiple ? 'les' : 'le'} choisir dans vos dossiers.`,
    'Lancez la conversion. Elle se déroule dans votre navigateur : rien n\'est envoyé sur un serveur.',
    'Téléchargez le résultat. Sans compte, sans filigrane et sans attente dans une file.'
  ];
}

const lien = (k, texte) => `<a href="/${OUTILS[k].slug}/">${esc(texte || OUTILS[k].carte)}</a>`;

function carteOutil(k){
  const o = OUTILS[k];
  return `<a href="/${o.slug}/"><span class="ico ${o.couleur}"><svg viewBox="0 0 24 24">${o.ico}</svg></span>${esc(o.carte)}</a>`;
}

/* Tous les outils en pied de page : chaque page en cite chaque autre, ce qui
   répartit la popularité interne au lieu de la concentrer sur l'accueil. */
function plan(cleCourante){
  return GROUPES.map(gr =>
    `<div><strong>${esc(gr.titre)}</strong><ul>` +
    gr.cles.map(k => k === cleCourante
      ? `<li><span aria-current="page">${esc(OUTILS[k].carte)}</span></li>`
      : `<li>${lien(k)}</li>`).join('') +
    '</ul></div>').join('\n    ')
    + `\n    <div><strong>Autres outils</strong><ul>`
    + `<li><a href="/">Modifier le texte d'un PDF</a></li>`
    + (cleCourante === 'fusion' ? '<li><span aria-current="page">Fusionner des PDF</span></li>'
                                : `<li>${lien('fusion')}</li>`)
    + '</ul></div>';
}

function page(cle){
  const o = OUTILS[cle];
  const url = `${SITE}/${o.slug}/`;
  const et = etapes(o);

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: o.titre, url,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Tout navigateur web',
        description: o.meta, inLanguage: 'fr',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } },
      { '@type': 'HowTo', name: o.h1, inLanguage: 'fr',
        step: et.map((t, i) => ({ '@type': 'HowToStep', position: i + 1, text: t })) },
      { '@type': 'FAQPage', inLanguage: 'fr',
        mainEntity: o.faq.map(f => ({ '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: o.carte, item: url } ] }
    ]
  };

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${esc(o.titreSeo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(o.meta)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Éditeur PDF">
<meta property="og:title" content="${esc(o.titreSeo)}">
<meta property="og:description" content="${esc(o.meta)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style-outil.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>

<div class="hnav"><div class="in">
  <a class="brand" href="/"><i>${LOGO}</i>Éditeur PDF</a>
  <nav>
    <a href="/">Modifier un PDF</a>
    <a href="/#outils">Tous les outils</a>
    <a href="/#confiance">Confidentialité</a>
  </nav>
</div></div>

<header class="tete"><div class="sec">
  <p class="fil"><a href="/">Accueil</a> › ${esc(o.carte)}</p>
  <h1>${esc(o.h1)}</h1>
  <p class="chapo">${esc(o.chapo)}</p>
  <p style="margin-top:18px"><span class="pastille"><b></b>Gratuit · sans compte · aucun fichier téléversé</span></p>

  <label class="zone" id="zone" for="fichier">
    <div class="gros">${o.multiple ? 'Déposez vos fichiers ici' : 'Déposez votre fichier ici'}</div>
    <div class="pet">${o.multiple ? 'ou cliquez pour les choisir' : 'ou cliquez pour le choisir'}</div>
  </label>
  <input id="fichier" type="file" hidden>
  <ul class="liste" id="liste"></ul>
  <button class="go" id="go" disabled>Convertir</button>

  <div class="barre" id="barre" hidden><i></i></div>
  <div class="etat" id="etat" hidden></div>
  <div class="err" id="err" hidden></div>

  <div class="fini" id="fini" hidden>
    <div class="ok"><svg viewBox="0 0 24 24"><path d="m4 12.5 5.5 5.5L20 7"/></svg></div>
    <b>Conversion terminée</b>
    <div class="nom" id="fini-nom"></div>
    <a class="dl" id="dl" download>Télécharger</a>
    <button class="encore" id="encore">Convertir un autre fichier</button>
    <a class="avis" href="https://g.page/r/CfBfIXTvKKmwEAE/review" target="_blank" rel="noopener">
      Ça vous a rendu service ?<br><b>Donner mon avis</b></a>
  </div>
</div></header>

<main class="sec corps">

  <p class="intro">${esc(o.contexte)}</p>

  <h2>${esc(o.h1)} en trois étapes</h2>
  <div class="etapes">
    ${et.map(t => `<div class="etape"><p>${esc(t)}</p></div>`).join('\n    ')}
  </div>

  <h2>Quand cet outil sert vraiment</h2>
  <div class="usages">
    ${o.usages.map(u => `<div class="usage"><h3>${esc(u.t)}</h3><p>${esc(u.d)}</p></div>`).join('\n    ')}
  </div>

  <h2>Ce que la conversion conserve, et ce qu'elle perd</h2>
  <p>Convertir dans un navigateur impose des limites qu'un service hébergé n'a pas.
     Les voici en clair, pour que vous sachiez à quoi vous attendre avant de commencer.</p>
  <div class="deux">
    <div class="bloc oui">
      <h3>Conservé</h3>
      <ul>${o.garde.map(t => `<li>${COCHE}<span>${esc(t)}</span></li>`).join('')}</ul>
    </div>
    <div class="bloc non">
      <h3>Non repris</h3>
      <ul>${o.perdu.map(t => `<li>${CROIX}<span>${esc(t)}</span></li>`).join('')}</ul>
    </div>
  </div>
  ${o.inverse ? `<p class="apres">Besoin du chemin inverse ? ${lien(o.inverse, o.inverse && OUTILS[o.inverse].carte)}
     fait exactement l'opération contraire, avec les mêmes garanties.</p>` : ''}

  <h2>Bon à savoir sur le format</h2>
  <p>${esc(o.format)}</p>

  <h2>Et si ce n'est pas le bon outil ?</h2>
  <ul class="renvois">
    ${o.lies.map(l => `<li>${lien(l.cle, OUTILS[l.cle].carte)} — ${esc(l.r)}</li>`).join('\n    ')}
  </ul>

  <h2>Pourquoi c'est gratuit</h2>
  <div class="confiance">
    <p style="margin:0">Les services de conversion en ligne reçoivent votre fichier sur leurs
    serveurs, le traitent, puis promettent de l'effacer. Chaque document leur coûte du temps de
    calcul : c'est pour cela qu'ils facturent, et qu'ils limitent la taille des fichiers.</p>
    <p style="margin:12px 0 0"><b>Ici, la conversion se fait sur votre ordinateur.</b> La page
    ne contient aucun code serveur : votre document ne peut pas être reçu, puisqu'il n'est jamais
    envoyé. Il n'y a donc rien à facturer, rien à limiter, et rien à effacer ensuite. Coupez votre
    connexion après le chargement de la page : tout continue de fonctionner.</p>
  </div>

  <h2>Questions fréquentes</h2>
  ${o.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${esc(f.q)}</summary>
    <p>${esc(f.r)}</p>
  </details>`).join('\n  ')}

  <h2>Les autres outils</h2>
  <div class="autres">
    ${o.lies.map(l => carteOutil(l.cle)).join('\n    ')}
  </div>
  <p class="apres"><a href="/"><strong>Modifier le texte d'un PDF</strong></a> —
     corriger une ligne déjà écrite, même sur un document scanné. C'est la fonction que les
     autres services réservent à leurs formules payantes, et le point de départ naturel quand
     il faut retoucher avant de convertir.</p>
</main>

<nav class="plan" aria-label="Tous les outils"><div class="in">
  ${plan(cle)}
</div></nav>

<div class="pied"><div class="in">
  <span>Construit avec pdf.js, pdf-lib et fflate — tout est embarqué, aucun appel réseau.</span>
  <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">Code source</a>
</div></div>

<script src="/vendor/pdf.min.js"></script>
<script src="/vendor/pdf-lib.min.js"></script>
<script src="/vendor/fflate.min.js"></script>
<script src="/outils-data.js"></script>
<script src="/convert.js"></script>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
window.OUTIL_COURANT = ${jsonEsc(cle)};
</script>
<script src="/outil.js"></script>
</body>
</html>
`;
}

let n = 0;
const urls = [SITE + '/'];
for (const cle of Object.keys(OUTILS)){
  const o = OUTILS[cle];
  const dossier = path.join(RACINE, o.slug);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), page(cle), 'utf8');
  urls.push(`${SITE}/${o.slug}/`);
  n++;
}

const jour = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(RACINE, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u, i) => `  <url><loc>${u}</loc><lastmod>${jour}</lastmod>` +
    `<priority>${i === 0 ? '1.0' : '0.8'}</priority></url>`).join('\n') +
  '\n</urlset>\n', 'utf8');

fs.writeFileSync(path.join(RACINE, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

console.log(`${n} page(s) d'outil générée(s), sitemap de ${urls.length} adresses.`);
