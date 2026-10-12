/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
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
/* Vérification de propriété Google Search Console, posée sur toutes les pages :
   la validation tient quelle que soit l'URL déclarée dans la console. */
const GSC = '<meta name="google-site-verification" content="vbmtfEKob3NfEM7iX_1giermuIPpd27wY6HxTupUOTY">';
const jsonEsc = s => JSON.stringify(String(s));
/* Clé de site Turnstile : publique par construction, elle est faite pour être
   lue dans le HTML. La clé secrète, elle, vit dans l'environnement Netlify sous
   TURNSTILE_SECRET et n'apparaît nulle part dans ce dépôt, qui est public. */
const TURNSTILE_SITEKEY = '0x4AAAAAAFU9P7fPGn42gSV-';
/* Clé IndexNow. Publique par construction : le protocole exige qu'elle soit
   lisible à la racine du site, c'est ce fichier qui prouve qu'on en est
   propriétaire. La changer obligerait à resoumettre tout le site. */
const INDEXNOW = '67ffc0350a7cb80c22ef26d6c6a1798b';

const COCHE = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>';
const CROIX = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const LOGO  = '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h10M5 18h7"/></svg>';
const GLYPHE = '<span class="glyphe"><svg viewBox="0 0 24 24"><path d="M6 6h12M6 12h8M6 18h5"/></svg></span>';
const ETOILE = '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z"/></svg>';
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
  gratuitP2: " La page ne contient aucun code serveur : votre document ne peut pas être reçu, puisqu'il n'est jamais envoyé. Il n'y a donc rien à facturer, rien à limiter, et rien à effacer ensuite.",
  gratuitHorsLigne: " Coupez votre connexion après le chargement de la page : tout continue de fonctionner.",
  /* Sur les outils de langue, promettre le hors-ligne serait faux : le modèle se
     télécharge. On le dit, en précisant le sens de l'échange. */
  gratuitModele: " Seule exception ici : le modèle de langue, récupéré une fois puis gardé en cache par votre navigateur. C'est le seul échange réseau de la page, et il va dans ce sens-là — votre document, lui, ne monte jamais.",
  questionsTitre: 'Questions fréquentes',
  autresTitre: 'Les autres outils',
  inverseTexte: lien => `Besoin du chemin inverse ? ${lien} fait exactement l'opération contraire, avec les mêmes garanties.`,
  editeurRenvoi: "corriger une ligne déjà écrite, même sur un document scanné. C'est la fonction que les autres services réservent à leurs formules payantes, et le point de départ naturel quand il faut retoucher avant de convertir.",
  piedPhrase: 'Construit avec pdf.js, pdf-lib, tesseract.js et fflate — vos fichiers restent dans votre navigateur.',
  codeSource: 'Code source',
  rappelA: 'Un PDF à corriger ?', rappelB: 'Il ne quittera pas votre ordinateur.',
  rappelBouton: "Ouvrir l'éditeur",
  piedPitch: "Modifier, convertir et assembler des PDF sans rien téléverser. Vingt-six outils, pas de compte, pas de file d'attente, pas de fichier qui traîne sur un serveur.",
  sceauTitre: "Rien n'est téléversé",
  sceauTexte: 'Tout le traitement a lieu dans votre navigateur, y compris la reconnaissance des documents scannés.',
  badgeA: 'Outil open source, fait avec ', badgeB: ' en France',
  piedProjet: 'Le projet', piedEditeur: "L'éditeur",
  piedConfidentialite: 'Confidentialité', piedQuestions: 'Questions fréquentes',
  piedFin: 'Aucun suivi, aucun cookie, aucun compte.',
  etapes: multiple => [
    `Déposez ${multiple ? 'vos fichiers' : 'votre fichier'} sur la page, ou cliquez pour ${multiple ? 'les' : 'le'} choisir dans vos dossiers.`,
    "Lancez le traitement. Il se déroule dans votre navigateur : rien n'est envoyé sur un serveur.",
    "Téléchargez le résultat. Sans compte, sans filigrane et sans attente dans une file."
  ],
  etapesNoms: ['Ouvrir le fichier', 'Lancer le traitement', 'Télécharger le résultat'],
  plan: { autres: 'Autres outils', editeur: "Modifier le texte d'un PDF", fusion: 'Fusionner des PDF' },

  /* Pages juridiques. Tout ce qui y est écrit a été relevé dans le code : aucune
     formule de style, aucune promesse que le site ne tiendrait pas. */
  pages: {
    confidentialite: {
      slug: 'confidentialite', lien: 'Confidentialité',
      titreSeo: 'Confidentialité — VoilàPDF',
      meta: "Ce que VoilàPDF collecte, et ce qu'il ne collecte pas. Aucun cookie, aucune mesure d'audience, et vos documents ne quittent jamais votre ordinateur.",
      h1: 'Confidentialité',
      chapo: "Cette page décrit exactement ce qui se passe quand vous utilisez le site. Elle a été écrite en relisant le code, pas en recopiant un modèle.",
      maj: 'Dernière mise à jour :',
      sections: [
        { t: 'En deux phrases',
          note: "Vos documents sont lus et modifiés par votre navigateur ; ils ne sont envoyés nulle part et nous ne pouvons pas les voir. Les seules données que nous recevons sont celles que vous nous écrivez volontairement dans le formulaire de contact." },
        { t: "Ce que le site ne fait pas",
          p: ["Ces points ne sont pas des engagements de principe : ils sont vérifiables dans le code source, qui est public."],
          l: ["<strong>Aucun cookie.</strong> Le site n'en dépose aucun, ni technique, ni publicitaire. C'est pourquoi vous ne voyez pas de bandeau de consentement : il n'y a rien à consentir.",
              "<strong>Aucune mesure d'audience.</strong> Ni Google Analytics, ni équivalent. Nous ne savons pas combien de personnes visitent le site, ni ce qu'elles y font.",
              "<strong>Aucun stockage sur votre appareil.</strong> Ni <code>localStorage</code>, ni base de données locale. Fermez l'onglet, il ne reste rien.",
              "<strong>Aucun compte.</strong> Rien à créer, donc aucun identifiant, aucun mot de passe, aucune adresse e-mail à fournir pour utiliser les outils.",
              "<strong>Aucune police distante.</strong> Les polices sont servies depuis notre propre domaine ; aucun appel n'est fait à Google Fonts ou à un service équivalent."] },
        { t: 'Vos documents',
          p: ["Les vingt-six outils s'exécutent entièrement dans votre navigateur, en JavaScript et WebAssembly. Le fichier que vous déposez est lu depuis votre disque par la page elle-même, transformé en mémoire, puis réenregistré chez vous. À aucun moment il ne transite par un serveur.",
              "Ce n'est pas une politique interne que nous pourrions changer discrètement : le site est un ensemble de fichiers statiques, il ne comporte aucun code capable de recevoir un document. La vérification est à votre portée — ouvrez un outil, coupez votre connexion, il continue de fonctionner."],
          note: "Une limite à connaître, qui concerne votre confidentialité et non la nôtre : lorsque vous modifiez ou masquez du texte dans un PDF, l'ancien texte reste présent dans le fichier, recouvert visuellement. Ce n'est pas un caviardage. Ne vous en servez pas pour dissimuler une donnée sensible avant de transmettre un document." },
        { t: 'Les trois exceptions, en clair',
          p: ["Trois fonctions, et elles seules, provoquent un échange avec l'extérieur. Chacune est signalée sur la page concernée."],
          defs: [
            ['Hébergement',
             "Le site est hébergé par Netlify, qui enregistre comme tout hébergeur des journaux techniques : adresse IP, date, page demandée, navigateur utilisé. Ces journaux servent à faire fonctionner et sécuriser le service. Nous ne les consultons pas et n'en tirons aucune statistique."],
            ['Résumer et traduire un PDF',
             "Ces deux outils utilisent un modèle de langue qui s'exécute sur votre machine. Au premier usage, le modèle lui-même est téléchargé depuis Hugging Face, qui voit alors votre adresse IP — comme n'importe quel site que vous visitez. Le sens de l'échange compte : le modèle descend vers vous, votre document ne monte jamais. Les traitements suivants n'appellent plus rien, le navigateur gardant le modèle en cache."],
            ['Formulaire de contact',
             "Si vous nous écrivez, votre nom, votre adresse e-mail, votre message et la pièce jointe éventuelle sont transmis et conservés chez Netlify. Cette page utilise aussi Cloudflare Turnstile pour écarter les robots : Cloudflare reçoit votre adresse IP et des signaux techniques sur votre navigateur, le temps de la vérification. Turnstile n'est pas un outil publicitaire et ne vous suit pas d'un site à l'autre."]
          ] },
        { t: 'Transferts hors de l\'Union européenne',
          p: ["Netlify, Cloudflare et Hugging Face sont des sociétés établies aux États-Unis. Les données techniques décrites ci-dessus, ainsi que les messages envoyés par le formulaire, peuvent donc être traitées hors de l'Union européenne, dans le cadre des clauses contractuelles types et du cadre de protection des données UE–États-Unis.",
              "C'est précisément pour éviter ce transfert que le traitement des documents, lui, reste chez vous."] },
        { t: 'Durée de conservation',
          p: ["Les messages reçus par le formulaire sont conservés le temps de traiter votre demande, puis trois ans au plus, délai au terme duquel ils sont supprimés. Vous pouvez demander leur effacement à tout moment.",
              "Les journaux techniques de l'hébergeur suivent la politique de rétention de Netlify et nous échappent."] },
        { t: 'Vos droits',
          p: ["Le règlement général sur la protection des données vous ouvre un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur les données vous concernant. En pratique, cela ne porte ici que sur les messages que vous nous auriez envoyés : c'est la seule chose que nous détenions.",
              "Pour exercer ces droits, écrivez à <a href=\"mailto:aubryetienne@icloud.com\">aubryetienne@icloud.com</a> ou passez par la page <a href=\"/contact/\">Nous écrire</a>. Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL, 3 place de Fontenoy, 75007 Paris, ou déposer une plainte sur <a href=\"https://www.cnil.fr\" target=\"_blank\" rel=\"noopener\">cnil.fr</a>."] },
        { t: 'Responsable du traitement',
          p: ["Fix72, entreprise individuelle, 6 impasse Élisabeth Vigée Lebrun, 72000 Le Mans — SIRET 512 645 045 00042. Les détails figurent dans les <a href=\"/mentions-legales/\">mentions légales</a>."] }
      ]
    },

    mentions: {
      slug: 'mentions-legales', lien: 'Mentions légales',
      titreSeo: 'Mentions légales — VoilàPDF',
      meta: "Éditeur, directeur de la publication, hébergeur et licence de VoilàPDF.",
      h1: 'Mentions légales',
      chapo: "Informations publiées en application de l'article 6-III de la loi pour la confiance dans l'économie numérique.",
      maj: 'Dernière mise à jour :',
      sections: [
        { t: 'Éditeur du site',
          defs: [
            ['Dénomination', 'Fix72'],
            ['Forme juridique', 'Entreprise individuelle'],
            ['Siège', '6 impasse Élisabeth Vigée Lebrun, 72000 Le Mans, France'],
            ['SIREN', '512 645 045'],
            ['SIRET', '512 645 045 00042'],
            ['Téléphone', '<a href="tel:+33751133769">07 51 13 37 69</a>'],
            ['Courriel', '<a href="mailto:aubryetienne@icloud.com">aubryetienne@icloud.com</a>'],
            ['Contact', '<a href="/contact/">Formulaire de contact</a>']
          ] },
        { t: 'Directeur de la publication',
          p: ['Étienne Aubry, en qualité de responsable de l\'entreprise individuelle Fix72.'] },
        { t: 'Hébergeur',
          defs: [
            ['Société', 'Netlify, Inc.'],
            ['Adresse', '101 2nd Street, San Francisco, CA 94105-2239, États-Unis'],
            ['Site', '<a href="https://www.netlify.com" target="_blank" rel="noopener">netlify.com</a>']
          ],
          p: ["Netlify ne publie pas de numéro de téléphone destiné au public ; ses coordonnées de contact figurent sur son site."] },
        { t: 'Licence et code source',
          p: ["VoilàPDF est un logiciel libre publié sous licence <a href=\"https://github.com/dilmseo/editeur-pdf/blob/main/LICENSE\" target=\"_blank\" rel=\"noopener\">GNU AGPL version 3</a>. Le code source complet est consultable sur <a href=\"https://github.com/dilmseo/editeur-pdf\" target=\"_blank\" rel=\"noopener\">GitHub</a>.",
              "Vous pouvez l'utiliser, l'étudier, le modifier et le redistribuer, y compris à des fins commerciales. La contrepartie tient à l'article 13 de cette licence : si vous exploitez une version modifiée accessible par un réseau, vous devez en proposer le code source à ses utilisateurs.",
              "Les bibliothèques tierces embarquées restent sous leurs propres licences : pdf.js et tesseract.js sous Apache 2.0, pdf-lib et fflate sous licence MIT, transformers.js sous Apache 2.0. Le détail figure dans le fichier <a href=\"https://github.com/dilmseo/editeur-pdf#readme\" target=\"_blank\" rel=\"noopener\">README</a> du dépôt."] },
        { t: 'Limites du service',
          p: ["Les outils sont fournis gratuitement et sans garantie, conformément aux termes de la licence. Chaque page d'outil indique précisément ce que la conversion conserve et ce qu'elle perd ; ces limites sont réelles et documentées, nous vous invitons à les lire avant de traiter un document important.",
              "Deux points méritent d'être rappelés ici. La modification de texte recouvre l'ancien contenu sans le supprimer du fichier : ce n'est pas un caviardage. La signature manuscrite proposée est l'équivalent numérique d'un paraphe, non une signature électronique qualifiée au sens du règlement eIDAS.",
              "Conservez toujours une copie de vos documents d'origine."] },
        { t: 'Données personnelles',
          p: ["Le traitement des données est décrit dans la page <a href=\"/confidentialite/\">Confidentialité</a>. En résumé : aucun cookie, aucune mesure d'audience, et vos documents ne quittent pas votre ordinateur."] },
        { t: 'Liens et signalement',
          p: ["Le site renvoie vers des ressources extérieures dont nous ne maîtrisons pas le contenu. Pour signaler un contenu illicite, une erreur ou un dysfonctionnement, utilisez la page <a href=\"/contact/\">Nous écrire</a>."] }
      ]
    }
  },
  contact: {
    slug: 'contact', lien: 'Nous écrire',
    titreSeo: 'Contact — VoilàPDF',
    meta: "Signaler un défaut, proposer un outil ou poser une question sur VoilàPDF. Une réponse sous quelques jours, par une personne.",
    h1: 'Nous écrire',
    chapo: "Un outil qui se comporte mal, un PDF qu'il refuse, une idée d'outil manquant : écrivez. C'est la seule page du site qui envoie quelque chose sur un serveur, et elle le dit.",
    nom: 'Votre nom', nomEx: 'Prénom et nom',
    email: 'Votre adresse e-mail', emailEx: 'pour recevoir la réponse',
    sujet: 'Sujet',
    sujets: [['bug', 'Un défaut à signaler'], ['outil', 'Une idée d\'outil'],
             ['question', 'Une question'], ['autre', 'Autre chose']],
    message: 'Votre message',
    messageEx: "Décrivez ce que vous avez fait, ce que vous attendiez, et ce qui s'est passé à la place.",
    fichier: 'Joindre un fichier',
    fichierAide: "Facultatif, 3 Mo maximum (PDF, image ou texte). Attention : ce fichier-là, contrairement à ceux que vous traitez avec les outils, est bien envoyé sur un serveur. N'y mettez rien de confidentiel.",
    fichierChoisir: 'Choisir un fichier', fichierRetirer: 'Retirer',
    envoyer: 'Envoyer le message', envoi: 'Envoi…',
    merciTitre: 'Message envoyé',
    merci: "Merci. Nous lisons tout et répondons sous quelques jours, à l'adresse que vous avez indiquée.",
    encore: 'Écrire un autre message',
    avertTitre: 'Ce que devient votre message',
    avert: "Les messages arrivent dans une boîte hébergée par Netlify et ne servent qu'à vous répondre : ni liste de diffusion, ni revente, ni statistiques. Cloudflare Turnstile protège le formulaire des robots ; il ne pose pas de cookie publicitaire et ne vous suit pas d'un site à l'autre. Le reste de VoilàPDF continue de fonctionner sans rien envoyer : ouvrez n'importe quel outil, coupez votre connexion, il marche toujours.",
    erreurs: {
      champs: 'Le nom et le message sont obligatoires.',
      email: "Cette adresse e-mail ne semble pas valide.",
      jeton: "Veuillez patienter : la vérification anti-robot n'est pas terminée.",
      refus: "La vérification anti-robot a échoué. Rechargez la page et réessayez.",
      taille: 'Le fichier dépasse 3 Mo.',
      type: 'Ce type de fichier n\'est pas accepté.',
      reseau: "L'envoi a échoué. Vérifiez votre connexion et réessayez.",
      config: "Le formulaire est momentanément indisponible."
    }
  }
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

