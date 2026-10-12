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
  titreSeo: 'Convertir un PDF en Word gratuitement, sans téléverser le fichier',
  meta: "Transformez un PDF en document Word .docx directement dans votre navigateur. Gratuit, sans inscription, sans limite de taille, et votre fichier ne quitte jamais votre ordinateur.",
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
  titreSeo: 'Convertir un PDF en PowerPoint gratuitement, sans téléversement',
  meta: "Transformez un PDF en présentation PowerPoint .pptx dans votre navigateur. Une diapositive par page, au format exact. Gratuit, sans compte, sans envoi de fichier.",
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
  titreSeo: 'Convertir un PDF en JPG gratuitement, sans téléverser le fichier',
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
  titreSeo: 'Convertir un Word en PDF gratuitement, sans téléverser le document',
  meta: "Transformez un document Word .docx en PDF directement dans votre navigateur. Gratuit, sans inscription, sans filigrane, et votre document ne part sur aucun serveur.",
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
  titreSeo: 'Convertir un Excel en PDF gratuitement, sans envoyer le classeur',
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
  titreSeo: 'Convertir un PowerPoint en PDF gratuitement, sans téléversement',
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
  meta: "Réunissez vos images JPG dans un seul PDF, directement dans votre navigateur. Gratuit, sans compte, sans filigrane, et vos photos ne quittent pas votre ordinateur.",
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
  titreSeo: 'Convertir des PNG en PDF gratuitement, sans perte et sans envoi',
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
  meta: "Réunissez plusieurs PDF en un seul fichier, directement dans votre navigateur. Gratuit, sans inscription, sans filigrane, et vos documents ne partent sur aucun serveur.",
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

const GROUPES = [
  { titre: 'Convertir un PDF', cles: ['pdf-word', 'pdf-excel', 'pdf-ppt', 'pdf-jpg', 'pdf-png'] },
  { titre: 'Créer un PDF',     cles: ['word-pdf', 'excel-pdf', 'ppt-pdf', 'jpg-pdf', 'png-pdf'] }
];

const DATA = { OUTILS, GROUPES, ICO, ETAPES_UN, SITE: 'https://editeur-pdf.netlify.app' };
if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
else global.OUTILS_DATA = DATA;

})(typeof globalThis !== 'undefined' ? globalThis : this);
