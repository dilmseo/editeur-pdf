/* Catalogue des outils : une seule source, lue par l'accueil (navigateur) et par
   le générateur de pages (Node). Chaque entrée porte à la fois ce qu'il faut pour
   faire tourner l'outil et ce qu'il faut pour que sa page existe aux yeux d'un
   moteur de recherche : titre, description, contenu propre. */
(function (global) {

const DOC = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLS = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const ICO = {
  mot:    '<path d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M8 13l1.5 4 1.5-4 1.5 4L14 13"/>',
  image:  '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m5 17 4.5-4.5L13 16l2.5-2.5L19 17"/>',
  diapo:  '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
  table:  '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  crayon: '<path d="M4 20h16M5 15.5 15.5 5a2.1 2.1 0 0 1 3 3L8 18.5l-4 1z"/>',
  fusion: '<path d="M4 7h7a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h3M4 17h7a3 3 0 0 0 3-3v-4a3 3 0 0 1 3-3h3"/>'
};

const ETAPES_UN = n => [
  `Déposez votre ${n} sur la page, ou cliquez pour le choisir dans vos dossiers.`,
  'Lancez la conversion : elle se fait dans votre navigateur, rien n\'est envoyé.',
  'Téléchargez le fichier produit. Aucun compte, aucun filigrane, aucune attente.'
];

const OUTILS = {

/* ----------------------------- depuis un PDF ----------------------------- */

'pdf-word': {
  slug: 'pdf-en-word', carte: 'PDF → Word', ico: ICO.mot, couleur: 'i-bleu',
  resume: 'Un .docx dont le texte reste modifiable',
  titre: 'PDF en Word',
  h1: 'Convertir un PDF en Word',
  titreSeo: 'PDF en Word gratuit, sans téléverser votre fichier',
  meta: "Transformez un PDF en document Word .docx dans votre navigateur. Gratuit, sans inscription, sans limite de taille, et votre fichier ne part sur aucun serveur.",
  chapo: "Récupérez le texte d'un PDF dans un document Word que vous pourrez reprendre, corriger et réimprimer. La conversion se fait entièrement sur votre machine : votre document n'est jamais envoyé sur un serveur.",
  accept: 'application/pdf', fonction: 'pdfVersDocx',
  note: "Le texte, ses tailles et les titres sont conservés, chaque page du PDF devenant une page du document. La mise en page est simplifiée : ni colonnes, ni encadrés, ni images.",
  garde: ['Le texte intégral, page par page', 'La taille de chaque ligne, en points',
          'Les titres, détectés à leur corps plus grand', 'La distinction entre police à empattements et sans empattement'],
  perdu: ['Les colonnes et les encadrés, remis en pleine largeur', 'Les images et les logos',
          'Les tableaux, rendus ligne par ligne', 'Les en-têtes et pieds de page, traités comme du texte ordinaire'],
  faq: [
    { q: 'Le texte sera-t-il vraiment modifiable dans Word ?',
      r: "Oui. Le document produit contient du texte réel, pas une image : vous pouvez le corriger, le remettre en forme et le réenregistrer comme n'importe quel .docx." },
    { q: 'Et si mon PDF est un document scanné ?',
      r: "Un scan ne contient aucun texte, seulement une image : la conversion ressortira vide. Passez d'abord par l'éditeur, dont la reconnaissance de caractères rend le texte exploitable, puis enregistrez le PDF obtenu avant de le convertir." },
    { q: 'Pourquoi la mise en page n\'est-elle pas identique ?',
      r: "Un PDF décrit des caractères posés à des coordonnées, pas des paragraphes. Reconstituer une maquette exacte demande des modèles lourds qui tournent sur des serveurs. Ici, le choix est de restituer fidèlement le contenu plutôt que d'imiter approximativement la forme." }
  ]
},

'pdf-excel': {
  slug: 'pdf-en-excel', carte: 'PDF → Excel', ico: ICO.table, couleur: 'i-vert',
  resume: 'Les tableaux en feuille de calcul',
  titre: 'PDF en Excel',
  h1: 'Convertir un PDF en Excel',
  titreSeo: 'Convertir un PDF en Excel gratuitement, sans envoi de fichier',
  meta: "Extrayez les tableaux d'un PDF vers un classeur Excel .xlsx, directement dans votre navigateur. Gratuit, sans compte, sans limite de taille, sans téléversement.",
  chapo: "Récupérez un tableau enfermé dans un PDF sous forme de feuille de calcul, prête à être triée et recalculée. Les colonnes sont retrouvées à partir de l'alignement du texte sur la page.",
  accept: 'application/pdf', fonction: 'pdfVersXlsx',
  note: "Les colonnes sont déduites de l'alignement du texte, une feuille par page. Excellent sur un vrai tableau, approximatif sur du texte libre.",
  garde: ['Chaque page devient une feuille du classeur', 'Les colonnes, déduites des positions de départ du texte',
          'Les lignes, regroupées par ligne de base commune', 'Les valeurs telles qu\'elles sont écrites, accents compris'],
  perdu: ['Les formules : un PDF ne contient que des résultats', 'Les fusions de cellules et les bordures',
          'Les couleurs et la mise en forme conditionnelle', 'Les colonnes mal alignées, qui peuvent se retrouver décalées'],
  faq: [
    { q: 'Mon tableau sort décalé, que faire ?',
      r: "Le découpage en colonnes repose sur l'alignement horizontal du texte. Si le PDF aligne mal ses colonnes, ou mélange tableau et paragraphes, le résultat se décale. Dans ce cas, convertissez plutôt la page concernée et recollez les colonnes à la main dans Excel." },
    { q: 'Les nombres sont-ils de vrais nombres ?',
      r: "Ils sont écrits tels qu'ils apparaissent dans le PDF, texte compris : séparateurs de milliers, symbole monétaire, pourcentages. Un collage spécial ou la fonction de conversion d'Excel les transforme ensuite en valeurs calculables." },
    { q: 'Combien de pages puis-je convertir ?',
      r: "Autant que votre ordinateur peut en traiter : il n'y a aucune limite imposée, puisque rien n'est envoyé sur un serveur. Chaque page devient une feuille distincte du classeur." }
  ]
},

'pdf-ppt': {
  slug: 'pdf-en-powerpoint', carte: 'PDF → PowerPoint', ico: ICO.diapo, couleur: 'i-violet',
  resume: 'Une diapositive par page',
  titre: 'PDF en PowerPoint',
  h1: 'Convertir un PDF en PowerPoint',
  titreSeo: 'PDF en PowerPoint gratuit, sans téléverser le document',
  meta: "Transformez un PDF en présentation .pptx dans votre navigateur : une diapositive par page, au format exact. Gratuit, sans compte, sans envoi.",
  chapo: "Reprenez un PDF comme support de présentation : chaque page devient une diapositive au format exact de la page, prête à être projetée ou annotée.",
  accept: 'application/pdf', fonction: 'pdfVersPptx',
  note: "Chaque page devient une diapositive au format exact de la page, remplie par son image. Le rendu est fidèle, mais le texte n'y est pas rééditable.",
  garde: ['Le rendu exact de chaque page, polices et images comprises',
          'Le format de la diapositive, calé sur celui de la page',
          'L\'ordre des pages', 'Les couleurs et la qualité d\'impression'],
  perdu: ['Le texte modifiable : chaque diapositive est une image',
          'Les zones de texte et les puces', 'Les animations et les transitions',
          'Les notes du présentateur'],
  faq: [
    { q: 'Pourquoi le texte n\'est-il pas modifiable ?',
      r: "Une page de PDF n'a pas de structure de diapositive : ni titre, ni zone de contenu. Transposer son image en plein cadre est la seule façon d'obtenir un rendu fidèle. Si vous voulez du texte modifiable, convertissez plutôt le PDF en Word." },
    { q: 'La présentation sera-t-elle nette au vidéoprojecteur ?',
      r: "Les pages sont rendues à près du double de la résolution d'écran, ce qui reste net en projection comme à l'impression. Le fichier produit est logiquement plus lourd que le PDF d'origine." },
    { q: 'Puis-je ajouter mes propres diapositives ensuite ?',
      r: "Oui. Le fichier est un .pptx ordinaire : PowerPoint, LibreOffice Impress ou Google Slides l'ouvrent et vous y insérez ce que vous voulez." }
  ]
},

'pdf-jpg': {
  slug: 'pdf-en-jpg', carte: 'PDF → JPG', ico: ICO.image, couleur: 'i-ambre',
  resume: 'Une image par page',
  titre: 'PDF en JPG',
  h1: 'Convertir un PDF en JPG',
  titreSeo: 'PDF en JPG gratuit : une image par page, sans envoi',
  meta: "Transformez chaque page d'un PDF en image JPG, directement dans votre navigateur. Gratuit, sans inscription, sans filigrane, sans envoi de fichier.",
  chapo: "Obtenez une image par page, prête à être insérée dans un courriel, un document ou une publication. Le rendu est celui du PDF, au double de la taille écran.",
  accept: 'application/pdf', fonction: 'pdfVersJpg',
  note: "Rendu fidèle, au double de la taille écran. À partir de deux pages, vous recevez une archive ZIP contenant toutes les images.",
  garde: ['Le rendu exact de la page, polices et images comprises',
          'Les couleurs et la finesse du trait', 'L\'ordre des pages, numérotées dans le nom du fichier',
          'Une résolution double de celle de l\'écran'],
  perdu: ['Le texte sélectionnable : une image ne se copie pas',
          'La transparence, que le JPG ne gère pas', 'Les liens cliquables et les signets',
          'Une partie de la finesse, le JPG étant compressé'],
  faq: [
    { q: 'JPG ou PNG, lequel choisir ?',
      r: "Le JPG donne des fichiers nettement plus légers et convient aux pages contenant des photos. Le PNG ne perd aucune information et reste plus net sur du texte et des aplats : préférez-le pour un document administratif." },
    { q: 'Comment récupérer plusieurs pages ?',
      r: "À partir de deux pages, les images sont réunies dans une archive ZIP que votre système décompresse d'un double-clic. Chaque image porte le numéro de sa page." },
    { q: 'La qualité est-elle suffisante pour imprimer ?',
      r: "Les pages sont rendues à environ 144 points par pouce, ce qui convient pour un usage écran et une impression courante. Pour une impression professionnelle, mieux vaut imprimer le PDF directement." }
  ]
},

'pdf-png': {
  slug: 'pdf-en-png', carte: 'PDF → PNG', ico: ICO.image, couleur: 'i-ambre',
  resume: 'Une image par page, sans perte',
  titre: 'PDF en PNG',
  h1: 'Convertir un PDF en PNG',
  titreSeo: 'Convertir un PDF en PNG gratuitement, sans perte et sans envoi',
  meta: "Transformez chaque page d'un PDF en image PNG sans perte, directement dans votre navigateur. Gratuit, sans compte, sans filigrane, sans téléversement.",
  chapo: "Obtenez une image par page, sans compression destructrice : le texte reste net et les aplats de couleur ne bavent pas. Idéal pour une capture d'acte ou de facture.",
  accept: 'application/pdf', fonction: 'pdfVersPng',
  note: "Rendu fidèle et sans compression destructrice. À partir de deux pages, vous recevez une archive ZIP.",
  garde: ['Le rendu exact de la page, sans aucune perte',
          'La netteté du texte et des traits fins', 'L\'ordre des pages, numérotées dans le nom du fichier',
          'Une résolution double de celle de l\'écran'],
  perdu: ['Le texte sélectionnable : une image ne se copie pas',
          'Les liens cliquables et les signets', 'La légèreté : un PNG pèse plus lourd qu\'un JPG',
          'Les champs de formulaire, aplatis dans l\'image'],
  faq: [
    { q: 'Pourquoi le PNG est-il plus lourd que le JPG ?',
      r: "Le PNG n'enlève aucune information de l'image, là où le JPG en supprime pour gagner de la place. C'est précisément ce qui rend le PNG plus net sur du texte, au prix d'un fichier plus volumineux." },
    { q: 'Puis-je convertir un document de cent pages ?',
      r: "Oui, aucune limite n'est imposée. Comptez simplement un peu de temps et de mémoire : les pages sont rendues une par une dans votre navigateur." },
    { q: 'Les images ont-elles un fond transparent ?',
      r: "Non : le fond blanc de la page est conservé, comme à l'impression. Cela évite les mauvaises surprises lorsqu'on insère l'image sur un fond coloré." }
  ]
},

/* ------------------------------ vers un PDF ------------------------------ */

'word-pdf': {
  slug: 'word-en-pdf', carte: 'Word → PDF', ico: ICO.mot, couleur: 'i-bleu',
  resume: 'Depuis un .docx',
  titre: 'Word en PDF',
  h1: 'Convertir un Word en PDF',
  titreSeo: 'Word en PDF gratuit, sans téléverser ni créer de compte',
  meta: "Transformez un .docx en PDF dans votre navigateur. Gratuit, sans inscription, sans filigrane, et votre document ne part sur aucun serveur.",
  chapo: "Obtenez un PDF à partir d'un document Word, sans ouvrir Word et sans confier votre texte à un service en ligne. Pratique pour un courrier, un devis ou un contrat à envoyer.",
  accept: DOC + ',.docx', fonction: 'docxVersPdf',
  note: "Texte, gras, italique, tailles, alignements, tableaux simples et images sont repris. Les styles avancés, en-têtes et colonnes ne le sont pas.",
  garde: ['Le texte, avec gras, italique et tailles', 'Les alignements à gauche, au centre et à droite',
          'Les tableaux simples, redessinés avec leurs bordures', 'Les images insérées dans le fil du texte'],
  perdu: ['Les en-têtes, pieds de page et numéros de page', 'Les colonnes, cadres et zones de texte',
          'Les polices exactes, remplacées par leurs équivalents standard', 'Les notes de bas de page et la table des matières'],
  faq: [
    { q: 'Les polices de mon document sont-elles respectées ?',
      r: "Le texte est réécrit dans les polices standard du format PDF : une sans empattement proche d'Helvetica, une à empattements proche de Times, et une à chasse fixe. L'allure générale est respectée, le dessin exact des caractères non." },
    { q: 'Le format .doc ancien fonctionne-t-il ?',
      r: "Non, seul le .docx est géré. L'ancien .doc est un format binaire fermé, impossible à lire correctement dans un navigateur. Réenregistrez-le au format .docx depuis Word ou LibreOffice." },
    { q: 'Mon document fait soixante pages, est-ce un problème ?',
      r: "Non. Le texte est mis en page au fil de l'eau et les pages s'ajoutent d'elles-mêmes. Aucune limite de taille n'est imposée, puisque le travail se fait sur votre machine." }
  ]
},

'excel-pdf': {
  slug: 'excel-en-pdf', carte: 'Excel → PDF', ico: ICO.table, couleur: 'i-vert',
  resume: 'Depuis un .xlsx',
  titre: 'Excel en PDF',
  h1: 'Convertir un Excel en PDF',
  titreSeo: 'Excel en PDF gratuit, sans envoyer ni partager le classeur',
  meta: "Transformez un classeur Excel .xlsx en PDF lisible, directement dans votre navigateur. Gratuit, sans compte, sans filigrane, sans téléversement de vos données.",
  chapo: "Obtenez un PDF propre à partir d'un classeur, feuille par feuille, sans ouvrir Excel. Utile pour transmettre un tableau sans risquer qu'il soit modifié.",
  accept: XLS + ',.xlsx', fonction: 'xlsxVersPdf',
  note: "Une grille lisible par feuille, en A4 paysage, jusqu'à douze colonnes par page. Formules évaluées telles qu'enregistrées, sans mise en forme conditionnelle.",
  garde: ['Chaque feuille, avec son nom en titre', 'Les valeurs, y compris les résultats des formules',
          'La première ligne mise en évidence comme en-tête', 'Une grille lisible, en A4 paysage'],
  perdu: ['Les formules elles-mêmes, seuls les résultats sont repris',
          'Les couleurs, styles et mises en forme conditionnelles', 'Les graphiques et les images',
          'Au-delà de douze colonnes, les suivantes ne sont pas dessinées'],
  faq: [
    { q: 'Pourquoi seulement douze colonnes ?',
      r: "Au-delà, les cellules deviennent trop étroites pour rester lisibles sur une page A4. Si votre tableau est plus large, masquez les colonnes inutiles dans Excel avant de convertir, ou découpez-le en deux feuilles." },
    { q: 'Les résultats de mes formules apparaissent-ils ?',
      r: "Oui, tels qu'Excel les a enregistrés lors du dernier calcul. Les formules ne sont pas recalculées ici : pensez à enregistrer votre classeur après modification." },
    { q: 'Et le format .xls ancien ?',
      r: "Seul le .xlsx est géré. L'ancien .xls est un format binaire qu'un navigateur ne peut pas lire de façon fiable : réenregistrez votre classeur au format .xlsx." }
  ]
},

'ppt-pdf': {
  slug: 'powerpoint-en-pdf', carte: 'PowerPoint → PDF', ico: ICO.diapo, couleur: 'i-violet',
  resume: 'Depuis un .pptx',
  titre: 'PowerPoint en PDF',
  h1: 'Convertir un PowerPoint en PDF',
  titreSeo: 'PowerPoint en PDF gratuit, sans téléverser la présentation',
  meta: "Transformez une présentation PowerPoint .pptx en PDF directement dans votre navigateur. Gratuit, sans compte, sans filigrane, sans envoi de fichier.",
  chapo: "Obtenez un PDF à partir d'une présentation, pour la diffuser ou l'imprimer sans que la mise en forme bouge d'un poste à l'autre.",
  accept: PPT + ',.pptx', fonction: 'pptxVersPdf',
  note: "Les textes sont replacés à leur position dans la diapositive, avec leur taille, et les images sont reprises. Animations, dégradés et formes décoratives ne le sont pas.",
  garde: ['Une page de PDF par diapositive, au format d\'origine',
          'Les textes à leur position, avec leur taille et leur graisse',
          'Les images insérées dans les diapositives', 'L\'ordre des diapositives'],
  perdu: ['Les animations et les transitions', 'Les formes, flèches et dégradés décoratifs',
          'Les arrière-plans hérités du masque', 'Les notes du présentateur'],
  faq: [
    { q: 'Mon arrière-plan a disparu, pourquoi ?',
      r: "Les décors venant du masque des diapositives ne sont pas repris : seul le contenu propre à chaque diapositive l'est. Si l'arrière-plan compte, exportez plutôt vos diapositives en images depuis PowerPoint, puis utilisez l'outil JPG en PDF." },
    { q: 'Les polices de ma présentation sont-elles conservées ?',
      r: "Le texte est réécrit dans les polices standard du PDF. La taille et la position sont respectées, le dessin exact des caractères non : un titre très typé rendra différemment." },
    { q: 'Et le format .ppt ancien ?',
      r: "Seul le .pptx est géré. Réenregistrez votre présentation au format .pptx depuis PowerPoint, LibreOffice Impress ou Google Slides." }
  ]
},

'jpg-pdf': {
  slug: 'jpg-en-pdf', carte: 'JPG → PDF', ico: ICO.image, couleur: 'i-ambre',
  resume: 'Une page par image',
  titre: 'JPG en PDF',
  h1: 'Convertir des JPG en PDF',
  titreSeo: 'Convertir des JPG en PDF gratuitement, sans envoi de photos',
  meta: "Réunissez vos images JPG dans un seul PDF, dans votre navigateur. Gratuit, sans compte, sans filigrane, et vos photos restent chez vous.",
  chapo: "Rassemblez des photos ou des pages photographiées dans un seul PDF, à transmettre d'un bloc. Chaque image devient une page à sa taille exacte.",
  accept: 'image/jpeg,.jpg,.jpeg', multiple: true, fonction: 'imagesVersPdf',
  note: "Chaque image devient une page à sa taille exacte, sans recompression. Vous pouvez en déposer plusieurs : elles se suivent dans l'ordre choisi.",
  garde: ['Chaque image à sa taille et sa définition d\'origine',
          'L\'ordre dans lequel vous ajoutez les fichiers', 'La qualité : aucune recompression n\'est appliquée',
          'Les couleurs exactes de vos photos'],
  perdu: ['Les métadonnées de prise de vue', 'L\'orientation automatique de certains appareils photo',
          'Rien d\'autre : l\'image est intégrée telle quelle'],
  faq: [
    { q: 'Puis-je choisir l\'ordre des pages ?',
      r: "Les images se suivent dans l'ordre où vous les ajoutez. Déposez-les une par une pour maîtriser cet ordre, ou retirez une image de la liste d'un clic si vous vous êtes trompé." },
    { q: 'Mes photos sont-elles recompressées ?',
      r: "Non. Les fichiers JPG sont intégrés tels quels dans le PDF : ni perte de qualité, ni gonflement du fichier." },
    { q: 'Puis-je mélanger des JPG et des PNG ?',
      r: "Oui : les deux formats sont acceptés par cet outil comme par celui dédié au PNG. Chaque image devient une page, quel que soit son format." }
  ]
},

'png-pdf': {
  slug: 'png-en-pdf', carte: 'PNG → PDF', ico: ICO.image, couleur: 'i-ambre',
  resume: 'Une page par image',
  titre: 'PNG en PDF',
  h1: 'Convertir des PNG en PDF',
  titreSeo: 'PNG en PDF gratuit, sans perte et sans téléversement',
  meta: "Réunissez vos images PNG dans un seul PDF, sans perte et dans votre navigateur. Gratuit, sans compte, sans filigrane, sans téléversement.",
  chapo: "Rassemblez des captures d'écran ou des visuels PNG dans un seul PDF, sans aucune perte de qualité. Chaque image devient une page à sa taille exacte.",
  accept: 'image/png,.png', multiple: true, fonction: 'imagesVersPdf',
  note: "Chaque image devient une page à sa taille exacte, sans aucune perte. Vous pouvez en déposer plusieurs d'un coup.",
  garde: ['Chaque image à sa taille et sa définition d\'origine',
          'La netteté totale : aucune compression destructrice', 'L\'ordre dans lequel vous ajoutez les fichiers',
          'Les aplats de couleur, sans bavure'],
  perdu: ['La transparence, remplacée par le fond de la page',
          'Rien d\'autre : l\'image est intégrée telle quelle'],
  faq: [
    { q: 'La transparence de mes PNG est-elle gardée ?',
      r: "Une page de PDF n'a pas de fond transparent : les zones translucides se retrouvent sur le blanc de la page. Si la transparence compte, aplatissez l'image sur le fond voulu avant de convertir." },
    { q: 'Combien d\'images puis-je réunir ?',
      r: "Autant que vous voulez : aucune limite n'est imposée. Le poids du PDF produit est simplement la somme de celui des images." },
    { q: 'Les captures d\'écran restent-elles nettes ?',
      r: "Oui, parfaitement : le PNG est intégré sans recompression, donc le texte d'une capture reste aussi lisible que dans l'image d'origine." }
  ]
},

/* -------------------------------- fusion -------------------------------- */

'fusion': {
  slug: 'fusionner-pdf', carte: 'Fusionner des PDF', ico: ICO.fusion, couleur: 'i-bleu',
  resume: 'Plusieurs fichiers en un seul', phare: true,
  titre: 'Fusionner des PDF',
  h1: 'Fusionner plusieurs PDF en un seul',
  titreSeo: 'Fusionner des PDF gratuitement, sans téléverser vos documents',
  meta: "Réunissez plusieurs PDF en un seul fichier, dans votre navigateur. Gratuit, sans inscription, sans filigrane, et rien n'est téléversé.",
  chapo: "Mettez plusieurs documents bout à bout dans l'ordre que vous choisissez. Les pages gardent leur qualité d'origine : rien n'est recompressé.",
  accept: 'application/pdf', multiple: true, fonction: 'fusionnerPdf',
  note: "Les documents sont mis bout à bout dans l'ordre où vous les ajoutez. Rien n'est recompressé : les pages gardent leur qualité d'origine.",
  garde: ['Toutes les pages de chaque document, dans l\'ordre choisi',
          'La qualité exacte : aucune page n\'est réencodée', 'Le texte sélectionnable et les polices intégrées',
          'Les formats de page différents, conservés tels quels'],
  perdu: ['Les signets et la table des matières de chaque fichier',
          'Les champs de formulaire remplis', 'Les signatures électroniques, qui deviennent caduques'],
  faq: [
    { q: 'Dans quel ordre les documents sont-ils assemblés ?',
      r: "Dans l'ordre où vous les ajoutez à la liste. Ajoutez-les un par un pour maîtriser la succession, et retirez d'un clic celui que vous avez mis au mauvais endroit." },
    { q: 'La qualité baisse-t-elle ?',
      r: "Non. Les pages sont recopiées telles quelles, sans réencodage : le texte reste sélectionnable et les images gardent leur définition." },
    { q: 'Puis-je fusionner des documents de formats différents ?',
      r: "Oui. Une page A4 et une page A3 cohabitent sans problème dans le même fichier : chacune garde sa taille." }
  ]
}
};

/* Contenu éditorial propre à chaque page, et maillage : `inverse` désigne l'outil
   qui fait le chemin retour, `lies` les outils vers lesquels renvoyer en contexte,
   avec la raison — un lien sans raison n'aide ni le lecteur ni le référencement. */
const EXTRA = {
'pdf-word': {
  inverse: 'word-pdf',
  contexte: "Un PDF se lit partout mais ne se reprend pas : c'est précisément ce pour quoi il a été inventé. Quand il faut corriger un paragraphe, actualiser un tarif ou réutiliser un texte dans un autre document, repasser par Word reste le chemin le plus court.",
  usages: [
    { t: 'Réutiliser un texte reçu en PDF', d: "Un devis, un compte rendu, des conditions générales : vous récupérez le texte et le remaniez sans tout retaper." },
    { t: 'Corriger une erreur dans un document dont vous n\'avez plus la source', d: "Le fichier Word d'origine a disparu ? Le PDF en tient lieu : convertissez, corrigez, réexportez." },
    { t: 'Traduire ou faire relire', d: "Un .docx s'ouvre dans un traitement de texte, un correcteur ou un outil de traduction, là où un PDF résiste." }
  ],
  format: "Le .docx est le format de Word depuis 2007. Derrière l'extension se cache une archive compressée contenant du XML : c'est ce qui permet de le fabriquer entièrement dans un navigateur, sans Word installé. Il s'ouvre aussi dans LibreOffice Writer, Pages et Google Docs.",
  lies: [
    { cle: 'pdf-excel', r: "Si votre PDF contient surtout un tableau, le convertir en classeur donnera un bien meilleur résultat." },
    { cle: 'word-pdf', r: "Une fois vos corrections faites, le chemin retour vous rend un PDF." },
    { cle: 'pdf-jpg', r: "Pour illustrer plutôt que pour modifier, une image par page suffit." }
  ]
},
'pdf-excel': {
  inverse: 'excel-pdf',
  contexte: "Les chiffres finissent souvent prisonniers d'un PDF : relevé, facture fournisseur, export d'un logiciel métier. Les recopier à la main est long et source d'erreurs ; les retrouver en colonnes permet de trier, additionner et comparer immédiatement.",
  usages: [
    { t: 'Exploiter un relevé ou une facture', d: "Récupérez les lignes et les montants pour les rapprocher de votre comptabilité." },
    { t: 'Reprendre un export qui ne propose que le PDF', d: "Beaucoup de logiciels n'exportent qu'en PDF : cet outil referme la porte qu'ils avaient laissée close." },
    { t: 'Comparer deux tableaux', d: "Une fois les deux documents en feuilles de calcul, un simple tri met les écarts en évidence." }
  ],
  format: "Le .xlsx est le format d'Excel depuis 2007, lui aussi une archive de fichiers XML. Le classeur produit ici contient du texte brut, sans mise en forme : c'est volontaire, les valeurs comptent plus que l'habillage quand il s'agit de recalculer.",
  lies: [
    { cle: 'pdf-word', r: "Si votre PDF est surtout du texte suivi, la conversion en document Word sera plus lisible." },
    { cle: 'excel-pdf', r: "Pour refaire le chemin inverse et diffuser votre tableau sans qu'il soit modifié." },
    { cle: 'pdf-png', r: "Pour conserver l'apparence exacte du tableau plutôt que ses valeurs." }
  ]
},
'pdf-ppt': {
  inverse: 'ppt-pdf',
  contexte: "Il arrive qu'on ne dispose que du PDF d'une présentation, ou qu'on veuille projeter un document conçu pour l'impression. Transposer chaque page en diapositive évite de tout refaire, et garantit que ce qui s'affichera correspond exactement au document d'origine.",
  usages: [
    { t: 'Projeter un document conçu pour le papier', d: "Un rapport, une plaquette ou un plan passent à l'écran sans refonte." },
    { t: 'Récupérer une présentation dont le .pptx est perdu', d: "Le PDF diffusé redevient un support que vous pouvez annoter et compléter." },
    { t: 'Ajouter des diapositives à un document existant', d: "Le fichier produit est un .pptx ordinaire : insérez-y vos propres diapositives." }
  ],
  format: "Le .pptx est le format de PowerPoint depuis 2007. Chaque diapositive y est décrite en XML, avec ses formes et ses images. Le fichier produit ici contient une image par diapositive : c'est ce qui garantit un rendu identique au PDF, police par police.",
  lies: [
    { cle: 'ppt-pdf', r: "Pour refaire le chemin inverse et diffuser une présentation figée." },
    { cle: 'pdf-word', r: "Si vous cherchez du texte modifiable plutôt qu'un rendu fidèle." },
    { cle: 'pdf-png', r: "Pour récupérer simplement les images des pages, sans passer par PowerPoint." }
  ]
},
'pdf-jpg': {
  inverse: 'jpg-pdf',
  contexte: "Une image s'insère là où un PDF ne passe pas : dans un message, une publication, une présentation ou un site. Convertir les pages en JPG donne des fichiers légers, immédiatement utilisables, au prix d'une compression invisible à l'œil dans la plupart des cas.",
  usages: [
    { t: 'Illustrer un message ou une publication', d: "Une page de PDF devient une image que votre destinataire voit sans rien ouvrir." },
    { t: 'Déposer une pièce sur un site qui refuse les PDF', d: "Beaucoup de formulaires en ligne n'acceptent que des images." },
    { t: 'Garder un aperçu léger', d: "Le JPG pèse une fraction du PNG, pratique pour archiver des aperçus." }
  ],
  format: "Le JPG compresse en supprimant des détails que l'œil distingue mal. Excellent pour une photographie, il est moins à l'aise sur du texte net et des aplats, où il laisse parfois un léger halo autour des lettres.",
  lies: [
    { cle: 'pdf-png', r: "Sur un document administratif plein de texte, le PNG reste plus net." },
    { cle: 'jpg-pdf', r: "Pour refaire le chemin inverse et réunir des images en un seul PDF." },
    { cle: 'pdf-word', r: "Si c'est le texte qui vous intéresse et non l'apparence." }
  ]
},
'pdf-png': {
  inverse: 'png-pdf',
  contexte: "Quand la netteté prime — un acte, une facture, un plan, une capture destinée à être agrandie — le PNG est le bon choix : il ne jette aucune information. Les traits fins et les petits caractères restent exactement tels que le PDF les dessine.",
  usages: [
    { t: 'Archiver une pièce justificative', d: "Aucune perte, donc aucune dégradation d'une copie à l'autre." },
    { t: 'Agrandir un détail', d: "Un tampon, une signature ou une mention en petits caractères restent lisibles au zoom." },
    { t: 'Préparer un visuel pour un document', d: "Le texte reste net une fois l'image replacée dans un rapport ou une présentation." }
  ],
  format: "Le PNG compresse sans rien perdre : le fichier est plus lourd qu'un JPG, mais l'image reconstituée est au pixel près celle d'origine. C'est le format à privilégier dès qu'il y a du texte ou des aplats de couleur.",
  lies: [
    { cle: 'pdf-jpg', r: "Pour des fichiers beaucoup plus légers, quand la page est surtout photographique." },
    { cle: 'png-pdf', r: "Pour refaire le chemin inverse et réunir vos images en un seul document." },
    { cle: 'pdf-ppt', r: "Pour obtenir directement une présentation plutôt qu'un dossier d'images." }
  ]
},
'word-pdf': {
  inverse: 'pdf-word',
  contexte: "Envoyer un .docx, c'est accepter que la mise en page bouge d'un ordinateur à l'autre, et que le destinataire puisse modifier le texte. Le PDF fige l'un et l'autre : c'est la raison pour laquelle devis, contrats et candidatures circulent sous cette forme.",
  usages: [
    { t: 'Envoyer un devis ou un contrat', d: "Le document arrive tel que vous l'avez conçu, sans décalage de pagination." },
    { t: 'Déposer une candidature', d: "La plupart des plateformes de recrutement demandent explicitement un PDF." },
    { t: 'Archiver une version définitive', d: "Un PDF se relit dans dix ans sans dépendre de la version de Word installée." }
  ],
  format: "Le PDF décrit une page comme une surface fixe : positions, polices et images y sont figées. C'est ce qui rend son rendu identique partout, et ce qui le rend difficile à modifier — d'où l'intérêt de garder votre .docx comme source.",
  lies: [
    { cle: 'pdf-word', r: "Pour le chemin retour, si vous avez perdu le document d'origine." },
    { cle: 'fusion', r: "Pour joindre votre courrier à d'autres pièces en un seul envoi." },
    { cle: 'excel-pdf', r: "Même démarche pour un classeur à transmettre sans qu'il soit modifié." }
  ]
},
'excel-pdf': {
  inverse: 'pdf-excel',
  contexte: "Transmettre un classeur, c'est transmettre ses formules, ses onglets masqués et la possibilité de tout changer. Le figer en PDF règle la question : le destinataire lit les chiffres que vous avez arrêtés, dans la présentation que vous avez choisie.",
  usages: [
    { t: 'Diffuser un tableau de bord', d: "Les chiffres restent ceux de la date d'envoi, sans recalcul chez le destinataire." },
    { t: 'Joindre un tableau à un dossier', d: "Un PDF s'imprime et s'archive avec le reste des pièces." },
    { t: 'Montrer sans donner les formules', d: "Seuls les résultats sont visibles : la mécanique de calcul reste chez vous." }
  ],
  format: "Le PDF produit ici est une grille lisible, pensée pour l'impression en A4 paysage. Chaque feuille du classeur donne sa propre section, avec son nom en titre et sa première ligne mise en évidence.",
  lies: [
    { cle: 'pdf-excel', r: "Pour le chemin retour, quand il faut récupérer des chiffres enfermés dans un PDF." },
    { cle: 'word-pdf', r: "Même principe pour un document rédigé plutôt qu'un tableau." },
    { cle: 'fusion', r: "Pour réunir le tableau et sa note explicative en un seul fichier." }
  ]
},
'ppt-pdf': {
  inverse: 'pdf-ppt',
  contexte: "Une présentation envoyée telle quelle s'ouvre rarement à l'identique : polices manquantes, version différente, animations qui décalent tout. En PDF, elle se lit partout, se relit hors ligne et s'imprime en support de réunion.",
  usages: [
    { t: 'Envoyer un support après une réunion', d: "Le destinataire reçoit exactement ce qu'il a vu projeté." },
    { t: 'Imprimer un jeu de diapositives', d: "Une page par diapositive, prête à être distribuée." },
    { t: 'Diffuser sans laisser modifier', d: "Le contenu est figé, les textes ne peuvent plus être déplacés." }
  ],
  format: "Le PDF produit reprend le format exact de vos diapositives, qu'elles soient en 16/9 ou en 4/3. Chaque diapositive devient une page, dans l'ordre de la présentation.",
  lies: [
    { cle: 'pdf-ppt', r: "Pour le chemin retour, si vous n'avez plus que le PDF." },
    { cle: 'jpg-pdf', r: "Si l'arrière-plan compte, exportez vos diapositives en images puis assemblez-les." },
    { cle: 'fusion', r: "Pour coller plusieurs présentations à la suite dans un seul document." }
  ]
},
'jpg-pdf': {
  inverse: 'pdf-jpg',
  contexte: "Envoyer douze photos séparées, c'est douze pièces jointes et un destinataire qui s'y perd. Les réunir dans un PDF donne un document unique, paginé, qui s'imprime d'un bloc — la façon normale de transmettre des justificatifs photographiés.",
  usages: [
    { t: 'Transmettre des justificatifs photographiés', d: "Pièce d'identité, factures, constat : un seul fichier au lieu d'une pile." },
    { t: 'Constituer un dossier', d: "Les images se suivent dans l'ordre que vous choisissez, comme les pages d'un rapport." },
    { t: 'Archiver une série de photos', d: "Un PDF se feuillette, se nomme et se classe plus facilement qu'un dossier d'images." }
  ],
  format: "Les fichiers JPG sont intégrés tels quels, sans être recompressés : la qualité d'origine est préservée et le PDF pèse à peu près la somme des images.",
  lies: [
    { cle: 'png-pdf', r: "Pour des captures d'écran, où le PNG garde un texte parfaitement net." },
    { cle: 'pdf-jpg', r: "Pour le chemin retour, et récupérer les images d'un PDF." },
    { cle: 'fusion', r: "Pour ajouter ensuite ce document à d'autres PDF existants." }
  ]
},
'png-pdf': {
  inverse: 'pdf-png',
  contexte: "Les captures d'écran s'accumulent vite et se transmettent mal. Les réunir dans un PDF donne un document propre, dans l'ordre, où chaque capture reste aussi nette qu'à l'écran — utile pour une démonstration, une procédure ou un signalement.",
  usages: [
    { t: 'Documenter une procédure', d: "Chaque étape capturée devient une page, dans l'ordre." },
    { t: 'Signaler un problème', d: "Les écrans fautifs partent en un seul envoi, lisibles sans zoom." },
    { t: 'Assembler des visuels', d: "Logos, schémas et graphiques gardent leurs aplats sans bavure." }
  ],
  format: "Le PNG est intégré sans recompression : une capture d'écran reste lisible lettre par lettre, là où un passage par le JPG laisserait un halo autour des caractères.",
  lies: [
    { cle: 'jpg-pdf', r: "Pour des photographies, où le JPG allège considérablement le fichier." },
    { cle: 'pdf-png', r: "Pour le chemin retour, et extraire les pages d'un PDF en images nettes." },
    { cle: 'fusion', r: "Pour rattacher ce document à un dossier déjà constitué." }
  ]
},
'fusion': {
  inverse: null,
  contexte: "Un dossier complet tient rarement dans un seul fichier dès le départ : un formulaire, deux justificatifs, une lettre. Les mettre bout à bout évite les envois multiples, les pièces oubliées et les destinataires qui ouvrent les documents dans le désordre.",
  usages: [
    { t: 'Constituer un dossier administratif', d: "Formulaire, pièces jointes et courrier d'accompagnement en un seul envoi." },
    { t: 'Rassembler des chapitres', d: "Chaque partie rédigée séparément reprend sa place dans l'ordre voulu." },
    { t: 'Archiver un échange', d: "Les documents d'une même affaire se classent sous un seul fichier." }
  ],
  format: "Les pages sont recopiées telles quelles, sans réencodage : le texte reste sélectionnable, les polices intégrées restent intégrées, et des formats de page différents cohabitent sans être redimensionnés.",
  lies: [
    { cle: 'jpg-pdf', r: "Pour transformer d'abord vos photos en PDF, avant de les joindre au dossier." },
    { cle: 'word-pdf', r: "Pour convertir votre courrier d'accompagnement avant de l'ajouter." },
    { cle: 'pdf-png', r: "Pour extraire ensuite une page précise du document assemblé." }
  ]
}
};
for (const k in EXTRA) Object.assign(OUTILS[k], EXTRA[k]);

/* ===================== outils agissant sur le PDF lui-même ===================== */

Object.assign(ICO, {
  compresser: '<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M9 12h6"/>',
  ciseaux:    '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8 7.5 20 18M8 16.5 20 6"/>',
  pages:      '<rect x="3" y="4" width="11" height="14" rx="2"/><path d="M17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9"/>',
  retirer:    '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h6"/>',
  rotation:   '<path d="M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5"/>',
  rogner:     '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
  numero:     '<path d="M4 5h16M4 10h16M4 15h10"/><path d="M15 19h5"/>',
  filigrane:  '<path d="M12 3 5 9v6l7 6 7-6V9z"/><path d="M8.5 12h7"/>',
  cadenas:    '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0"/>',
  stylo:      '<path d="M3 20c3 .5 5-1 6.5-3.5M5.5 14.5 15 5a2.1 2.1 0 0 1 3 3l-9.5 9.5-4 1z"/>',
  etiquette:  '<path d="M3 7a2 2 0 0 1 2-2h6l9 9-6 6-9-9z"/><circle cx="8" cy="10" r="1.2"/>',
  loupe:      '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  globe:      '<circle cx="12" cy="12" r="9"/><path d="M3.3 9h17.4M3.3 15h17.4"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
  condense:   '<path d="M4 5h16M4 10h16M7 15h10M10 20h4"/>'
});

const OUTILS2 = {

'compresser': {
  slug: 'compresser-pdf', carte: 'Compresser un PDF', ico: ICO.compresser, couleur: 'i-vert',
  resume: 'Pour tenir dans une pièce jointe', titre: 'Compresser un PDF',
  h1: 'Compresser un PDF', actionTexte: 'Compresser',
  titreSeo: 'Compresser un PDF gratuitement, sans envoyer le fichier',
  meta: "Réduisez le poids d'un PDF directement dans votre navigateur, sans limite de taille et sans téléversement. Gratuit, sans compte, sans filigrane.",
  chapo: "Faites tenir un document trop lourd dans une pièce jointe. La compression se fait sur votre machine : le fichier n'est envoyé nulle part, et vous choisissez le compromis entre poids et netteté.",
  accept: 'application/pdf', fonction: 'compresserPdf',
  options: [{ id: 'niveau', type: 'choix', label: 'Niveau de compression', defaut: 'moyenne',
    valeurs: [['forte', 'Forte', 'la plus légère'], ['moyenne', 'Équilibrée', 'recommandé'], ['douce', 'Douce', 'qualité maximale']] }],
  note: "Les pages sont rematricées à la définition choisie. Le poids chute nettement, mais le texte n'est plus sélectionnable : c'est le prix d'une compression sans serveur.",
  garde: ['L\'apparence de chaque page, polices et images comprises', 'Le format et le nombre de pages',
          'Les couleurs', 'Un document lisible à l\'écran comme à l\'impression courante'],
  perdu: ['Le texte sélectionnable et la recherche dans le document', 'Les liens cliquables et les signets',
          'Les champs de formulaire', 'Une part de finesse, proportionnelle au niveau choisi'],
  contexte: "Un PDF devient lourd pour une raison presque toujours identique : il contient des images en pleine définition, souvent des pages scannées. Les boîtes mail plafonnent généralement à 10 ou 25 Mo, et les téléservices administratifs souvent plus bas encore.",
  usages: [
    { t: 'Faire passer une pièce jointe', d: "Un dossier scanné de 40 Mo redescend couramment sous les 5 Mo." },
    { t: 'Déposer sur un téléservice', d: "Impôts, CAF, assurances : la plupart refusent au-delà de quelques mégaoctets." },
    { t: 'Archiver sans saturer', d: "Des centaines de documents prennent bien moins de place." }
  ],
  format: "La compression consiste ici à redessiner chaque page en image JPEG à la définition retenue. C'est efficace sur les scans et les documents riches en images ; sur un PDF de texte pur, déjà très compact, l'outil vous rend l'original plutôt que de l'alourdir.",
  inverse: null,
  lies: [
    { cle: 'pdf-jpg', r: "Pour récupérer directement les pages en images plutôt qu'un PDF allégé." },
    { cle: 'diviser', r: "Parfois il vaut mieux envoyer le document en deux fois que le dégrader." },
    { cle: 'supprimer-pages', r: "Retirer les pages inutiles allège souvent plus sûrement qu'une compression." }
  ],
  faq: [
    { q: 'De combien mon fichier va-t-il maigrir ?',
      r: "Sur un document scanné, la réduction dépasse souvent 80 %. Sur un PDF né d'un traitement de texte, elle est faible, voire nulle : ces fichiers sont déjà compacts. Dans ce cas l'outil vous le dit et vous rend l'original intact." },
    { q: 'Pourquoi le texte n\'est-il plus sélectionnable ?',
      r: "Parce que compresser réellement un PDF suppose de réencoder ses images, ce que seul un moteur serveur sait faire en préservant la couche de texte. Ici, chaque page est redessinée en image : c'est honnête et efficace, mais le texte devient de l'image." },
    { q: 'Puis-je compresser un document de 500 pages ?',
      r: "Oui, aucune limite n'est imposée. Comptez simplement du temps : chaque page est redessinée une par une dans votre navigateur." }
  ]
},

'diviser': {
  slug: 'diviser-pdf', carte: 'Diviser un PDF', ico: ICO.ciseaux, couleur: 'i-bleu',
  resume: 'Un fichier par page ou par plage', titre: 'Diviser un PDF',
  h1: 'Diviser un PDF en plusieurs fichiers', actionTexte: 'Découper',
  titreSeo: 'Diviser un PDF gratuitement, sans téléverser le document',
  meta: "Découpez un PDF en plusieurs fichiers, page par page ou par plages, directement dans votre navigateur. Gratuit, sans compte, sans perte de qualité.",
  chapo: "Séparez un document en autant de fichiers que nécessaire : une page chacun, ou des plages que vous définissez. Les pages sont recopiées telles quelles, sans réencodage.",
  accept: 'application/pdf', fonction: 'diviserPdf',
  options: [
    { id: 'mode', type: 'choix', label: 'Mode de découpe', defaut: 'chaque',
      valeurs: [['chaque', 'Une page par fichier', 'archive ZIP'], ['plages', 'Par plages', 'vous les définissez']] },
    { id: 'plages', type: 'texte', label: 'Plages à extraire', exemple: '1-3, 4, 5-12',
      aide: 'Séparez les plages par des virgules. Chaque plage devient un fichier.' }
  ],
  note: "Les pages sont recopiées sans être réencodées : le texte reste sélectionnable et les images gardent leur définition d'origine.",
  garde: ['La qualité exacte des pages', 'Le texte sélectionnable et les polices intégrées',
          'Les formats de page, même s\'ils diffèrent', 'L\'ordre d\'origine à l\'intérieur de chaque morceau'],
  perdu: ['Les signets et la table des matières', 'Les champs de formulaire remplis',
          'Les signatures électroniques, qui deviennent caduques'],
  contexte: "Un document unique convient rarement à tous ses destinataires : le comptable veut les factures, le client veut sa page, l'archive veut le tout. Découper évite d'envoyer cent pages à qui n'en attend qu'une.",
  usages: [
    { t: 'Isoler les pages qui concernent chacun', d: "Un relevé annuel se répartit en douze envois mensuels." },
    { t: 'Séparer un lot numérisé', d: "Un scan en continu de plusieurs documents redevient un fichier par document." },
    { t: 'Alléger un envoi', d: "Deux fichiers de 4 Mo passent là où un seul de 8 Mo est refusé." }
  ],
  format: "À partir de deux morceaux, les fichiers sont réunis dans une archive ZIP que votre système ouvre d'un double-clic. Chaque fichier porte le numéro de sa page ou de sa plage.",
  inverse: 'fusion',
  lies: [
    { cle: 'extraire-pages', r: "Si vous ne voulez qu'un seul morceau, l'extraction est plus directe." },
    { cle: 'fusion', r: "Pour refaire le chemin inverse et recoller les morceaux." },
    { cle: 'supprimer-pages', r: "Pour ne retirer que quelques pages sans découper le reste." }
  ],
  faq: [
    { q: 'Comment écrire les plages ?',
      r: "Séparez-les par des virgules : « 1-3, 4, 5-12 » produit trois fichiers. Un numéro seul donne une page seule. Les plages peuvent se recouvrir sans problème." },
    { q: 'La qualité baisse-t-elle au découpage ?',
      r: "Non. Les pages sont recopiées à l'identique, sans réencodage : le texte reste du texte et les images gardent leur définition." },
    { q: 'Et si je veux juste séparer en deux ?',
      r: "Choisissez le mode par plages et saisissez par exemple « 1-10, 11-20 » : vous obtenez deux fichiers." }
  ]
},

'extraire-pages': {
  slug: 'extraire-pages-pdf', carte: 'Extraire des pages', ico: ICO.pages, couleur: 'i-bleu',
  resume: 'Garder seulement ce qui compte', titre: 'Extraire des pages',
  h1: 'Extraire des pages d\'un PDF', actionTexte: 'Extraire les pages',
  titreSeo: 'Extraire des pages d\'un PDF gratuitement, sans téléversement',
  meta: "Sélectionnez les pages à garder dans un aperçu et obtenez un nouveau PDF, sans rien envoyer sur un serveur. Gratuit, sans compte, sans perte.",
  chapo: "Choisissez visuellement les pages à conserver et repartez avec un document qui ne contient qu'elles. Les pages gardées sont recopiées sans aucune perte.",
  accept: 'application/pdf', fonction: 'extrairePages',
  panneau: 'pages', capacites: ['selection'],
  note: "Cliquez les pages à conserver dans l'aperçu. Elles sont recopiées sans réencodage : qualité, texte et polices intacts.",
  garde: ['La qualité exacte des pages retenues', 'Le texte sélectionnable', 'L\'ordre d\'origine', 'Les formats de page'],
  perdu: ['Les signets qui pointaient vers les pages écartées', 'Les champs de formulaire remplis', 'Les signatures électroniques'],
  contexte: "Il est souvent plus simple de dire ce qu'on garde que ce qu'on jette. Pour transmettre trois pages d'un rapport de quatre-vingts, l'extraction évite d'imprimer, de rescanner ou de passer par un logiciel installé.",
  usages: [
    { t: 'Transmettre un extrait', d: "Trois pages d'un contrat partent sans le reste du dossier." },
    { t: 'Constituer un justificatif', d: "Seules les pages demandées par l'administration sont jointes." },
    { t: 'Récupérer un chapitre', d: "Une partie d'un livre ou d'un manuel devient un document autonome." }
  ],
  format: "L'aperçu affiche toutes les pages en vignettes : un clic sélectionne, un autre désélectionne. Rien n'est envoyé pour produire cet aperçu, il est calculé dans votre navigateur.",
  inverse: null,
  lies: [
    { cle: 'supprimer-pages', r: "Quand il y a plus de pages à garder qu'à jeter, l'inverse est plus rapide." },
    { cle: 'diviser', r: "Pour obtenir plusieurs morceaux d'un coup plutôt qu'un seul extrait." },
    { cle: 'organiser', r: "Pour aussi remettre les pages dans l'ordre voulu." }
  ],
  faq: [
    { q: 'Les pages extraites gardent-elles leur qualité ?',
      r: "Oui, intégralement : elles sont recopiées sans être réencodées. Le texte reste sélectionnable et les images conservent leur définition." },
    { q: 'Puis-je changer l\'ordre en même temps ?',
      r: "Les pages sortent dans leur ordre d'origine. Pour les réordonner, utilisez l'outil d'organisation, qui permet de déplacer chaque page." },
    { q: 'Y a-t-il une limite au nombre de pages ?',
      r: "Non. L'aperçu affiche les vignettes au fil du défilement, ce qui reste fluide même sur un document épais." }
  ]
},

'supprimer-pages': {
  slug: 'supprimer-pages-pdf', carte: 'Supprimer des pages', ico: ICO.retirer, couleur: 'i-rouge',
  resume: 'Retirer ce qui n\'a rien à faire là', titre: 'Supprimer des pages',
  h1: 'Supprimer des pages d\'un PDF', actionTexte: 'Supprimer les pages',
  titreSeo: 'Supprimer des pages d\'un PDF, gratuit et sans envoi',
  meta: "Retirez les pages inutiles d'un PDF en les cliquant dans un aperçu. Tout se passe dans votre navigateur : aucun téléversement, aucun compte.",
  chapo: "Page blanche, double scan, annexe sans intérêt : cliquez les pages à retirer et repartez avec un document net. Les pages conservées ne sont pas réencodées.",
  accept: 'application/pdf', fonction: 'supprimerPages',
  panneau: 'pages', capacites: ['selection'],
  note: "Cliquez dans l'aperçu les pages à retirer. Les autres sont recopiées telles quelles, sans perte.",
  garde: ['La qualité exacte des pages conservées', 'Le texte sélectionnable', 'L\'ordre d\'origine', 'Les formats de page'],
  perdu: ['Les signets qui pointaient vers les pages retirées', 'Les champs de formulaire remplis', 'Les signatures électroniques'],
  contexte: "Un scanner produit presque toujours une page de trop : un verso vierge, une feuille de séparation, une double numérisation. Les laisser alourdit le fichier et brouille la lecture.",
  usages: [
    { t: 'Nettoyer un scan', d: "Les versos vierges et les feuilles doublées disparaissent." },
    { t: 'Retirer une annexe', d: "Le corps du document part sans les pièces jointes." },
    { t: 'Écarter une page confidentielle', d: "Une page sensible est retirée avant transmission — et là, elle disparaît vraiment du fichier." }
  ],
  format: "Contrairement au masquage dans l'éditeur, qui recouvre visuellement, la suppression retire réellement la page du document : son contenu n'est plus récupérable dans le fichier produit.",
  inverse: null,
  lies: [
    { cle: 'extraire-pages', r: "Quand il y a plus à jeter qu'à garder, l'extraction est plus rapide." },
    { cle: 'organiser', r: "Pour aussi réordonner ou faire pivoter ce qui reste." },
    { cle: 'compresser', r: "Si l'objectif était d'alléger, la compression va plus loin." }
  ],
  faq: [
    { q: 'Le contenu supprimé est-il vraiment effacé ?',
      r: "Oui. La page n'est pas recopiée dans le document produit : son texte et ses images n'y figurent plus du tout. C'est la différence avec le masquage de l'éditeur, qui ne fait que recouvrir." },
    { q: 'Puis-je tout supprimer ?',
      r: "Non : un PDF doit garder au moins une page. L'outil vous arrête si votre sélection ne laisse rien." },
    { q: 'Le reste du document est-il modifié ?',
      r: "Non, les pages conservées sont recopiées à l'identique : ni recompression, ni changement de format." }
  ]
},

'organiser': {
  slug: 'organiser-pdf', carte: 'Organiser les pages', ico: ICO.pages, couleur: 'i-violet',
  resume: 'Réordonner et redresser', titre: 'Organiser un PDF',
  h1: 'Réorganiser les pages d\'un PDF', actionTexte: 'Appliquer l\'ordre',
  titreSeo: 'Réorganiser les pages d\'un PDF, gratuit et sans envoi',
  meta: "Déplacez, inversez et faites pivoter les pages d'un PDF depuis un aperçu, dans votre navigateur. Gratuit, sans compte, sans envoi de fichier.",
  chapo: "Remettez les pages dans le bon ordre et redressez celles qui sont de travers, en les voyant. Tout se décide dans l'aperçu, rien n'est envoyé.",
  accept: 'application/pdf', fonction: 'organiserPages',
  panneau: 'pages', capacites: ['ordre', 'rotation'],
  note: "Déplacez les pages avec les flèches, faites-les pivoter d'un clic, inversez tout l'ordre d'un bouton. Les pages ne sont pas réencodées.",
  garde: ['La qualité exacte des pages', 'Le texte sélectionnable', 'Les formats de page', 'Les rotations que vous appliquez'],
  perdu: ['Les signets, dont les cibles ne correspondent plus', 'Les champs de formulaire remplis', 'Les signatures électroniques'],
  contexte: "Un chargeur de scanner avale parfois les feuilles à l'envers, et un document assemblé à la hâte sort rarement dans le bon ordre. Reprendre tout le scan pour deux pages mal placées n'a pas de sens.",
  usages: [
    { t: 'Remettre un scan dans l\'ordre', d: "Les pages avalées à l'envers retrouvent leur place." },
    { t: 'Redresser des pages couchées', d: "Un tableau scanné en paysage se lit enfin dans le bon sens." },
    { t: 'Inverser un document entier', d: "Un scan effectué de la dernière à la première page se remet d'un bouton." }
  ],
  format: "La rotation suit la page, pas son rang : si vous faites pivoter la page 3 puis la déplacez, elle emporte sa rotation avec elle.",
  inverse: null,
  lies: [
    { cle: 'pivoter', r: "Si vous voulez seulement faire pivoter tout le document, c'est plus direct." },
    { cle: 'supprimer-pages', r: "Pour écarter les pages en trop avant de réordonner." },
    { cle: 'fusion', r: "Pour assembler d'abord plusieurs documents, puis ranger l'ensemble." }
  ],
  faq: [
    { q: 'Comment déplacer une page ?',
      r: "Les deux flèches sous chaque vignette l'avancent ou la reculent d'un rang. Pour un grand déplacement, cliquez plusieurs fois : l'aperçu suit en direct." },
    { q: 'La rotation est-elle réelle ou seulement visuelle ?',
      r: "Elle est inscrite dans le fichier produit : la page s'ouvrira redressée dans n'importe quel lecteur, et s'imprimera ainsi." },
    { q: 'Puis-je tout inverser d\'un coup ?',
      r: "Oui, le bouton « Inverser l'ordre » retourne le document entier, ce qui règle le cas classique du scan effectué à l'envers." }
  ]
},

'pivoter': {
  slug: 'pivoter-pdf', carte: 'Pivoter un PDF', ico: ICO.rotation, couleur: 'i-violet',
  resume: 'Redresser des pages couchées', titre: 'Pivoter un PDF',
  h1: 'Pivoter les pages d\'un PDF', actionTexte: 'Appliquer la rotation',
  titreSeo: 'Pivoter un PDF gratuitement, sans téléverser le document',
  meta: "Faites pivoter tout un PDF ou seulement certaines pages, dans votre navigateur. La rotation est enregistrée dans le fichier. Gratuit et sans envoi.",
  chapo: "Redressez un document numérisé de travers. La rotation est écrite dans le fichier : il s'ouvrira droit partout, et s'imprimera droit.",
  accept: 'application/pdf', fonction: 'pivoterPdf',
  panneau: 'pages', capacites: ['rotation'],
  note: "Pivotez tout le document d'un bouton, ou page par page dans l'aperçu. Rien d'autre n'est touché.",
  garde: ['La qualité exacte des pages', 'Le texte sélectionnable', 'Le poids du fichier, à l\'octet près ou presque', 'Les liens et signets'],
  perdu: ['Rien : seule l\'orientation déclarée des pages change'],
  contexte: "Une page couchée se lit en tournant la tête ou en pivotant l'affichage à chaque ouverture — et s'imprime de travers. Corriger l'orientation une fois règle le problème pour tous les destinataires.",
  usages: [
    { t: 'Redresser un scan', d: "Les feuilles avalées dans le mauvais sens se remettent droites." },
    { t: 'Remettre un tableau d\'aplomb', d: "Une page en paysage insérée dans un document portrait se lit normalement." },
    { t: 'Préparer une impression', d: "Un document droit à l'écran s'imprime droit." }
  ],
  format: "La rotation d'un PDF n'est pas un redessin : c'est une propriété de la page, lue par tous les lecteurs. L'opération est donc instantanée et strictement sans perte.",
  inverse: null,
  lies: [
    { cle: 'organiser', r: "Pour pivoter et réordonner dans le même mouvement." },
    { cle: 'rogner', r: "Pour aussi retirer des marges parasites après un scan." },
    { cle: 'compresser', r: "Si le scan redressé reste trop lourd à envoyer." }
  ],
  faq: [
    { q: 'La rotation est-elle définitive ?',
      r: "Elle est inscrite dans le fichier produit, donc visible partout. Vous pouvez naturellement repasser l'outil pour revenir en arrière." },
    { q: 'Puis-je ne pivoter qu\'une page ?',
      r: "Oui : chaque vignette de l'aperçu a son propre bouton de rotation. Les boutons du haut agissent, eux, sur tout le document." },
    { q: 'Le fichier s\'alourdit-il ?',
      r: "Non. Aucune page n'est redessinée : seule une propriété d'orientation change." }
  ]
},

'rogner': {
  slug: 'rogner-pdf', carte: 'Rogner un PDF', ico: ICO.rogner, couleur: 'i-ambre',
  resume: 'Couper les marges inutiles', titre: 'Rogner un PDF',
  h1: 'Rogner les marges d\'un PDF', actionTexte: 'Rogner',
  titreSeo: 'Rogner un PDF gratuitement, sans téléverser le fichier',
  meta: "Coupez les marges d'un PDF en faisant glisser les bords sur un aperçu, directement dans votre navigateur. Gratuit, sans compte, sans envoi.",
  chapo: "Supprimez les marges noires d'un scan ou recentrez une page mal cadrée. Vous voyez ce que vous coupez avant de valider.",
  accept: 'application/pdf', fonction: 'rognerPdf',
  panneau: 'rogner',
  note: "Faites glisser les quatre bords sur l'aperçu. Le cadrage choisi s'applique à toutes les pages du document.",
  garde: ['Le contenu à l\'intérieur du cadre, sans aucune perte', 'Le texte sélectionnable',
          'La définition des images', 'Le poids du fichier, quasi inchangé'],
  perdu: ['Ce qui dépasse du cadre n\'est plus affiché', 'Le même cadrage s\'applique à toutes les pages'],
  contexte: "Un document photographié ou scanné embarque souvent une bordure noire, un bout de table ou une marge démesurée. À l'impression, cela gâche la page ; à l'écran, cela réduit la zone utile.",
  usages: [
    { t: 'Enlever une bordure de scan', d: "Le liseré noir autour de la feuille disparaît." },
    { t: 'Recadrer une photo de document', d: "Une page photographiée au téléphone retrouve des bords nets." },
    { t: 'Gagner de la place à l\'impression', d: "Des marges réduites laissent le texte plus grand." }
  ],
  format: "Le rognage modifie la zone affichée de la page, pas son contenu. Techniquement, ce qui dépasse reste dans le fichier mais n'est plus montré : pour effacer vraiment, réimprimez ensuite le résultat en PDF.",
  inverse: null,
  lies: [
    { cle: 'pivoter', r: "Un scan de travers se redresse avant d'être recadré." },
    { cle: 'compresser', r: "Pour alléger le document une fois recadré." },
    { cle: 'pdf-jpg', r: "Pour récupérer directement les pages recadrées en images." }
  ],
  faq: [
    { q: 'Le cadrage s\'applique-t-il à toutes les pages ?',
      r: "Oui, le même cadre est appliqué partout. C'est le cas d'usage dominant, un scan ayant les mêmes marges du début à la fin." },
    { q: 'Le contenu coupé est-il supprimé du fichier ?',
      r: "Non : il est seulement masqué par la nouvelle zone d'affichage. Si l'objectif est d'effacer une information, réimprimez le résultat en PDF après rognage." },
    { q: 'Le fichier devient-il plus léger ?',
      r: "Très peu : rien n'est réencodé. Pour alléger réellement, enchaînez avec la compression." }
  ]
},

'numeroter': {
  slug: 'numeroter-pdf', carte: 'Numéroter les pages', ico: ICO.numero, couleur: 'i-bleu',
  resume: 'Ajouter une pagination', titre: 'Numéroter un PDF',
  h1: 'Numéroter les pages d\'un PDF', actionTexte: 'Numéroter',
  titreSeo: 'Numéroter les pages d\'un PDF, gratuit et sans envoi',
  meta: "Ajoutez une pagination à un PDF, à la position et au format de votre choix, dans votre navigateur. Gratuit, sans compte, sans téléversement.",
  chapo: "Posez des numéros de page sur un document qui n'en a pas. Choisissez la position, le format et le numéro de départ.",
  accept: 'application/pdf', fonction: 'numeroterPdf',
  options: [
    { id: 'position', type: 'liste', label: 'Position', defaut: 'bas-centre',
      valeurs: [['bas-centre', 'En bas, centré'], ['bas-droite', 'En bas à droite'], ['bas-gauche', 'En bas à gauche'],
                ['haut-centre', 'En haut, centré'], ['haut-droite', 'En haut à droite'], ['haut-gauche', 'En haut à gauche']] },
    { id: 'format', type: 'choix', label: 'Format', defaut: 'simple',
      valeurs: [['simple', '1', 'le numéro seul'], ['sur-total', '1 / 12', 'avec le total'], ['page-n', 'Page 1', 'en toutes lettres']] },
    { id: 'debut', type: 'nombre', label: 'Commencer à', defaut: '1', min: 1,
      aide: 'Utile si les premières pages sont une couverture déjà numérotée à part.' },
    { id: 'taille', type: 'nombre', label: 'Taille du texte (pt)', defaut: '11', min: 6, max: 40 }
  ],
  note: "Les numéros sont ajoutés par-dessus les pages existantes, sans rien réencoder. Le reste du document est intact.",
  garde: ['Tout le contenu existant, à l\'identique', 'Le texte sélectionnable', 'Le poids du fichier, quasi inchangé'],
  perdu: ['Rien : seule une ligne de texte est ajoutée sur chaque page'],
  contexte: "Un dossier remis à un tribunal, à un jury ou à un client se pagine. C'est aussi la seule façon de se référer à une page lors d'un échange, et de repérer une feuille égarée après impression.",
  usages: [
    { t: 'Préparer un dossier officiel', d: "Les pièces paginées se citent et se vérifient." },
    { t: 'Paginer un document assemblé', d: "Après une fusion, la numérotation d'origine ne vaut plus rien." },
    { t: 'Faciliter la relecture', d: "Un relecteur peut renvoyer à « la page 14 » sans ambiguïté." }
  ],
  format: "Le numéro est écrit dans une police standard du PDF, en gris foncé, à quelques millimètres du bord. Il se superpose au contenu : si vos pages ont déjà un pied de page chargé, choisissez une position libre.",
  inverse: null,
  lies: [
    { cle: 'fusion', r: "Numéroter après une fusion est le réflexe qui donne un dossier propre." },
    { cle: 'filigrane', r: "Pour aussi marquer chaque page d'une mention." },
    { cle: 'organiser', r: "Mettez les pages dans l'ordre avant de les numéroter." }
  ],
  faq: [
    { q: 'Puis-je commencer à un autre numéro que 1 ?',
      r: "Oui. Le champ « Commencer à » décale toute la numérotation, ce qui sert quand une couverture ou un sommaire se compte à part." },
    { q: 'Et si mes pages ont déjà un pied de page ?',
      r: "Choisissez une autre position parmi les six proposées : le numéro se superpose au contenu, il ne le repousse pas." },
    { q: 'La numérotation est-elle du vrai texte ?',
      r: "Oui, c'est du texte sélectionnable et cherchable, pas une image." }
  ]
},

'filigrane': {
  slug: 'filigrane-pdf', carte: 'Ajouter un filigrane', ico: ICO.filigrane, couleur: 'i-ambre',
  resume: 'Marquer chaque page', titre: 'Filigrane sur un PDF',
  h1: 'Ajouter un filigrane à un PDF', actionTexte: 'Appliquer le filigrane',
  titreSeo: 'Ajouter un filigrane à un PDF gratuitement, sans téléversement',
  meta: "Apposez une mention en filigrane sur toutes les pages d'un PDF, dans votre navigateur. Texte, couleur et intensité au choix. Gratuit et sans envoi.",
  chapo: "Marquez un document d'un « CONFIDENTIEL », d'un « BROUILLON » ou du nom de son destinataire, sur toutes les pages à la fois.",
  accept: 'application/pdf', fonction: 'filigranePdf',
  options: [
    { id: 'texte', type: 'texte', label: 'Texte du filigrane', defaut: 'CONFIDENTIEL', exemple: 'CONFIDENTIEL' },
    { id: 'couleur', type: 'choix', label: 'Couleur', defaut: 'gris',
      valeurs: [['gris', 'Gris', 'discret'], ['rouge', 'Rouge', 'alerte'], ['bleu', 'Bleu', 'mention']] },
    { id: 'angle', type: 'choix', label: 'Inclinaison', defaut: 'oblique',
      valeurs: [['oblique', 'En diagonale', 'classique'], ['droit', 'Horizontal', 'discret']] },
    { id: 'opacite', type: 'nombre', label: 'Intensité (%)', defaut: '12', min: 3, max: 60,
      aide: 'Au-delà de 25 %, le filigrane gêne la lecture du document.' },
    { id: 'taille', type: 'nombre', label: 'Taille (pt)', defaut: '54', min: 10, max: 160 }
  ],
  note: "Le filigrane est posé au centre de chaque page, par-dessus le contenu existant, sans rien réencoder.",
  garde: ['Tout le contenu existant, à l\'identique', 'Le texte sélectionnable', 'Le poids du fichier, quasi inchangé'],
  perdu: ['Rien : le filigrane s\'ajoute, il ne remplace pas'],
  contexte: "Un document qui circule finit par être confondu avec sa version définitive, ou diffusé plus loin que prévu. Une mention en travers de chaque page lève l'ambiguïté immédiatement, y compris sur une impression ou une photo d'écran.",
  usages: [
    { t: 'Marquer un brouillon', d: "Personne ne confond une version de travail avec la version signée." },
    { t: 'Signaler un document confidentiel', d: "La mention suit le document, même imprimé." },
    { t: 'Personnaliser une copie', d: "Le nom du destinataire sur chaque page dissuade la rediffusion." }
  ],
  format: "Le filigrane est du texte, pas une image : il reste net à tous les niveaux de zoom et n'alourdit pratiquement pas le fichier. Il est posé par-dessus le contenu, donc visible à l'impression.",
  inverse: null,
  lies: [
    { cle: 'numeroter', r: "Pagination et filigrane vont souvent ensemble sur un dossier officiel." },
    { cle: 'metadonnees', r: "Marquer la page ne sert à rien si le fichier révèle encore son auteur." },
    { cle: 'compresser', r: "Si le document marqué doit ensuite être envoyé par courriel." }
  ],
  faq: [
    { q: 'Le filigrane peut-il être retiré ?',
      r: "Pas facilement : il fait partie du contenu de la page. Ce n'est pas une protection cryptographique pour autant — c'est une mention visible, pas un verrou." },
    { q: 'Quelle intensité choisir ?',
      r: "Autour de 10 à 15 % le filigrane se voit sans gêner la lecture. Au-delà de 25 %, le texte du document devient pénible à lire." },
    { q: 'Puis-je mettre mon logo ?',
      r: "Cet outil pose du texte. Pour une image, passez par l'éditeur, qui permet d'ajouter un élément à l'endroit de votre choix." }
  ]
},

'metadonnees': {
  slug: 'supprimer-metadonnees-pdf', carte: 'Nettoyer les métadonnées', ico: ICO.etiquette, couleur: 'i-rouge',
  resume: 'Ce que votre fichier raconte sur vous', titre: 'Métadonnées d\'un PDF',
  h1: 'Supprimer les métadonnées d\'un PDF', actionTexte: 'Nettoyer le fichier',
  titreSeo: 'Supprimer les métadonnées d\'un PDF gratuitement et sans envoi',
  meta: "Voyez ce que votre PDF révèle — auteur, logiciel, dates — et effacez-le, dans votre navigateur. Gratuit, sans compte, sans téléversement.",
  chapo: "Un PDF transporte souvent le nom de son auteur, celui de son logiciel et ses dates de création. L'outil vous montre d'abord ce que le vôtre révèle, puis l'efface.",
  accept: 'application/pdf', fonction: 'nettoyerMetadonnees',
  panneau: 'metadonnees',
  note: "Titre, auteur, sujet, mots-clés, logiciel et dates sont vidés. Le contenu des pages n'est pas touché.",
  garde: ['Tout le contenu des pages, à l\'identique', 'Le texte sélectionnable', 'La qualité des images'],
  perdu: ['Le nom de l\'auteur et du logiciel', 'Les dates de création et de modification',
          'Le titre, le sujet et les mots-clés', 'Attention : le texte à l\'intérieur des pages n\'est pas concerné'],
  contexte: "Un CV exporté depuis un traitement de texte porte généralement le nom du compte de l'ordinateur. Un devis révèle le logiciel de facturation. Ces informations voyagent avec le fichier sans que personne ne les regarde — jusqu'au jour où quelqu'un les regarde.",
  usages: [
    { t: 'Envoyer un CV', d: "Le nom du poste de travail ou d'un ancien employeur n'accompagne plus le fichier." },
    { t: 'Transmettre un document d\'entreprise', d: "Le logiciel interne et l'auteur réel restent chez vous." },
    { t: 'Publier un document', d: "Un fichier mis en ligne ne révèle plus sa chaîne de production." }
  ],
  format: "Les métadonnées sont des champs du fichier, distincts du contenu des pages. Les effacer ne modifie rien de ce qui est écrit : si une information sensible figure dans le texte, c'est l'éditeur qu'il faut utiliser.",
  inverse: null,
  lies: [
    { cle: 'filigrane', r: "Nettoyer le fichier et marquer les pages sont deux gestes complémentaires." },
    { cle: 'compresser', r: "Le rematriçage efface aussi au passage la couche de texte, donc davantage d'indices." },
    { cle: 'supprimer-pages', r: "Pour retirer réellement une page sensible plutôt que la masquer." }
  ],
  faq: [
    { q: 'Qu\'est-ce qui est réellement effacé ?',
      r: "Le titre, l'auteur, le sujet, les mots-clés, le nom du logiciel producteur et les dates de création et de modification. Ce sont les champs qu'un lecteur de PDF affiche dans les propriétés du document." },
    { q: 'Mes données personnelles dans le texte disparaissent-elles ?',
      r: "Non, et c'est important : seules les métadonnées du fichier sont vidées. Pour retirer une information écrite dans une page, utilisez l'éditeur puis réimprimez le résultat en PDF." },
    { q: 'Le document reste-t-il lisible partout ?',
      r: "Oui. Ces champs sont informatifs : aucun lecteur n'en a besoin pour ouvrir le fichier." }
  ]
},

'deverrouiller': {
  slug: 'deverrouiller-pdf', carte: 'Déverrouiller un PDF', ico: ICO.cadenas, couleur: 'i-rouge',
  resume: 'Retirer une protection connue', titre: 'Déverrouiller un PDF',
  h1: 'Déverrouiller un PDF protégé', actionTexte: 'Déverrouiller',
  titreSeo: 'Déverrouiller un PDF gratuitement, sans téléverser le document',
  meta: "Retirez la protection d'un PDF dont vous connaissez le mot de passe, dans votre navigateur. Aucun fichier envoyé, aucun compte, gratuit.",
  chapo: "Produisez une copie sans protection d'un document que vous avez le droit d'ouvrir. Le mot de passe que vous saisissez ne quitte pas votre navigateur.",
  accept: 'application/pdf', fonction: 'deverrouillerPdf',
  options: [{ id: 'motdepasse', type: 'motdepasse', label: 'Mot de passe du document', exemple: 'laissez vide si le document s\'ouvre sans',
    aide: 'Il reste dans votre navigateur : la page ne communique avec aucun serveur.' }],
  note: "Les pages sont redessinées sans la protection : le document s'ouvre et s'imprime librement, mais son texte devient de l'image.",
  garde: ['L\'apparence exacte de chaque page', 'Le format et le nombre de pages', 'Les couleurs et la définition'],
  perdu: ['Le texte sélectionnable et la recherche', 'Les liens cliquables et les signets', 'Les champs de formulaire'],
  contexte: "Un relevé bancaire ou une facture d'opérateur arrive souvent protégé par un mot de passe, voire bridé à l'impression. Quand il faut le joindre à un dossier, la protection devient un obstacle alors que vous avez parfaitement le droit d'accéder au contenu.",
  usages: [
    { t: 'Joindre un relevé à un dossier', d: "Le document s'ouvre sans demander de mot de passe au destinataire légitime." },
    { t: 'Imprimer un document bridé', d: "Une restriction d'impression ne bloque plus une copie que vous détenez." },
    { t: 'Archiver sans dépendre d\'un mot de passe', d: "Le document reste lisible dans dix ans." }
  ],
  format: "pdf.js sait déchiffrer un document, mais pas le réécrire déchiffré : l'outil redessine donc chaque page. C'est la limite honnête d'une déprotection sans serveur, et la raison pour laquelle le texte devient de l'image.",
  inverse: null,
  lies: [
    { cle: 'ocr', r: "Pour retrouver du texte exploitable après la déprotection." },
    { cle: 'compresser', r: "Le résultat étant matricé, la compression s'applique bien." },
    { cle: 'metadonnees', r: "Pour aussi nettoyer ce que le fichier révèle." }
  ],
  faq: [
    { q: 'Cet outil casse-t-il les mots de passe ?',
      r: "Non, et ce n'est pas son objet. Il retire la protection d'un document que vous pouvez déjà ouvrir, en saisissant le mot de passe si le document en demande un. Aucune tentative de déchiffrement n'est faite." },
    { q: 'Mon mot de passe est-il transmis quelque part ?',
      r: "Non. Il est utilisé par le lecteur PDF de votre navigateur, dans l'onglet. La page ne communique avec aucun serveur, vous pouvez même couper votre connexion." },
    { q: 'Pourquoi le texte n\'est-il plus sélectionnable ?',
      r: "Parce qu'un PDF déchiffré ne peut pas être réécrit tel quel depuis un navigateur. Les pages sont redessinées à partir de leur rendu, ce qui préserve l'apparence mais transforme le texte en image." }
  ]
},

'signer': {
  slug: 'signer-pdf', carte: 'Signer un PDF', ico: ICO.stylo, couleur: 'i-vert',
  resume: 'Dessiner et apposer sa signature', titre: 'Signer un PDF',
  h1: 'Signer un PDF à la main', actionTexte: 'Apposer la signature',
  titreSeo: 'Signer un PDF gratuitement, sans téléverser le document',
  meta: "Dessinez votre signature et apposez-la sur un PDF, entièrement dans votre navigateur. Ni compte, ni envoi du document, ni filigrane.",
  chapo: "Tracez votre signature à la souris ou au doigt, choisissez la page, et récupérez le document signé. Ni le contrat ni la signature ne quittent votre ordinateur.",
  accept: 'application/pdf', fonction: 'signerPdf',
  panneau: 'signature',
  options: [
    { id: 'page', type: 'nombre', label: 'Page à signer', defaut: '', min: 1,
      aide: 'Laissez vide pour signer la dernière page, ce qui est le cas le plus courant.' },
    { id: 'largeur', type: 'liste', label: 'Taille de la signature', defaut: '0.26',
      valeurs: [['0.18', 'Discrète'], ['0.26', 'Normale'], ['0.36', 'Large']] },
    { id: 'x', type: 'liste', label: 'Position horizontale', defaut: '0.62',
      valeurs: [['0.08', 'À gauche'], ['0.37', 'Au centre'], ['0.62', 'À droite']] },
    { id: 'y', type: 'liste', label: 'Position verticale', defaut: '0.1',
      valeurs: [['0.1', 'En bas'], ['0.45', 'Au milieu'], ['0.8', 'En haut']] }
  ],
  note: "La signature est dessinée dans le navigateur, transformée en image et posée sur la page choisie. Le reste du document n'est pas réencodé.",
  garde: ['Tout le contenu existant, à l\'identique', 'Le texte sélectionnable', 'La qualité des pages'],
  perdu: ['Rien : la signature est simplement ajoutée par-dessus'],
  contexte: "Imprimer, signer, scanner, renvoyer : la boucle classique coûte dix minutes, une imprimante et une qualité dégradée. Signer directement le fichier évite les trois.",
  usages: [
    { t: 'Retourner un contrat', d: "Le document part signé sans passer par l'imprimante." },
    { t: 'Valider un devis', d: "Un bon pour accord se pose en quelques secondes." },
    { t: 'Signer un formulaire administratif', d: "Le fichier reçu repart signé, dans la même qualité." }
  ],
  format: "Il s'agit d'une signature manuscrite apposée visuellement, comme un paraphe sur papier. Ce n'est pas une signature électronique qualifiée : celle-ci suppose un certificat délivré par un tiers de confiance et une infrastructure dédiée.",
  inverse: null,
  lies: [
    { cle: 'fusion', r: "Pour joindre le contrat signé à vos pièces justificatives." },
    { cle: 'numeroter', r: "Un dossier contractuel se pagine avant d'être transmis." },
    { cle: 'compresser', r: "Si le document signé doit tenir dans une pièce jointe." }
  ],
  faq: [
    { q: 'Cette signature a-t-elle une valeur juridique ?',
      r: "C'est l'équivalent numérique d'un paraphe manuscrit : largement accepté dans les échanges commerciaux courants, au même titre qu'un contrat scanné. Une signature électronique qualifiée au sens du règlement eIDAS est autre chose et suppose un prestataire certifié." },
    { q: 'Ma signature est-elle enregistrée quelque part ?',
      r: "Non. Elle est dessinée dans l'onglet, posée sur le document, puis disparaît quand vous fermez la page. Rien n'est transmis ni conservé." },
    { q: 'Puis-je signer ailleurs que sur la dernière page ?',
      r: "Oui : indiquez le numéro de la page voulue, et réglez la position avec les trois listes prévues." }
  ]
},

'ocr': {
  slug: 'ocr-pdf', carte: 'PDF scanné en texte', ico: ICO.loupe, couleur: 'i-violet',
  resume: 'Reconnaissance de caractères', titre: 'OCR d\'un PDF',
  h1: 'Extraire le texte d\'un PDF scanné', actionTexte: 'Reconnaître le texte',
  titreSeo: 'OCR d\'un PDF scanné gratuitement, sans envoyer le document',
  meta: "Reconnaissez le texte d'un PDF scanné dans votre navigateur et récupérez-le en .txt ou en Word. Gratuit, en français, sans téléversement.",
  chapo: "Un document scanné n'est qu'une image : on ne peut ni le chercher, ni le copier. La reconnaissance de caractères le retranscrit en texte, ici sur votre machine, en français.",
  accept: 'application/pdf', fonction: 'ocrVersTexte',
  tesseract: true,
  options: [{ id: 'sortie', type: 'choix', label: 'Format de sortie', defaut: 'txt',
    valeurs: [['txt', 'Texte brut', 'fichier .txt'], ['docx', 'Document Word', 'fichier .docx']] }],
  note: "La reconnaissance est en français et tourne entièrement dans votre navigateur. Comptez quelques secondes par page.",
  garde: ['Le texte de chaque page, dans l\'ordre de lecture', 'Les accents et la ponctuation française',
          'La séparation entre les pages', 'Les paragraphes, approximativement'],
  perdu: ['La mise en page, les colonnes et les tableaux', 'Les images et les logos',
          'Les polices et la mise en forme', 'Une part d\'exactitude sur un scan de mauvaise qualité'],
  contexte: "La plupart des documents reçus par courrier et numérisés sont illisibles pour un ordinateur : rien n'y est cherchable. C'est précisément cette reconnaissance que les services en ligne réservent à leurs formules payantes, parce qu'elle leur coûte du temps de serveur.",
  usages: [
    { t: 'Retrouver une information dans un scan', d: "Le texte extrait se cherche au clavier, contrairement à l'image." },
    { t: 'Reprendre un courrier reçu', d: "Un document papier numérisé redevient du texte à citer ou à corriger." },
    { t: 'Archiver de façon exploitable', d: "Des années de courrier deviennent un corpus consultable." }
  ],
  format: "Le moteur est Tesseract, compilé pour le navigateur, avec les données de langue française embarquées. La qualité dépend surtout du scan : un document net et droit donne un excellent résultat, une photo de travers beaucoup moins.",
  inverse: null,
  lies: [
    { cle: 'pdf-word', r: "Si votre PDF contient déjà du texte, la conversion directe sera parfaite." },
    { cle: 'pivoter', r: "Redresser un scan de travers améliore nettement la reconnaissance." },
    { cle: 'compresser', r: "Les scans sont lourds : la compression les rend transmissibles." }
  ],
  faq: [
    { q: 'Comment savoir si mon PDF est un scan ?',
      r: "Essayez de sélectionner une ligne avec la souris dans votre lecteur. Si rien ne se sélectionne, c'est une image : cet outil est fait pour ça." },
    { q: 'La reconnaissance gère-t-elle les accents ?',
      r: "Oui, le modèle est spécifiquement français : accents, cédilles et ponctuation française sont pris en charge." },
    { q: 'Et si je veux corriger directement dans le PDF ?',
      r: "Ouvrez-le plutôt dans l'éditeur : la reconnaissance s'y lance automatiquement et chaque ligne reconnue devient modifiable à sa place, dans le document." }
  ]
},

/* ------------------------- comprendre un document ------------------------ */

'resumer': {
  slug: 'resumer-pdf', carte: 'Résumer un PDF', ico: ICO.condense, couleur: 'i-ambre',
  resume: "L'essentiel d'un long document", titre: 'Résumé de PDF',
  h1: "Résumer un PDF sans l'envoyer nulle part", actionTexte: 'Résumer le document',
  titreSeo: 'Résumer un PDF gratuitement, sans envoyer le document',
  meta: "Obtenez l'essentiel d'un PDF long en quelques secondes, dans votre navigateur. Gratuit, sans compte, et votre document n'est transmis à aucun serveur ni à aucune IA en ligne.",
  chapo: "Un rapport de quarante pages, un contrat, un compte rendu : le résumé retient les passages qui portent l'information et écarte le reste. Le calcul se fait sur votre machine, le document ne part nulle part.",
  accept: 'application/pdf', fonction: 'resumerPdf', ia: true, tesseract: true,
  options: [
    { id: 'longueur', type: 'choix', label: 'Longueur du résumé', defaut: 'moyen',
      valeurs: [['court', 'Court', 'environ un dixième'],
                ['moyen', 'Moyen', 'environ un cinquième'],
                ['long', 'Détaillé', 'environ un tiers']] },
    { id: 'moteur', type: 'choix', label: 'Méthode', defaut: 'extrait',
      valeurs: [['extrait', 'Phrases du document', 'toutes langues · instantané'],
                ['redige', 'Résumé rédigé', 'anglais · modèle de 271 Mo']],
      aide: "La première méthode sélectionne les phrases les plus porteuses du document : elle n'invente rien et fonctionne dans toutes les langues. La seconde rédige un texte neuf, mais le modèle n'existe qu'en anglais et pèse 271 Mo à télécharger une fois." },
    { id: 'sortie', type: 'choix', label: 'Format du résumé', defaut: 'txt',
      valeurs: [['txt', 'Texte brut', 'fichier .txt'], ['pdf', 'PDF', 'fichier .pdf'],
                ['docx', 'Word', 'fichier .docx']] }
  ],
  note: "Le résumé s'affiche à l'écran dès qu'il est prêt, et reste téléchargeable dans le format choisi. Si le document est un scan, la reconnaissance de caractères se lance automatiquement avant l'analyse.",
  garde: ["Les phrases telles qu'elles sont écrites dans le document",
          "L'ordre de lecture d'origine", 'Les chiffres, dates et noms propres, intacts',
          'La découpe en paragraphes'],
  perdu: ['Les tableaux, les images et les légendes', 'La mise en page et les en-têtes',
          'Les passages jugés secondaires, par construction',
          'Les notes de bas de page, noyées dans le fil du texte'],
  contexte: "Les résumeurs en ligne demandent presque tous de téléverser le document sur leurs serveurs, puis de l'envoyer à une IA tierce. Pour un compte rendu interne, un contrat ou un dossier médical, cela revient à publier le document pour gagner trois minutes.",
  usages: [
    { t: "Dégrossir un rapport", d: "Savoir en une minute si les quarante pages méritent d'être lues en entier." },
    { t: 'Préparer une réunion', d: "Extraire les points saillants d'un compte rendu avant d'y revenir." },
    { t: 'Trier un dossier', d: "Passer vingt pièces en revue sans toutes les ouvrir." }
  ],
  format: "La méthode par défaut est extractive : chaque phrase est notée d'après les mots qu'elle partage avec le reste du document, et les mieux notées sont restituées dans leur ordre d'origine. C'est volontaire — sur un document qui engage, une reformulation plausible mais inexacte est pire qu'un extrait fidèle. Le mode rédigé s'appuie sur distilbart-cnn, un modèle entraîné sur de l'anglais uniquement.",
  inverse: null,
  lies: [
    { cle: 'ocr', r: "Pour récupérer le texte intégral d'un scan plutôt que son résumé." },
    { cle: 'traduire', r: "Pour lire un document étranger avant de le résumer." },
    { cle: 'pdf-word', r: "Pour reprendre le document entier plutôt que son résumé." }
  ],
  faq: [
    { q: 'Mon document est-il envoyé à une IA ?',
      r: "Non. La méthode par défaut est un calcul statistique qui tourne dans l'onglet, sans réseau. Le mode rédigé télécharge un modèle sur votre machine et l'exécute là : ce sont les poids du modèle qui descendent, jamais votre document qui monte." },
    { q: 'Le résumé invente-t-il des phrases ?',
      r: "Pas avec la méthode par défaut : chaque phrase du résumé est présente mot pour mot dans le document. C'est la raison pour laquelle elle est proposée en premier." },
    { q: 'Ça marche sur un PDF scanné ?',
      r: "Oui. Si le document n'a aucun texte à lire, la reconnaissance de caractères se lance d'elle-même avant le résumé, en français et sur votre machine. Comptez quelques secondes de plus par page." },
    { q: 'Quelle longueur choisir ?',
      r: "« Moyen » convient à presque tout. « Court » sert à décider si un document mérite une lecture ; « Détaillé » à garder une trace exploitable sans relire l'original." }
  ]
},

'traduire': {
  slug: 'traduire-pdf', carte: 'Traduire un PDF', ico: ICO.globe, couleur: 'i-violet',
  resume: 'Français ↔ anglais, sur votre machine', titre: 'Traduction de PDF',
  h1: 'Traduire un PDF sans le téléverser', actionTexte: 'Traduire le document',
  titreSeo: 'Traduire un PDF gratuitement, sans téléverser le document',
  meta: "Traduisez un PDF du français vers l'anglais ou l'inverse, entièrement dans votre navigateur. Gratuit, sans compte, et le document n'est envoyé sur aucun serveur de traduction.",
  chapo: "Le texte du PDF est traduit phrase par phrase par un modèle de langue qui s'exécute sur votre ordinateur. Aucun service de traduction ne reçoit votre document, ni ne le conserve.",
  accept: 'application/pdf', fonction: 'traduirePdf', ia: true, tesseract: true,
  options: [
    { id: 'sens', type: 'choix', label: 'Sens de la traduction', defaut: 'fr-en',
      valeurs: [['fr-en', 'Français → anglais', ''], ['en-fr', 'Anglais → français', '']] },
    { id: 'sortie', type: 'choix', label: 'Format de sortie', defaut: 'pdf',
      valeurs: [['pdf', 'PDF', 'fichier .pdf'], ['docx', 'Word', 'fichier .docx'],
                ['txt', 'Texte brut', 'fichier .txt']] }
  ],
  note: "Au premier usage, le modèle de traduction — environ 103 Mo — se télécharge une fois, puis reste dans le cache du navigateur : les traductions suivantes démarrent immédiatement. Un document scanné passe automatiquement par la reconnaissance de caractères.",
  garde: ['Le texte intégral, dans son ordre de lecture', 'Le découpage en paragraphes',
          'Les chiffres, dates et montants', 'Les noms propres, laissés tels quels'],
  perdu: ['La mise en page, les colonnes et les tableaux', 'Les images, logos et signatures',
          'Les polices et la mise en forme', "Les en-têtes et pieds de page, mêlés au texte"],
  contexte: "Traduire un PDF en ligne suppose presque toujours de le déposer chez un prestataire, qui l'envoie lui-même à un moteur tiers. Pour un contrat, une offre commerciale ou un courrier d'avocat, le document se retrouve ainsi sur deux serveurs dont vous ignorez tout.",
  usages: [
    { t: 'Lire un contrat étranger', d: "Comprendre ce qu'on signe sans confier le contrat à un tiers." },
    { t: 'Répondre à un client anglophone', d: "Traduire un devis ou une note technique avant de l'adapter." },
    { t: 'Dépouiller une documentation', d: "Rendre lisible une notice ou une norme rédigée en anglais." }
  ],
  format: "Le moteur est Marian (opus-mt), le modèle de traduction ouvert de l'université d'Helsinki, converti au format ONNX et exécuté par transformers.js. La traduction porte sur le texte seul : le résultat est un document propre, pas une copie de la mise en page d'origine.",
  inverse: null,
  lies: [
    { cle: 'resumer', r: "Pour ne garder que l'essentiel du document traduit." },
    { cle: 'ocr', r: "Pour obtenir le texte d'un scan dans sa langue d'origine." },
    { cle: 'pdf-word', r: "Pour retravailler la traduction dans un traitement de texte." }
  ],
  faq: [
    { q: 'Mon document part-il chez Google ou DeepL ?',
      r: "Non, et il ne part nulle part. Le modèle de traduction est téléchargé sur votre machine et s'y exécute. C'est le modèle qui descend vers vous, jamais votre document qui monte." },
    { q: "Pourquoi un téléchargement de 103 Mo ?",
      r: "C'est le poids du modèle de langue lui-même. Il n'est récupéré qu'au moment où vous lancez une traduction, une seule fois : le navigateur le conserve ensuite en cache pour les fois suivantes." },
    { q: 'La mise en page est-elle conservée ?',
      r: "Non, et c'est assumé : une traduction change la longueur du texte, donc la mise en page d'origine ne tiendrait plus. Vous recevez un document propre contenant la traduction, paragraphe par paragraphe." },
    { q: 'Quelles langues sont disponibles ?',
      r: "Français vers anglais et anglais vers français. Ce sont les deux sens qui couvrent l'immense majorité des besoins, et chaque paire supplémentaire demanderait un modèle complet de plus." },
    { q: 'La qualité vaut-elle celle de DeepL ?',
      r: "Non. Un modèle qui tient dans un navigateur ne rivalise pas avec un service hébergé sur des cartes graphiques. Il est largement suffisant pour comprendre un document ; pour une traduction destinée à être publiée, faites-la relire." }
  ]
}
};
Object.assign(OUTILS, OUTILS2);

const GROUPES = [
  { titre: 'Convertir un PDF', cles: ['pdf-word', 'pdf-excel', 'pdf-ppt', 'pdf-jpg', 'pdf-png', 'ocr'] },
  { titre: 'Créer un PDF',     cles: ['word-pdf', 'excel-pdf', 'ppt-pdf', 'jpg-pdf', 'png-pdf'] },
  { titre: 'Travailler le PDF', cles: ['compresser', 'diviser', 'extraire-pages', 'supprimer-pages',
                                       'organiser', 'pivoter', 'rogner', 'numeroter', 'filigrane',
                                       'signer', 'deverrouiller', 'metadonnees'] },
  { titre: 'Comprendre un PDF', cles: ['resumer', 'traduire'] }
];

const DATA = { OUTILS, GROUPES, ICO, ETAPES_UN, SITE: 'https://voilapdf.com' };
if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
else global.OUTILS_DATA = DATA;

})(typeof globalThis !== 'undefined' ? globalThis : this);