/* Pied commun aux pages d'outil et a la page de contact : c'est lui qui porte le
   maillage vers les 24 outils, il n'y avait pas de raison de l'ecrire deux fois.
   `cle` vaut null hors d'une page d'outil ; aucun lien n'est alors neutralise.
   Un renvoi vers la page courante n'est pas un lien : il ne sert ni le lecteur
   ni le maillage, d'ou `estContact`. */
function pied(lang, cle, estContact){
  const ui = lang.ui;
  const p = ui.accueil || ui;
  const lien = (k, texte) => `<a href="${lang.prefixe}/${lang.outils[k].slug}/">${esc(texte || lang.outils[k].carte)}</a>`;
  const ligne = k => k === cle
    ? `<li><span aria-current="page">${esc(lang.outils[k].carte)}</span></li>`
    : `<li>${lien(k)}</li>`;
  const colonnes = base.GROUPES.map((gr, i) =>
      `<div${gr.cles.length > 6 ? ' class="double"' : ''}><h4>${esc(lang.groupes[i])}</h4><ul>`
      + gr.cles.map(ligne).join('')
      + (i === 1 ? ligne('fusion') : '')
      + '</ul></div>').join('\n    ');
  const contact = `${lang.prefixe}/${ui.contact.slug}/`;

  return `<footer class="pied">
  <div class="rappel">
    <p class="mot">${esc(p.rappelA)}<br><span>${esc(p.rappelB)}</span></p>
    <a class="bouton" href="${lang.prefixe}/">${esc(p.rappelBouton)}</a>
  </div>
  <div class="cols">
    <div>
      <span class="marque">${GLYPHE}VoilàPDF</span>
      <p class="pitch">${esc(p.piedPitch)}</p>
      <div class="sceau">
        <svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>
        <span><b>${esc(p.sceauTitre)}</b>${esc(p.sceauTexte)}</span>
      </div>
      <a class="etoiles" href="https://g.page/r/CfBfIXTvKKmwEAE/review" target="_blank" rel="noopener">
        ${ETOILE.repeat(5)}<em>${esc(ui.avisLien)}</em></a>
    </div>
    ${colonnes}
    <div><h4>${esc(p.piedProjet)}</h4><ul>
      <li><a href="${lang.prefixe}/">${esc(p.piedEditeur)}</a></li>
      <li><a href="${lang.prefixe}/#confiance">${esc(p.piedConfidentialite)}</a></li>
      <li><a href="${lang.prefixe}/#questions">${esc(p.piedQuestions)}</a></li>
      <li>${estContact ? `<span aria-current="page">${esc(ui.contact.lien)}</span>`
                        : `<a href="${contact}">${esc(ui.contact.lien)}</a>`}</li>
      <li><a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a></li>
    </ul></div>
  </div>
  <div class="bas">
    <span>${esc(ui.piedPhrase)}</span>
    <a href="${lang.prefixe}/${ui.pages.mentions.slug}/">${esc(ui.pages.mentions.lien)}</a>
    <a href="${lang.prefixe}/${ui.pages.confidentialite.slug}/">${esc(ui.pages.confidentialite.lien)}</a>
    <a href="${contact}">${esc(ui.contact.lien)}</a>
    <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a>
    <span class="fin">
      <svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6z"/></svg>
      ${esc(p.piedFin)}
    </span>
  </div>
</footer>

<a class="badge-fr" href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">
  <span class="drapeau" aria-hidden="true"><i></i><i></i><i></i></span>
  <span>${esc(p.badgeA)}<b>&#9829;</b>${esc(p.badgeB)}</span>
</a>`;
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

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SITE + '/#editeur', name: 'VoilàPDF', url: SITE + '/',
        logo: { '@type': 'ImageObject', url: SITE + '/apercu-editeur.png' },
        sameAs: ['https://github.com/dilmseo/editeur-pdf'] },
      { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'VoilàPDF',
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
${GSC}
<link rel="canonical" href="${url}">
${hreflangs(cle)}
<meta property="og:type" content="website">
<meta property="og:locale" content="${ui.htmlLang === 'fr' ? 'fr_FR' : 'en_GB'}">
<meta property="og:site_name" content="VoilàPDF">
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
  <a class="brand" href="${lang.prefixe}/"><i>${LOGO}</i>VoilàPDF</a>
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
    <p style="margin:12px 0 0"><b>${esc(ui.gratuitP2fort)}</b>${esc(ui.gratuitP2)}${
      esc(o.ia ? (ui.gratuitModele || '') : (ui.gratuitHorsLigne || ''))}</p>
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

${pied(lang, cle)}

<script src="/vendor/pdf.min.js"></script>
<script src="/vendor/pdf-lib.min.js"></script>
<script src="/vendor/fflate.min.js"></script>${o.tesseract ? '\n<script src="/vendor/tesseract.min.js"></script>' : ''}
<script src="/outils-data.js"></script>${lang.code === 'fr' ? '' : `\n<script src="/textes/${lang.code}.js"></script>`}
<script src="/convert.js"></script>
<script src="/pdf-outils.js"></script>${o.ia ? '\n<script src="/ia.js"></script>' : ''}
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

/* ---------------- pages de texte (confidentialité, mentions légales) ----------
   Un rendu unique pour les pages purement redactionnelles : sections titrees,
   paragraphes, listes et encadres. Le contenu vit dans les textes de langue,
   jamais ici — une page juridique se relit, elle ne se cherche pas dans du code. */
function pageTexte(lang, cle){
  const ui = lang.ui;
  const k = ui.pages[cle];
  const url = `${SITE}${lang.prefixe}/${k.slug}/`;
  const alts = LANGUES.map(l =>
      `<link rel="alternate" hreflang="${l.ui.htmlLang}" href="${SITE}${l.prefixe}/${l.ui.pages[cle].slug}/">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${LANGUES[0].prefixe}/${LANGUES[0].ui.pages[cle].slug}/">`;

  const bloc = s =>
      `<h2>${esc(s.t)}</h2>\n`
    + (s.p || []).map(t => `  <p>${t}</p>`).join('\n')
    + ((s.l || []).length ? `\n  <ul class="renvois">${s.l.map(t => `<li>${t}</li>`).join('')}</ul>` : '')
    + (s.note ? `\n  <div class="confiance"><p style="margin:0">${s.note}</p></div>` : '')
    + ((s.defs || []).length
        ? `\n  <dl class="metas">${s.defs.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${b}</dd>`).join('')}</dl>`
        : '');

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': url + '#page', url, name: k.titreSeo, description: k.meta,
        inLanguage: ui.htmlLang, isPartOf: { '@id': SITE + '/#site' }, dateModified: JOUR,
        publisher: { '@id': SITE + '/#editeur' } }
    ]
  };

  return `<!doctype html>
<html lang="${ui.htmlLang}">
<head>
<meta charset="utf-8">
<title>${esc(k.titreSeo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(k.meta)}">
${GSC}
<link rel="canonical" href="${url}">
${alts}
<meta property="og:type" content="website">
<meta property="og:site_name" content="VoilàPDF">
<meta property="og:title" content="${esc(k.titreSeo)}">
<meta property="og:description" content="${esc(k.meta)}">
<meta property="og:url" content="${url}">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style-outil.css">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>

<div class="hnav"><div class="in">
  <a class="brand" href="${lang.prefixe}/"><i>${LOGO}</i>VoilàPDF</a>
  <nav>
    <a href="${lang.prefixe}/#outils">${esc(ui.navOutils)}</a>
    <a href="${lang.prefixe}/#confiance">${esc(ui.navConfiance)}</a>
    <a href="${lang.prefixe}/#questions">${esc(ui.navQuestions)}</a>
    ${LANGUES.map(l => l.code === lang.code
        ? `<b>${l.code.toUpperCase()}</b>`
        : `<a href="${SITE}${l.prefixe}/${l.ui.pages[cle].slug}/" hreflang="${l.ui.htmlLang}">${l.code.toUpperCase()}</a>`)
      .join('').replace(/^/, '<span class="langues">') + '</span>'}
    <a class="cta-nav" href="${lang.prefixe}/">${esc(ui.navEditer)}</a>
  </nav>
</div></div>

<header class="tete"><div class="sec">
  <p class="fil"><a href="${lang.prefixe}/">${esc(ui.filAccueil)}</a> › ${esc(k.lien)}</p>
  <h1>${esc(k.h1)}</h1>
  <p class="chapo">${esc(k.chapo)}</p>
  <p class="fil" style="margin-top:18px">${esc(k.maj)} ${JOUR.split('-').reverse().join('/')}</p>
</div></header>

<main class="sec corps">
  ${k.sections.map(bloc).join('\n\n  ')}
</main>

${pied(lang, null)}
</body>
</html>
`;
}

/* ---------------- page de contact ----------------
   La seule page du site qui parle a un serveur. Le formulaire ne s'envoie pas
   tout seul a Netlify Forms : il passe par une fonction qui verifie d'abord le
   jeton Turnstile aupres de Cloudflare, car un widget pose dans une page ne
   prouve rien tant que personne n'a pose la question avec la cle secrete.
   Un formulaire statique cache accompagne le tout : c'est lui que Netlify
   detecte au deploiement pour creer la boite de reception et son schema. */
function pageContact(lang){
  const ui = lang.ui;
  const p = ui.accueil || ui;
  const k = ui.contact;
  const url = `${SITE}${lang.prefixe}/${k.slug}/`;
  const altsContact = LANGUES.map(l =>
      `<link rel="alternate" hreflang="${l.ui.htmlLang}" href="${SITE}${l.prefixe}/${l.ui.contact.slug}/">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${LANGUES[0].prefixe}/${LANGUES[0].ui.contact.slug}/">`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SITE + '/#editeur', name: 'VoilàPDF', url: SITE + '/',
        sameAs: ['https://github.com/dilmseo/editeur-pdf'] },
      { '@type': 'ContactPage', '@id': url + '#page', url, name: k.titreSeo,
        description: k.meta, inLanguage: ui.htmlLang,
        isPartOf: { '@id': SITE + '/#site' }, dateModified: JOUR,
        mainEntity: { '@id': SITE + '/#editeur' } }
    ]
  };

  const champsCaches = `<form name="contact" data-netlify="true" netlify-honeypot="site"
    enctype="multipart/form-data" hidden aria-hidden="true">
    <input type="text" name="nom"><input type="email" name="email">
    <input type="text" name="sujet"><textarea name="message"></textarea>
    <input type="file" name="fichier"><input type="text" name="site">
  </form>`;

  return `<!doctype html>
<html lang="${ui.htmlLang}">
<head>
<meta charset="utf-8">
<title>${esc(k.titreSeo)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(k.meta)}">
${GSC}
<link rel="canonical" href="${url}">
${altsContact}
<meta property="og:type" content="website">
<meta property="og:site_name" content="VoilàPDF">
<meta property="og:title" content="${esc(k.titreSeo)}">
<meta property="og:description" content="${esc(k.meta)}">
<meta property="og:url" content="${url}">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style-outil.css">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>

<div class="hnav"><div class="in">
  <a class="brand" href="${lang.prefixe}/"><i>${LOGO}</i>VoilàPDF</a>
  <nav>
    <a href="${lang.prefixe}/#outils">${esc(ui.navOutils)}</a>
    <a href="${lang.prefixe}/#confiance">${esc(ui.navConfiance)}</a>
    <a href="${lang.prefixe}/#questions">${esc(ui.navQuestions)}</a>
    ${selecteurLangue(lang, null).replace(/href="[^"]*"/g, m =>
      m.includes('/en/') ? 'href="/en/' + LANGUES[1].ui.contact.slug + '/"' : 'href="/' + UI_FR.contact.slug + '/"')}
    <a class="cta-nav" href="${lang.prefixe}/">${esc(ui.navEditer)}</a>
  </nav>
</div></div>

<header class="tete"><div class="sec">
  <p class="fil"><a href="${lang.prefixe}/">${esc(ui.filAccueil)}</a> › ${esc(k.lien)}</p>
  <h1>${esc(k.h1)}</h1>
  <p class="chapo">${esc(k.chapo)}</p>

  ${champsCaches}

  <form class="ecrire" id="ecrire" novalidate>
    <div class="reglage">
      <label for="c-nom">${esc(k.nom)}</label>
      <input id="c-nom" name="nom" type="text" autocomplete="name" required
             placeholder="${esc(k.nomEx)}" maxlength="120">
    </div>
    <div class="reglage">
      <label for="c-email">${esc(k.email)}</label>
      <input id="c-email" name="email" type="email" autocomplete="email" required
             placeholder="${esc(k.emailEx)}" maxlength="200">
    </div>
    <div class="reglage">
      <label for="c-sujet">${esc(k.sujet)}</label>
      <select id="c-sujet" name="sujet">
        ${k.sujets.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('\n        ')}
      </select>
    </div>
    <div class="reglage">
      <label for="c-message">${esc(k.message)}</label>
      <textarea id="c-message" name="message" rows="7" required
                placeholder="${esc(k.messageEx)}" maxlength="8000"></textarea>
    </div>
    <div class="reglage">
      <label for="c-fichier">${esc(k.fichier)}</label>
      <input id="c-fichier" name="fichier" type="file"
             accept="application/pdf,image/png,image/jpeg,image/webp,text/plain">
      <p class="aide">${esc(k.fichierAide)}</p>
    </div>

    <input type="text" name="site" id="c-site" tabindex="-1" autocomplete="off"
           aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">

    <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITEKEY}"
         data-language="${ui.htmlLang}" data-theme="light"></div>

    <button class="go" id="c-envoyer" type="submit">${esc(k.envoyer)}</button>
    <div class="err" id="c-err" hidden></div>
  </form>

  <div class="fini" id="c-fini" hidden>
    <div class="ok"><svg viewBox="0 0 24 24"><path d="m4 12.5 5.5 5.5L20 7"/></svg></div>
    <b>${esc(k.merciTitre)}</b>
    <div class="nom">${esc(k.merci)}</div>
    <button class="encore" id="c-encore" type="button">${esc(k.encore)}</button>
  </div>
</div></header>

<main class="sec corps">
  <h2>${esc(k.avertTitre)}</h2>
  <div class="confiance"><p style="margin:0">${esc(k.avert)}</p></div>
</main>

${pied(lang, null, true)}

<script>
(function(){
  var $ = function(i){ return document.getElementById(i); };
  var MSG = ${JSON.stringify(k.erreurs)};
  var MAX = 3 * 1024 * 1024;
  var form = $('ecrire'), err = $('c-err'), bouton = $('c-envoyer');

  function faute(cle){
    err.textContent = MSG[cle] || MSG.reseau;
    err.hidden = false;
    err.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  var lireFichier = function(f){
    return new Promise(function(ok, non){
      var r = new FileReader();
      r.onload = function(){ ok(String(r.result).split(',')[1]); };
      r.onerror = non;
      r.readAsDataURL(f);
    });
  };

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    err.hidden = true;

    var nom = $('c-nom').value.trim(), email = $('c-email').value.trim();
    var message = $('c-message').value.trim();
    if (!nom || !message) return faute('champs');
    if (!/^[^@\\s]+@[^@\\s.]+\\.[^@\\s]+$/.test(email)) return faute('email');

    // Le jeton est depose par Turnstile dans un champ cache qu'il cree lui-meme.
    var champ = form.querySelector('[name="cf-turnstile-response"]');
    var jeton = champ ? champ.value : '';
    if (!jeton) return faute('jeton');

    var charge = { nom: nom, email: email, sujet: $('c-sujet').value,
                   message: message, jeton: jeton, site: $('c-site').value };

    var f = $('c-fichier').files[0];
    if (f){
      if (f.size > MAX) return faute('taille');
      try {
        charge.fichier = { nom: f.name, type: f.type, donnees: await lireFichier(f) };
      } catch { return faute('reseau'); }
    }

    bouton.disabled = true;
    bouton.textContent = ${JSON.stringify(k.envoi)};
    try {
      var r = await fetch('/.netlify/functions/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charge)
      });
      var d = await r.json().catch(function(){ return {}; });
      if (!r.ok || !d.ok){ faute(d.erreur || 'reseau'); if (window.turnstile) turnstile.reset(); }
      else { form.hidden = true; $('c-fini').hidden = false; }
    } catch { faute('reseau'); }
    bouton.disabled = false;
    bouton.textContent = ${JSON.stringify(k.envoyer)};
  });

  $('c-encore').onclick = function(){
    form.reset(); form.hidden = false; $('c-fini').hidden = true;
    if (window.turnstile) turnstile.reset();
  };
})();
</script>
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
      { '@type': 'Organization', '@id': SITE + '/#editeur', name: 'VoilàPDF', url: SITE + '/',
        logo: { '@type': 'ImageObject', url: SITE + '/apercu-editeur.png' },
        sameAs: ['https://github.com/dilmseo/editeur-pdf'] },
      { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'VoilàPDF',
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

  const svgI = ico => `<svg viewBox="0 0 24 24">${ico}</svg>`;
  const ligneOutil = k => {
    const x = lang.outils[k];
    return `<a class="outil" href="${lang.prefixe}/${x.slug}/">`
      + `<span class="ic ${x.couleur}">${svgI(x.ico)}</span>`
      + `<span><b>${esc(x.carte)}</b><span>${esc(x.resume)}</span></span>`
      + `<span class="fleche" aria-hidden="true">›</span></a>`;
  };
  const listePied = cles => cles.map(k =>
    `<li><a href="${lang.prefixe}/${lang.outils[k].slug}/">${esc(lang.outils[k].carte)}</a></li>`).join('');

  return { jsonld, bloc: `<div id="home">

  <div class="hnav" id="hnav"><div class="in">
    <a class="marque" href="${lang.prefixe}/">${GLYPHE}VoilàPDF</a>
    <nav>
      <a href="#outils">${esc(ui.navOutils)}</a>
      <a href="#confiance">${esc(ui.navConfiance)}</a>
      <a href="#questions">${esc(ui.navQuestions)}</a>
      ${selecteurLangue(lang, null)}
      <a class="cta-nav" href="#" id="nav-ouvrir">${esc(ui.navEditer)}</a>
    </nav>
  </div></div>

  <section class="hero"><div class="in">
    <div>
      <span class="badge"><b></b>${esc(a.badge)}</span>
      <h1>${esc(a.h1a)}<br>
        <span class="souligne">${esc(a.h1b)}<svg viewBox="0 0 200 12" preserveAspectRatio="none"
          aria-hidden="true"><path d="M3 8c38-5 72-6 104-4 24 1 54 4 90 1"/></svg></span>
        ${esc(a.h1c)}</h1>
      <p class="accroche">${esc(a.accroche)} <strong>${esc(a.accrocheFort)}</strong>${esc(a.accrocheFin)}</p>

      <p class="demo">
        <span class="ligne">${esc(a.demoAvant)} <s>${esc(a.demoAvantDate)}</s></span>
        <span class="fleche-demo" aria-hidden="true">
          <svg viewBox="0 0 40 12"><path d="M1 6h34m0 0-5-4m5 4-5 4"/></svg></span>
        <span class="ligne neuve">${esc(a.demoApres)} <b>${esc(a.demoApresDate)}</b></span>
      </p>

      <label class="depot" id="dropcard" for="file">
        <span class="ic"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0 4 4m-4-4L8 8"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></span>
        <span>
          <span class="t">${esc(a.deposer)}</span>
          <span class="s">${esc(a.deposerSous)}</span>
        </span>
        <span class="bouton">${esc(a.bouton)}</span>
      </label>

      <div class="gages">
        <span><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>${esc(a.gage1)}</span>
        <span><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>${esc(a.gage2)}</span>
        <span><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>${esc(a.gage3)}</span>
      </div>
    </div>

    <div>
      <div class="fenetre">
        <div class="barre">
          <span class="pt"></span><span class="pt"></span><span class="pt"></span>
          <span class="url">voilapdf.com</span>
        </div>
        <img src="/apercu-editeur.png" width="1360" height="850" alt="${esc(a.legende)}" loading="eager" decoding="async">
      </div>
      <p class="legende">${esc(a.legende)}</p>
    </div>
  </div></section>

  <div class="preuve"><div class="in">
    <span><b>${esc(a.preuve1)}</b></span>
    <span>${esc(a.preuve2)}</span>
    <span>${esc(a.preuve3a)} <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(a.preuve3b)}</a>.</span>
  </div></div>

  <section class="bloc-sec" id="fonctions"><div class="sec">
    <div class="entete">
      <p class="surtitre">${esc(a.surtitreEditeur)}</p>
      <h2 class="titre">${esc(a.titreEditeur)}</h2>
      <p class="intro">${esc(a.introEditeur)}</p>
    </div>
    <div class="fonctions">
      <div class="fonction"><span class="ic i-rouge">${svgI(base.ICO.crayon)}</span>
        <div><h3>${esc(a.f1t)}</h3><p>${esc(a.f1d)}</p></div></div>
      <div class="fonction"><span class="ic i-violet">${svgI(base.ICO.loupe)}</span>
        <div><h3>${esc(a.f2t)}</h3><p>${esc(a.f2d)}</p></div></div>
      <div class="fonction"><span class="ic i-vert"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
        <div><h3>${esc(a.f3t)}</h3><p>${esc(a.f3d)}</p></div></div>
      <div class="fonction"><span class="ic i-ambre"><svg viewBox="0 0 24 24"><path d="M3 5h18v14H3z"/><path d="M7 9h10v6H7z"/></svg></span>
        <div><h3>${esc(a.f4t)}</h3><p>${esc(a.f4d)}</p></div></div>
    </div>

  </div></section>

  <section class="bloc-sec alt" id="outils"><div class="sec">
    <div class="entete">
      <p class="surtitre">${esc(a.surtitreOutils)}</p>
      <h2 class="titre">${esc(a.titreOutils)}</h2>
      <p class="intro">${esc(a.introOutils)}</p>
    </div>
    <div class="phares">
      <a class="phare" href="#" id="phare-editeur"><span class="ic i-rouge">${svgI(base.ICO.crayon)}</span>
        <span><b>${esc(a.phare1t)}</b><span>${esc(a.phare1d)}</span></span></a>
      <a class="phare" href="${lang.prefixe}/${lang.outils.fusion.slug}/"><span class="ic i-bleu">${svgI(base.ICO.fusion)}</span>
        <span><b>${esc(a.phare2t)}</b><span>${esc(a.phare2d)}</span></span></a>
    </div>
    <div class="outils-grille">
      ${base.GROUPES.map((gr, i) =>
        `<div class="colonne${gr.cles.length > 6 ? ' large' : ''}">`
        + `<h3>${esc(lang.groupes[i])}<em>${gr.cles.length} ${esc(a.outilsCompte)}</em></h3>`
        + `<div class="rangee">${gr.cles.map(ligneOutil).join('')}</div></div>`).join('\n      ')}
    </div>
  </div></section>

  <section class="bloc-sec sombre" id="confiance"><div class="sec">
    <div class="entete">
      <p class="surtitre">${esc(a.surtitreConfiance)}</p>
      <h2 class="titre">${esc(a.titreConfiance)}</h2>
      <p class="intro">${a.introConfiance}</p>
    </div>
    <div class="face">
      <div class="eux"><h3>${esc(a.euxTitre)}</h3>
        <ul>${a.eux.map(t => `<li>${CROIX}<span>${t}</span></li>`).join('')}</ul></div>
      <div class="nous"><h3>${esc(a.nousTitre)}</h3>
        <ul>${a.nous.map(t => `<li>${COCHE}<span>${t}</span></li>`).join('')}</ul></div>
    </div>
  </div></section>

  <section class="bloc-sec" id="questions"><div class="sec">
    <div class="entete">
      <p class="surtitre">${esc(a.surtitreQuestions)}</p>
      <h2 class="titre">${esc(a.titreQuestions)}</h2>
    </div>
    <div class="faq">
      ${a.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.r)}</p>
      </details>`).join('\n      ')}
    </div>
  </div></section>

  <section class="final"><div class="sec">
    <h2 class="titre">${esc(a.finalTitre)}</h2>
    <p class="intro" style="margin:12px auto 0">${esc(a.finalIntro)}</p>
    <a class="bouton" href="#" id="cta-final">${esc(a.finalBouton)}</a>
    <p class="sous">${esc(a.finalSous)}</p>
  </div></section>

  <footer class="pied">
    <div class="rappel">
      <p class="mot">${esc(a.rappelA)}<br><span>${esc(a.rappelB)}</span></p>
      <a class="bouton" href="#" id="pied-ouvrir">${esc(a.rappelBouton)}</a>
    </div>
    <div class="cols">
      <div>
        <span class="marque">${GLYPHE}VoilàPDF</span>
        <p class="pitch">${esc(a.piedPitch)}</p>
        <div class="sceau">
          <svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>
          <span><b>${esc(a.sceauTitre)}</b>${esc(a.sceauTexte)}</span>
        </div>
        <a class="etoiles" href="https://g.page/r/CfBfIXTvKKmwEAE/review" target="_blank" rel="noopener">
          ${ETOILE.repeat(5)}<em>${esc(ui.avisLien)}</em></a>
      </div>
      ${base.GROUPES.map((gr, i) =>
        `<div${gr.cles.length > 6 ? ' class="double"' : ''}><h4>${esc(lang.groupes[i])}</h4><ul>`
        + listePied(gr.cles)
        + (i === 1 ? `<li><a href="${lang.prefixe}/${lang.outils.fusion.slug}/">${esc(ui.plan.fusion)}</a></li>` : '')
        + '</ul></div>').join('\n      ')}
      <div><h4>${esc(a.piedProjet)}</h4><ul>
        <li><a href="#fonctions">${esc(a.piedEditeur)}</a></li>
        <li><a href="#confiance">${esc(a.piedConfidentialite)}</a></li>
        <li><a href="#questions">${esc(a.piedQuestions)}</a></li>
        <li><a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a></li>
      </ul></div>
    </div>
    <div class="bas">
      <span>${esc(ui.piedPhrase)}</span>
      <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">${esc(ui.codeSource)}</a>
      <span class="fin">
        <svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6z"/></svg>
        ${esc(a.piedFin)}
      </span>
    </div>
  </footer>

  <a class="badge-fr" href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">
    <span class="drapeau" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>${esc(a.badgeA)}<b>&#9829;</b>${esc(a.badgeB)}</span>
  </a>
</div>
`};
}

/* L'accueil d'une langue traduite, c'est l'application française elle-même :
   on y remplace le bloc d'accueil par sa version traduite, puis on traduit les
   mots de l'éditeur. L'application n'est donc jamais dupliquée — une correction
   faite dans index.html se retrouve dans toutes les langues au prochain build. */
function pageAppli(lang){
  const a = lang.ui.accueil;
  const { jsonld, bloc } = accueilTraduit(lang);
  let html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');

  const i = html.indexOf('<div id="home">');
  const j = html.indexOf('<header>', i);
  if (i < 0 || j < 0) throw new Error("index.html : bloc d'accueil introuvable");
  html = html.slice(0, i) + bloc + '\n\n' + html.slice(j);

  // tête : titre, description, canonique et alternatives propres à la langue
  const tete = html.slice(0, html.indexOf('</head>'));
  let nouvelleTete = tete
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(a.titreSeo)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(a.meta)}">
${GSC}`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${accueilDe(lang)}">`)
    .replace(/<link rel="alternate"[^>]*>\s*/g, '')
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(a.titreSeo)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(a.meta)}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${accueilDe(lang)}">`)
    .replace(/<meta property="og:locale"[^>]*>/, `<meta property="og:locale" content="en_GB">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
             `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`)
    .replace(/<script type="application\/ld\+json" id="ld-outils"><\/script>/, '')
    .replace('<link rel="canonical"', hreflangs(null) + '\n<link rel="canonical"');
  html = nouvelleTete + html.slice(html.indexOf('</head>'));

  html = html.replace('<html lang="fr">', `<html lang="${lang.ui.htmlLang}">`);

  // Les chemins relatifs doivent devenir absolus : la page vit dans /en/.
  // Les attributs d'abord, puis ceux écrits en dur dans le script — worker pdf.js
  // et moteur de reconnaissance — que la première passe ne voit pas.
  html = html.replace(/(src|href)="(?!https?:|\/|#|data:)/g, '$1="/')
             .split("'vendor/").join("'/vendor/");

  for (const [fr, en] of (lang.trad.REMPLACEMENTS || [])) html = html.split(fr).join(en);
  return html;
}

/* ---------------- écriture ---------------- */

let n = 0;
const urls = [];
for (const lang of LANGUES){
  urls.push({ loc: accueilDe(lang), cle: null, prio: lang.code === 'fr' ? '1.0' : '0.9' });
  if (lang.code !== 'fr'){
    const d = path.join(RACINE, lang.prefixe.replace(/^\//, ''));
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), pageAppli(lang), 'utf8');
  }
  for (const cle of Object.keys(lang.outils)){
    const dossier = path.join(RACINE, lang.prefixe.replace(/^\//, ''), lang.outils[cle].slug);
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, 'index.html'), page(lang, cle), 'utf8');
    urls.push({ loc: urlDe(lang, cle), cle, prio: '0.8' });
    n++;
  }
  const dc = path.join(RACINE, lang.prefixe.replace(/^\//, ''), lang.ui.contact.slug);
  fs.mkdirSync(dc, { recursive: true });
  fs.writeFileSync(path.join(dc, 'index.html'), pageContact(lang), 'utf8');
  urls.push({ loc: `${SITE}${lang.prefixe}/${lang.ui.contact.slug}/`, cle: null, prio: '0.5' });

  for (const cle of Object.keys(lang.ui.pages)){
    const d = path.join(RACINE, lang.prefixe.replace(/^\//, ''), lang.ui.pages[cle].slug);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), pageTexte(lang, cle), 'utf8');
    urls.push({ loc: `${SITE}${lang.prefixe}/${lang.ui.pages[cle].slug}/`, cle: null, prio: '0.3' });
  }
}

/* Sitemap réduit à l'os : <loc> et <lastmod>, rien d'autre.

   Il portait les alternatives de langue en <xhtml:link>. Deux raisons de les
   avoir retirées. D'abord un vrai piège : le schéma impose la séquence loc,
   lastmod, changefreq, priority PUIS la zone d'extension « ##other » ; placer
   les xhtml:link après <loc>, comme le montrent les exemples de Google — qui
   n'ont pas de lastmod — rendait le <lastmod> suivant invalide, et Search
   Console répondait « Impossible de lire le sitemap », 0 page découverte.
   Ensuite, même corrigées, ces balises n'apportaient rien : chaque page déclare
   déjà ses alternatives et son x-default dans son <head>, ce qui est l'une des
   trois méthodes officielles et se suffit à elle-même. Google demande d'en
   choisir UNE. Autant garder celle qui ne peut pas casser le fichier.

   priority et changefreq sont partis pour la même raison : Google les ignore
   depuis des années, ils ne faisaient qu'ajouter de la surface d'erreur. */
const SITEMAP =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${JOUR}</lastmod>\n  </url>`).join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(path.join(RACINE, 'sitemap.xml'), SITEMAP, 'utf8');
/* Preuve de propriete pour IndexNow : un fichier a la racine dont le nom est la
   cle et le contenu la meme cle. Sans lui, les moteurs ignorent les soumissions. */
fs.writeFileSync(path.join(RACINE, INDEXNOW + '.txt'), INDEXNOW, 'utf8');
/* Même contenu sous une seconde adresse. Search Console garde l'état d'un
   sitemap attaché à son URL : une entrée passée en échec y reste affichée même
   après correction du fichier, tant que Google n'a pas relu. Soumettre une
   adresse neuve repart d'une ardoise vierge et tranche la question — si
   sitemap2 est lu et pas l'autre, le fichier n'était plus en cause. */
fs.writeFileSync(path.join(RACINE, 'sitemap2.xml'), SITEMAP, 'utf8');

/* Les robots des moteurs génératifs sont nommés un par un. « User-agent: * » les
   autorise déjà, mais plusieurs n'obéissent qu'à une règle qui les désigne, et
   une mention explicite vaut déclaration d'intention si la règle générale change. */
const IA_ROBOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User',
                   'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended',
                   'Applebot-Extended', 'Bingbot', 'CCBot', 'meta-externalagent',
                   'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai'];

fs.writeFileSync(path.join(RACINE, 'robots.txt'),
  'User-agent: *\nAllow: /\n\n'
  /* Commentaires en ASCII pur : robots.txt est lu par des analyseurs orientes
     octet, inutile d'y risquer un accent. */
  + '# Answer engines welcome. Nothing here is reserved.\n'
  + IA_ROBOTS.map(r => `User-agent: ${r}\nAllow: /`).join('\n\n') + '\n\n'
  + `Sitemap: ${SITE}/sitemap.xml\n\n`
  + `# Structured summary of this site:\n`
  + `# ${SITE}/llms.txt       - inventory\n`
  + `# ${SITE}/llms-full.txt  - facts and limits, tool by tool\n`, 'utf8');

/* ---------------- llms.txt ----------------
   Les moteurs de réponse ne citent bien que ce qu'ils ont compris. Une page HTML
   leur impose de deviner la structure ; ce fichier la leur donne en clair, et il
   est engendré depuis le même catalogue que les pages, donc il ne peut pas
   diverger d'elles. Deux niveaux : llms.txt pour l'inventaire, llms-full.txt
   pour les faits qu'un modèle peut citer — y compris les limites, qui sont ce
   qui distingue une réponse exacte d'une réponse flatteuse. */
const PRESENTATION = {
  fr: {
    accroche: "Boîte à outils PDF qui s'exécute entièrement dans le navigateur : aucun fichier n'est téléversé.",
    quoi: [
      "VoilàPDF modifie, convertit et assemble des PDF sans serveur. Le traitement a lieu dans l'onglet, en JavaScript et WebAssembly : le document reste sur la machine de l'utilisateur et n'est transmis à personne.",
      "Tout est gratuit et sans compte, y compris la correction du texte déjà présent dans un PDF et la reconnaissance des documents scannés — deux fonctions que la plupart des services concurrents réservent à un abonnement payant.",
      "Le code est public sous licence GNU AGPL v3 : https://github.com/dilmseo/editeur-pdf"
    ],
    titreOutils: 'Les outils', titreFaits: 'Faits vérifiables', titreLimites: 'Limites assumées',
    conserve: 'Conservé', perd: 'Non repris', questions: 'Questions',
    faits: [
      "Aucun code serveur : le site est un ensemble de fichiers statiques, il ne peut pas recevoir un document.",
      "Le seul échange réseau facultatif concerne les outils de langue : le modèle de traduction opus-mt (103 Mo) ou le résumeur distilbart-cnn (271 Mo) est téléchargé depuis Hugging Face au premier clic, puis conservé par le cache du navigateur. Le modèle descend ; le document ne monte jamais.",
      "Le résumé par défaut est extractif : il sélectionne les phrases du document au lieu d'en rédiger de nouvelles, donc il n'invente rien et fonctionne dans toutes les langues.",
      "La reconnaissance de caractères (Tesseract, français) se déclenche automatiquement quand un PDF ne contient pas de texte sélectionnable.",
      "L'édition de texte recouvre l'ancienne ligne d'un rectangle à la couleur du fond, puis réécrit sur la même ligne de base relevée par pdf.js."
    ],
    limites: [
      "Le texte d'origine reste dans le fichier après une modification : c'est un recouvrement visuel, pas un caviardage. Un copier-coller ou pdftotext retrouve l'ancien texte.",
      "Les polices d'origine ne sont pas réemployées : le texte est réécrit dans l'une des 14 polices standard du PDF.",
      "La compression et le déverrouillage rematricent les pages : le texte devient une image.",
      "La traduction ne conserve pas la mise en page, et sa qualité reste en deçà d'un service hébergé sur cartes graphiques.",
      "La conversion vers Office reconstruit le contenu, pas la maquette : ni colonnes, ni encadrés, ni images."
    ]
  },
  en: {
    accroche: 'Browser-only PDF toolkit: no file is ever uploaded.',
    quoi: [
      'VoilàPDF edits, converts and assembles PDFs with no server. Processing happens in the tab, in JavaScript and WebAssembly: the document stays on the user’s machine and is sent to nobody.',
      'Everything is free and account-free, including correcting the text already inside a PDF and recognising scanned documents — two features most competing services keep behind a subscription.',
      'The code is public under the GNU AGPL v3 licence: https://github.com/dilmseo/editeur-pdf'
    ],
    titreOutils: 'Tools', titreFaits: 'Verifiable facts', titreLimites: 'Acknowledged limits',
    conserve: 'Kept', perd: 'Not carried over', questions: 'Questions',
    faits: [
      'No server code: the site is a set of static files, it cannot receive a document.',
      'The only optional network exchange concerns the language tools: the opus-mt translation model (103 MB) or the distilbart-cnn summariser (271 MB) is downloaded from Hugging Face on first click, then kept in the browser cache. The model comes down; the document never goes up.',
      'The default summary is extractive: it selects sentences from the document instead of writing new ones, so it invents nothing and works in any language.',
      'Character recognition (Tesseract, French) starts automatically when a PDF holds no selectable text.',
      'Text editing covers the old line with a rectangle in the sampled background colour, then rewrites on the same baseline reported by pdf.js.'
    ],
    limites: [
      'The original text stays inside the file after an edit: it is a visual cover, not redaction. Copy-paste or pdftotext recovers the old text.',
      'Original fonts are not reused: text is rewritten in one of the 14 standard PDF fonts.',
      'Compression and unlocking rasterise the pages: text becomes an image.',
      'Translation does not preserve layout, and its quality stays below a service hosted on graphics cards.',
      'Office conversion rebuilds the content, not the design: no columns, no boxes, no images.'
    ]
  }
};

const listeMd = t => t.map(x => `- ${x}`).join('\n');

let court = '', complet = '';
for (const lang of LANGUES){
  const pr = PRESENTATION[lang.code];
  if (!pr) continue;
  const tete = `# VoilàPDF${lang.code === 'fr' ? '' : ' (English)'}\n\n> ${pr.accroche}\n\n`
             + pr.quoi.join('\n\n') + '\n\n';

  court += tete + `## ${pr.titreOutils}\n\n`
    + `- [${lang.ui.plan.editeur}](${accueilDe(lang)}): ${lang.code === 'fr'
        ? "corriger le texte déjà écrit dans un PDF, y compris sur un document scanné"
        : 'correct text already written in a PDF, including on a scanned document'}\n`
    + Object.keys(lang.outils).map(k =>
        `- [${lang.outils[k].titre}](${urlDe(lang, k)}): ${lang.outils[k].resume}`).join('\n')
    + `\n\n## ${pr.titreFaits}\n\n${listeMd(pr.faits)}\n\n`
    + `## ${pr.titreLimites}\n\n${listeMd(pr.limites)}\n\n`;

  complet += tete
    + `## ${pr.titreFaits}\n\n${listeMd(pr.faits)}\n\n`
    + `## ${pr.titreLimites}\n\n${listeMd(pr.limites)}\n\n`
    + `## ${pr.titreOutils}\n\n`
    + Object.keys(lang.outils).map(k => {
        const o = lang.outils[k];
        return `### ${o.titre}\n\n${urlDe(lang, k)}\n\n${o.chapo}\n\n${o.format}\n\n`
          + `**${pr.conserve}** : ${o.garde.join(' · ')}\n\n`
          + `**${pr.perd}** : ${o.perdu.join(' · ')}\n\n`
          + `**${pr.questions}**\n\n`
          + o.faq.map(f => `- *${f.q}* ${f.r}`).join('\n');
      }).join('\n\n') + '\n\n';
}

fs.writeFileSync(path.join(RACINE, 'llms.txt'), court.trimEnd() + '\n', 'utf8');
fs.writeFileSync(path.join(RACINE, 'llms-full.txt'), complet.trimEnd() + '\n', 'utf8');

console.log(`${n} page(s) d'outil sur ${LANGUES.length} langue(s), sitemap de ${urls.length} adresses.`);
console.log(`llms.txt : ${Math.round(court.length / 1024)} Ko · llms-full.txt : ${Math.round(complet.length / 1024)} Ko`);
module.exports = { LANGUES, urlDe, accueilDe, hreflangs, selecteurLangue, UI_FR, esc, LOGO, FAVICON, JOUR };
