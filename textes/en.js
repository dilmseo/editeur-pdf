/* English texts. Only the wording lives here: slugs, labels and editorial copy.
   Everything functional — accepted types, option ids, which routine runs — stays
   in outils-data.js, so a language can never break a tool. */
(function (global) {

const UI = {
  langue: 'en', htmlLang: 'en', nom: 'English',
  marque: 'VoilàPDF',
  navOutils: 'Tools', navConfiance: 'Privacy', navQuestions: 'FAQ', navEditer: 'Edit a PDF',
  filAccueil: 'Home',
  pastille: 'Free · no account · nothing uploaded',
  deposer: 'Drop your file here', deposerPluriel: 'Drop your files here',
  choisir: 'or click to choose it', choisirPluriel: 'or click to choose them',
  retirer: 'Remove', convertir: 'Convert',
  traiterPluriel: n => `Process the ${n} files`,
  lecture: 'Reading the file…', traitement: 'Working…',
  pret: "All done", telecharger: 'Download', encore: 'Process another file',
  avisQuestion: 'Did this help?', avisLien: 'Leave a review',
  commentFaire: 'How it works', quandSert: 'When this really helps',
  garde: 'What is kept', perdu: 'What is not carried over',
  gardePerduTitre: 'What the conversion keeps, and what it loses',
  gardePerduIntro: 'Working inside a browser comes with limits a hosted service does not have. Here they are in plain words, so you know what to expect before you start.',
  formatTitre: 'Worth knowing about the format',
  renvoisTitre: "Not the right tool?",
  gratuitTitre: "Why it's free",
  gratuitP1: "Online converters receive your file on their servers, process it, then promise to delete it. Every document costs them computing time: that is why they charge, and why they cap file sizes.",
  gratuitP2fort: 'Here, the work happens on your own computer.',
  gratuitP2: " The page contains no server code: your document cannot be received, because it is never sent. So there is nothing to bill, nothing to cap, and nothing to delete afterwards.",
  gratuitHorsLigne: ' Cut your connection once the page has loaded — everything keeps working.',
  gratuitModele: ' One exception here: the language model, fetched once and then kept in your browser cache. It is the only network exchange on this page, and it runs that way round — your document never goes up.',
  questionsTitre: 'Frequently asked questions',
  autresTitre: 'Other tools',
  inverseTexte: (lien) => `Need the other direction? ${lien} does exactly the opposite, with the same guarantees.`,
  editeurRenvoi: 'Fix a line that is already written, even on a scanned document. This is the feature other services charge for, and the natural starting point when you need to retouch before converting.',
  /* Pages juridiques. L'editeur reste francais : son identite, son adresse et son
     SIRET ne se traduisent pas, et la CNIL reste l'autorite competente. */
  pages: {
    confidentialite: {
      slug: 'privacy', lien: 'Privacy',
      titreSeo: 'Privacy — VoilàPDF',
      meta: 'What VoilàPDF collects, and what it does not. No cookies, no analytics, and your documents never leave your computer.',
      h1: 'Privacy',
      chapo: 'This page describes exactly what happens when you use the site. It was written by rereading the code, not by copying a template.',
      maj: 'Last updated:',
      sections: [
        { t: 'In two sentences',
          note: 'Your documents are read and edited by your browser; they are sent nowhere and we cannot see them. The only data we receive is what you deliberately write to us in the contact form.' },
        { t: 'What the site does not do',
          p: ['These are not statements of intent: they can be checked in the source code, which is public.'],
          l: ['<strong>No cookies.</strong> The site sets none, neither technical nor advertising. That is why you see no consent banner: there is nothing to consent to.',
              '<strong>No analytics.</strong> No Google Analytics, no equivalent. We do not know how many people visit the site, nor what they do on it.',
              '<strong>No storage on your device.</strong> No <code>localStorage</code>, no local database. Close the tab and nothing remains.',
              '<strong>No account.</strong> Nothing to create, so no username, no password, no email address needed to use the tools.',
              '<strong>No remote fonts.</strong> Fonts are served from our own domain; no call is made to Google Fonts or any equivalent.'] },
        { t: 'Your documents',
          p: ['All twenty-six tools run entirely in your browser, in JavaScript and WebAssembly. The file you drop is read from your disk by the page itself, transformed in memory, then saved back to you. At no point does it pass through a server.',
              'This is not an internal policy we could quietly change: the site is a set of static files, with no code capable of receiving a document. You can check it yourself — open a tool, cut your connection, it keeps working.'],
          note: 'One limit worth knowing, which concerns your privacy rather than ours: when you edit or hide text in a PDF, the old text remains inside the file, visually covered. This is not redaction. Do not use it to conceal sensitive data before sending a document on.' },
        { t: 'The three exceptions, stated plainly',
          p: ['Three features, and only those, cause an exchange with the outside world. Each is flagged on the page concerned.'],
          defs: [
            ['Hosting',
             'The site is hosted by Netlify, which, like any host, records technical logs: IP address, date, page requested, browser used. These logs serve to run and secure the service. We do not read them and draw no statistics from them.'],
            ['Summarise and translate a PDF',
             'These two tools use a language model that runs on your machine. On first use the model itself is downloaded from Hugging Face, which then sees your IP address — as any site you visit does. The direction matters: the model comes down to you, your document never goes up. Later runs call nothing, as the browser keeps the model in cache.'],
            ['Contact form',
             'If you write to us, your name, email address, message and any attachment are sent to and stored at Netlify. The bot check on that page, Altcha, calls nobody: the challenge is issued by our own server, solved by your browser, then verified here. No IP address is handed to a third party.']
          ] },
        { t: 'Transfers outside the European Union',
          p: ['Netlify and Hugging Face are companies established in the United States. The technical data described above, along with messages sent through the form, may therefore be processed outside the European Union, under standard contractual clauses and the EU–US Data Privacy Framework.',
              'Avoiding exactly that transfer is why document processing stays on your machine.'] },
        { t: 'Retention',
          p: ['Messages received through the form are kept for as long as it takes to handle your request, and at most three years, after which they are deleted. You may ask for their erasure at any time.',
              'The host’s technical logs follow Netlify’s own retention policy and are outside our control.'] },
        { t: 'Your rights',
          p: ['The General Data Protection Regulation gives you rights of access, rectification, erasure, restriction, objection and portability over data concerning you. In practice this covers only the messages you may have sent us: that is the only thing we hold.',
              'To exercise these rights, write to <a href="mailto:aubryetienne@icloud.com">aubryetienne@icloud.com</a> or use the <a href="/en/contact/">contact page</a>. If our answer does not satisfy you, you may refer the matter to the French data protection authority, CNIL, 3 place de Fontenoy, 75007 Paris, or file a complaint at <a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>.'] },
        { t: 'Data controller',
          p: ['Fix72, sole trader, 6 impasse Élisabeth Vigée Lebrun, 72000 Le Mans, France — SIRET 512 645 045 00042. Full details are in the <a href="/en/legal-notice/">legal notice</a>.'] }
      ]
    },
    mentions: {
      slug: 'legal-notice', lien: 'Legal notice',
      titreSeo: 'Legal notice — VoilàPDF',
      meta: 'Publisher, publication director, host and licence of VoilàPDF.',
      h1: 'Legal notice',
      chapo: 'Information published under article 6-III of the French law on confidence in the digital economy.',
      maj: 'Last updated:',
      sections: [
        { t: 'Site publisher',
          defs: [
            ['Name', 'Fix72'],
            ['Legal form', 'Sole trader (entreprise individuelle, France)'],
            ['Registered office', '6 impasse Élisabeth Vigée Lebrun, 72000 Le Mans, France'],
            ['SIREN', '512 645 045'],
            ['SIRET', '512 645 045 00042'],
            ['Telephone', '<a href="tel:+33751133769">+33 7 51 13 37 69</a>'],
            ['Email', '<a href="mailto:aubryetienne@icloud.com">aubryetienne@icloud.com</a>'],
            ['Contact', '<a href="/en/contact/">Contact form</a>']
          ] },
        { t: 'Publication director',
          p: ['Étienne Aubry, as the person responsible for the sole trader Fix72.'] },
        { t: 'Host',
          defs: [
            ['Company', 'Netlify, Inc.'],
            ['Address', '101 2nd Street, San Francisco, CA 94105-2239, United States'],
            ['Website', '<a href="https://www.netlify.com" target="_blank" rel="noopener">netlify.com</a>']
          ],
          p: ['Netlify publishes no public telephone number; its contact details are on its own site.'] },
        { t: 'Licence and source code',
          p: ['VoilàPDF is free software released under the <a href="https://github.com/dilmseo/editeur-pdf/blob/main/LICENSE" target="_blank" rel="noopener">GNU AGPL version 3</a>. The complete source code is on <a href="https://github.com/dilmseo/editeur-pdf" target="_blank" rel="noopener">GitHub</a>.',
              'You may use, study, modify and redistribute it, including commercially. The condition is article 13 of that licence: if you run a modified version reachable over a network, you must offer its source code to that version’s users.',
              'Bundled third-party libraries keep their own licences: pdf.js and tesseract.js under Apache 2.0, pdf-lib and fflate under MIT, transformers.js under Apache 2.0. Details are in the repository <a href="https://github.com/dilmseo/editeur-pdf#readme" target="_blank" rel="noopener">README</a>.'] },
        { t: 'Limits of the service',
          p: ['The tools are provided free of charge and without warranty, in line with the licence. Every tool page states precisely what the conversion keeps and what it loses; those limits are real and documented, and worth reading before you process an important document.',
              'Two points bear repeating here. Editing text covers the old content without removing it from the file: that is not redaction. The handwritten signature offered is the digital equivalent of initialling a page, not a qualified electronic signature under the eIDAS regulation.',
              'Always keep a copy of your original documents.'] },
        { t: 'Personal data',
          p: ['Data processing is described on the <a href="/en/privacy/">Privacy</a> page. In short: no cookies, no analytics, and your documents do not leave your computer.'] },
        { t: 'Links and reporting',
          p: ['The site links to outside resources whose content we do not control. To report unlawful content, an error or a malfunction, use the <a href="/en/contact/">contact page</a>.'] }
      ]
    }
  },

  contact: {
    slug: 'contact', lien: 'Write to us',
    titreSeo: 'Contact — VoilàPDF',
    meta: 'Report a fault, suggest a tool or ask a question about VoilàPDF. An answer within a few days, from a person.',
    h1: 'Write to us',
    chapo: 'A tool misbehaving, a PDF it refuses, an idea for a tool that is missing: write in. This is the only page on the site that sends anything to a server, and it says so.',
    nom: 'Your name', nomEx: 'First and last name',
    email: 'Your email address', emailEx: 'so we can reply',
    sujet: 'Subject',
    sujets: [['bug', 'A fault to report'], ['outil', 'An idea for a tool'],
             ['question', 'A question'], ['autre', 'Something else']],
    message: 'Your message',
    messageEx: 'Describe what you did, what you expected, and what happened instead.',
    fichier: 'Attach a file',
    fichierAide: 'Optional, 3 MB maximum (PDF, image or text). Note: unlike the files you process with the tools, this one really is sent to a server. Do not put anything confidential in it.',
    fichierChoisir: 'Choose a file', fichierRetirer: 'Remove',
    envoyer: 'Send the message', envoi: 'Sending…',
    merciTitre: 'Message sent',
    merci: 'Thank you. We read everything and answer within a few days, at the address you gave.',
    encore: 'Write another message',
    avertTitre: 'What happens to your message',
    avert: 'Messages land in a mailbox hosted by Netlify and serve only to answer you: no mailing list, no resale, no analytics. The form is kept free of bots by Altcha, a check that runs on this page and on our own server without calling any third party: your browser solves a small computation, that is all. The rest of VoilàPDF keeps working without sending anything: open any tool, cut your connection, it still runs.',
    altcha: { label: 'I am not a robot', verifying: 'Verifying…',
              waitAlert: 'Verifying, one moment…', verified: 'Verified',
              error: 'Verification failed', expired: 'Verification expired',
              footer: '' },
    erreurs: {
      champs: 'Name and message are required.',
      email: 'That email address does not look valid.',
      jeton: 'Please wait: the bot check has not finished.',
      refus: 'The bot check failed. Reload the page and try again.',
      taille: 'The file is larger than 3 MB.',
      type: 'That file type is not accepted.',
      reseau: 'Sending failed. Check your connection and try again.',
      config: 'The form is temporarily unavailable.'
    }
  },
  ogAlt: 'VoilàPDF: the editor open on a letter, a date being corrected',
  piedPhrase: 'Built with pdf.js, pdf-lib, tesseract.js and fflate — your files stay in your browser.',
  codeSource: 'Source code',
  plan: { autres: 'More tools', editeur: 'Edit the text in a PDF', fusion: 'Merge PDFs' },
  etapes: multiple => [
    `Drop your file${multiple ? 's' : ''} on the page, or click to pick ${multiple ? 'them' : 'it'} from your folders.`,
    'Start the job. It runs inside your browser: nothing is sent to a server.',
    'Download the result. No account, no watermark, no queue.'
  ],
  etapesNoms: ['Open the file', 'Run the job', 'Download the result'],
  /* interface de l'éditeur */
  app: {
    accueil: 'Home', ouvrir: 'Open another PDF', editer: 'Edit', ajouter: 'Add',
    masquer: 'Redact', reperes: 'Guides', ocr: 'OCR', arreter: 'Stop',
    annulerTout: 'Undo everything', enregistrer: 'Save the PDF', generation: 'Building…',
    aucunFichier: 'no file', selection: 'Selection',
    aide: "Click a block of text in the page to edit it.",
    aideEditer: 'edits the existing text (the original is covered).',
    aideAjouter: 'places new text where you click.',
    aideMasquer: 'drag to cover an area.',
    aideTouches: 'to leave · <kbd>Delete</kbd> removes the selected item',
    texte: 'Text', police: 'Font', style: 'Style', taille: 'Size',
    couleur: 'Colour', fond: 'Background', ajuster: 'Fit', retablir: 'Reset',
    supprimer: 'Delete', normal: 'Regular', gras: 'Bold', italique: 'Italic',
    grasItalique: 'Bold italic', page: 'Page', modification: 'change', modifications: 'changes',
    enregistre: 'PDF saved', continuer: 'Keep editing', nouveau: 'Edit another file',
    scanEnCours: 'Scanned page — reading the text…',
    scanAucun: 'No text recognised on this page. Use “Redact” then “Add”.',
    scanProposer: 'No selectable text: this page is an image. Click “OCR” to make it editable',
    scanServeur: ' — you need to run “Editeur PDF.cmd”.',
    ocrPage: (n, rang, pc) => `Reading text — page ${n}${rang} — ${pc} %`,
    ocrFini: n => `${n} line(s) recognised — click them to edit.`,
    ocrRien: 'No text could be recognised on these pages.',
    ocrArret: n => `Reading stopped — ${n} line(s) obtained.`,
    ocrArretEnCours: 'Stopping after the current page…',
    ocrRienAFaire: 'Nothing to recognise: these pages already contain text.',
    pasPdf: 'That file is not a PDF. Pick the tool that matches its format.',
    chargees: n => `${n} page(s) loaded`,
    confirmQuitter: n => `${n} unsaved change(s). Go back to the home page?`,
    tientDeja: 'The text already fits the original width.',
    ajuste: t => `Size reduced to ${t} pt`,
    annulees: 'Changes undone',
    erreur: 'Error: ',
    largeur: (a, b) => `width ${a} pt / ${b} pt originally`,
    debordement: ' — overflowing, “Fit” shrinks it',
    policeOrigine: 'original font'
  },
  /* page d'accueil */
  accueil: {
    titreSeo: 'Free PDF editor: edit the text online — VoilàPDF',
    meta: 'Click a line, rewrite it, save. Even on a scanned document. Free, no account, and your file never leaves your computer.',
    badge: 'No file sent to any server',
    h1a: 'Fix the text', h1b: 'already written', h1c: 'in your PDFs.',
    accroche: 'Not a note stuck on top: you click a line of the document, you rewrite it, you save.',
    accrocheFort: 'Even on a scan.',
    accrocheFin: " It is the feature other services charge for.",
    demoAvant: 'Meeting on', demoAvantDate: '12 October',
    demoApres: 'Meeting on', demoApresDate: '19 October',
    deposer: 'Drop your PDF', deposerSous: 'it stays on your computer',
    bouton: 'Choose a file',
    gage1: 'No sign-up', gage2: 'No watermark', gage3: 'No size limit',
    legende: 'The date was rewritten inside the document, exactly where it was.',
    ctaOutils: 'See all 24 tools',
    carteT: 'Pick your tool', carteS: 'all 24 run inside your browser',
    noteEditeur: 'The 24 tools below are in English. The text editor itself is shown here with its French interface — an English version is on the way.',
    preuve1: 'Everything runs in your browser.',
    preuve2: 'Cut your connection after loading: it keeps working.',
    preuve3a: 'Source code', preuve3b: 'public and verifiable',
    surtitreEditeur: 'The editor', titreEditeur: 'Four moves, one screen',
    introEditeur: 'No menu to explore, no option to guess: open the document, click what is wrong, save.',
    f1t: 'Fix the text', f1d: 'Every line of the document becomes a clickable block. You rewrite it in exactly the same place, with its font and colour found automatically.',
    f2t: 'Scanned documents too', f2d: 'If the page is an image, character recognition starts on its own when the file opens, and makes every line editable.',
    f3t: 'Add a note', f3d: 'A date, a reference, a typed signature: place the text where you click, with the font, size and colour you want.',
    f4t: 'Hide an area', f4d: 'Cover an amount or an address by dragging the mouse. The background colour is read off the page, so the rectangle blends in.',
    surtitreOutils: 'The toolbox', titreOutils: 'And everything else, in one place',
    introOutils: 'Convert both ways, assemble, extract. Every tool has its own page, with what it keeps and what it drops stated before you begin.',
    phare1t: 'Edit the text in a PDF', phare1d: 'Fix a line that is already written, even on a scanned document. This is the feature others charge for.',
    phare2t: 'Merge PDFs', phare2d: 'Several documents end to end, in the order you choose, with no loss of quality.',
    groupes: ['Convert a PDF', 'Create a PDF', 'Work on the PDF', 'Repair and secure', 'Understand a PDF'],
    badgeA: 'Open source, made with ', badgeB: ' in France',
    outilsCompte: 'tools',
    surtitreConfiance: 'What really changes', titreConfiance: 'The paywall is editing the text',
    introConfiance: 'Online editors happily let you <em>add</em> text on top of the document. But fixing a line that is already written — the very thing you came for — almost always requires a subscription. And your file left for their servers before you even noticed.',
    euxTitre: 'The usual services', nousTitre: 'Here',
    eux: ['<b>Editing existing text: paid</b>', 'Scanned document recognition: paid too',
          'Your file leaves for a remote server', 'Size capped, often at 100 MB',
          'Account required, or a watermark on the result'],
    nous: ['<b>Editing existing text: free</b>', 'Scan recognition included, no extra charge',
           'The file never leaves your browser', 'No size or count limit',
           'No account, no watermark; source code public'],
    surtitreQuestions: 'Before you start', titreQuestions: 'The questions we get',
    faq: [
      { q: 'What does it cost?',
        r: "Nothing, and there is nothing to buy: no paid tier, no limited trial, no watermark. That includes fixing existing text and reading scanned documents, which online services almost all keep for their paid plans. The reason is simple: for them every document burns server time. Here your own computer does the work, so there is nothing to bill." },
      { q: 'Is my file really private?',
        r: 'Yes. The PDF is opened and modified by your browser; no data is sent anywhere. The site contains no server code at all: it could not receive your file even if it wanted to. You can check by cutting your connection once the page has loaded — everything keeps working.' },
      { q: 'Is hidden text really erased?',
        r: 'No, and that matters: replaced text is covered visually but stays inside the file — a copy and paste can bring it back. To truly remove sensitive data, redact the area then reprint the result as a PDF (Print → Save as PDF): the old text is then gone for good.' },
      { q: 'Is the original font kept?',
        r: 'The text is rewritten in a close standard font — Helvetica, Times or Courier — picked automatically from the document, with bold detected by comparing the measured width against the font metrics. On a common typeface the result is very close; on a distinctive one the difference shows. The right-hand panel lets you correct it by hand.' },
      { q: 'Is there a size or page limit?',
        r: 'None imposed. The only constraint is your computer memory, and pages are rendered as you scroll so a thick document stays smooth.' },
      { q: 'Can I use it offline?',
        r: 'Yes. Once the page has loaded you can cut your internet connection. The code can also be downloaded from the public repository for fully local use, including the small development server needed for character recognition.' }
    ],
    finalTitre: 'Your PDF is waiting',
    finalIntro: 'Drop it, fix what is wrong, take the file back. Nothing else to do.',
    finalBouton: 'Edit a PDF now',
    finalSous: 'Free, no account, and your document never leaves your computer.',
    rappelA: 'A PDF to fix?', rappelB: 'It will not leave your computer.',
    rappelBouton: 'Open the editor',
    piedPitch: 'Edit, convert and assemble PDFs without uploading anything. Twenty-six tools, no account, no queue, no file left lying on a server.',
    sceauTitre: 'Nothing is uploaded',
    sceauTexte: 'All processing happens in your browser, including the recognition of scanned documents.',
    piedProjet: 'The project', piedEditeur: 'The editor',
    piedConfidentialite: 'Privacy', piedQuestions: 'FAQ',
    piedFin: 'No tracking, no cookies, no account.'
  }
};

const OUTILS = {

'pdf-word': {
  slug: 'pdf-to-word', carte: 'PDF → Word', resume: 'A .docx whose text stays editable',
  titre: 'PDF to Word', h1: 'Convert a PDF to Word',
  titreSeo: 'PDF to Word, free and with no upload',
  meta: 'Turn a PDF into a Word .docx inside your browser. Free, no sign-up, no size limit, and your file never reaches any server.',
  chapo: 'Get the text of a PDF back into a Word document you can rework, correct and reprint. The conversion happens entirely on your machine: your document is never sent anywhere.',
  note: 'Text, sizes and headings are kept, each PDF page becoming a page of the document. The layout is simplified: no columns, no boxes, no images.',
  garde: ['The full text, page by page', 'The size of every line, in points',
          'Headings, detected by their larger body size', 'The difference between a serif and a sans-serif face'],
  perdu: ['Columns and boxes, flattened to full width', 'Images and logos',
          'Tables, rendered line by line', 'Headers and footers, treated as ordinary text'],
  contexte: 'A PDF reads everywhere but does not reopen: that is exactly what it was invented for. When a paragraph needs fixing, a price updating or a text reusing elsewhere, going back through Word is the shortest route.',
  usages: [
    { t: 'Reuse text you received as a PDF', d: 'A quote, a report, terms and conditions: recover the words and rework them without retyping.' },
    { t: 'Fix a document whose source is gone', d: 'The original Word file has vanished? The PDF stands in: convert, correct, export again.' },
    { t: 'Translate or have it proofread', d: 'A .docx opens in a word processor, a spell-checker or a translation tool, where a PDF resists.' }
  ],
  format: 'The .docx has been Word\'s format since 2007. Behind the extension sits a compressed archive of XML files: that is what makes it possible to build one entirely in a browser, with no Word installed. It also opens in LibreOffice Writer, Pages and Google Docs.',
  faq: [
    { q: 'Will the text really be editable in Word?',
      r: 'Yes. The document you get contains real text, not an image: you can correct it, restyle it and save it like any other .docx.' },
    { q: 'What if my PDF is a scan?',
      r: 'A scan contains no text at all, only an image: the conversion would come out empty. Run it through the editor first, whose character recognition turns the page into usable text, then save that PDF before converting it.' },
    { q: 'Why is the layout not identical?',
      r: 'A PDF describes characters placed at coordinates, not paragraphs. Rebuilding an exact layout needs heavy models running on servers. The choice here is to restore the content faithfully rather than imitate the form approximately.' }
  ]
},

'pdf-excel': {
  slug: 'pdf-to-excel', carte: 'PDF → Excel', resume: 'Tables as a spreadsheet',
  titre: 'PDF to Excel', h1: 'Convert a PDF to Excel',
  titreSeo: 'PDF to Excel, free and with nothing uploaded',
  meta: 'Pull the tables out of a PDF into an Excel .xlsx workbook, right in your browser. Free, no account, no size limit, no upload.',
  chapo: 'Recover a table locked inside a PDF as a spreadsheet, ready to sort and recalculate. Columns are found from the way the text lines up on the page.',
  note: 'Columns are inferred from text alignment, one sheet per page. Excellent on a real table, approximate on free-running text.',
  garde: ['Each page becomes a sheet of the workbook', 'Columns, inferred from where the text starts',
          'Rows, grouped by shared baseline', 'Values exactly as written, accents included'],
  perdu: ['Formulas: a PDF only holds results', 'Merged cells and borders',
          'Colours and conditional formatting', 'Badly aligned columns, which may end up shifted'],
  contexte: 'Numbers often end up trapped in a PDF: a bank statement, a supplier invoice, an export from a business tool. Retyping them is slow and error-prone; getting them back in columns means sorting, summing and comparing straight away.',
  usages: [
    { t: 'Use a statement or an invoice', d: 'Recover the lines and amounts to reconcile them with your accounts.' },
    { t: 'Reopen an export that only offers PDF', d: 'Many business tools export nothing else: this tool reopens the door they closed.' },
    { t: 'Compare two tables', d: 'Once both documents are spreadsheets, a simple sort exposes the differences.' }
  ],
  format: 'The .xlsx has been Excel\'s format since 2007, also an archive of XML files. The workbook produced here holds plain text with no styling: that is deliberate, values matter more than decoration when the point is to recalculate.',
  faq: [
    { q: 'My table comes out shifted, what can I do?',
      r: 'Column detection relies on horizontal alignment. If the PDF aligns its columns loosely, or mixes a table with paragraphs, the result drifts. Convert just the page concerned and reassemble the columns by hand in Excel.' },
    { q: 'Are the numbers real numbers?',
      r: 'They are written exactly as they appear in the PDF, text and all: thousand separators, currency symbols, percentages. Excel\'s paste-special or text-to-columns then turns them into values you can compute with.' },
    { q: 'How many pages can I convert?',
      r: 'As many as your computer can handle: no limit is imposed, since nothing is sent to a server. Each page becomes its own sheet.' }
  ]
},

'pdf-ppt': {
  slug: 'pdf-to-powerpoint', carte: 'PDF → PowerPoint', resume: 'One slide per page',
  titre: 'PDF to PowerPoint', h1: 'Convert a PDF to PowerPoint',
  titreSeo: 'PDF to PowerPoint, free and with no upload',
  meta: 'Turn a PDF into a PowerPoint .pptx in your browser: one slide per page, at the exact size. Free, no account, nothing sent anywhere.',
  chapo: 'Reuse a PDF as a presentation deck: every page becomes a slide at the exact size of the page, ready to project or annotate.',
  note: 'Each page becomes a slide at the exact page size, filled with its image. The rendering is faithful, but the text on it is not editable.',
  garde: ['The exact rendering of every page, fonts and images included',
          'The slide size, matched to the page', 'The page order', 'Colours and print quality'],
  perdu: ['Editable text: every slide is an image', 'Text boxes and bullet points',
          'Animations and transitions', 'Presenter notes'],
  contexte: 'Sometimes only the PDF of a deck survives, or a document built for print has to go on screen. Turning each page into a slide avoids rebuilding everything, and guarantees that what shows matches the original exactly.',
  usages: [
    { t: 'Project a document built for paper', d: 'A report, a brochure or a plan goes on screen without a redesign.' },
    { t: 'Recover a deck whose .pptx is lost', d: 'The PDF that was circulated becomes a support you can annotate and extend again.' },
    { t: 'Add slides to an existing document', d: 'The file you get is an ordinary .pptx: insert your own slides into it.' }
  ],
  format: 'The .pptx has been PowerPoint\'s format since 2007. Each slide is described in XML with its shapes and images. The file produced here holds one image per slide: that is what guarantees a rendering identical to the PDF, font for font.',
  faq: [
    { q: 'Why is the text not editable?',
      r: 'A PDF page has no slide structure: no title, no content placeholder. Transposing its image full-frame is the only way to stay faithful. If you want editable text, convert the PDF to Word instead.' },
    { q: 'Will it look sharp on a projector?',
      r: 'Pages are rendered at close to twice screen resolution, which stays crisp both projected and printed. The file is naturally heavier than the original PDF.' },
    { q: 'Can I add my own slides afterwards?',
      r: 'Yes. It is a plain .pptx: PowerPoint, LibreOffice Impress and Google Slides all open it and let you insert whatever you like.' }
  ]
},

'pdf-jpg': {
  slug: 'pdf-to-jpg', carte: 'PDF → JPG', resume: 'One image per page',
  titre: 'PDF to JPG', h1: 'Convert a PDF to JPG',
  titreSeo: 'PDF to JPG, free and with nothing uploaded',
  meta: 'Turn every page of a PDF into a JPG image, right in your browser. Free, no sign-up, no watermark, nothing sent to a server.',
  chapo: 'Get one image per page, ready to drop into an email, a document or a post. The rendering is the PDF\'s own, at twice screen size.',
  note: 'Faithful rendering at twice screen size. From two pages onwards you receive a ZIP archive holding every image.',
  garde: ['The exact rendering of the page, fonts and images included',
          'Colours and fine detail', 'Page order, numbered in the file name',
          'Twice the resolution of your screen'],
  perdu: ['Selectable text: an image cannot be copied', 'Transparency, which JPG does not support',
          'Clickable links and bookmarks', 'Some fine detail, JPG being a lossy format'],
  contexte: 'An image fits where a PDF will not: in a message, a post, a slide or a web page. Converting pages to JPG gives light files you can use immediately, at the cost of compression most eyes never notice.',
  usages: [
    { t: 'Illustrate a message or a post', d: 'A PDF page becomes an image your reader sees without opening anything.' },
    { t: 'Upload where PDFs are refused', d: 'Plenty of online forms accept images only.' },
    { t: 'Keep a light preview', d: 'A JPG weighs a fraction of a PNG, handy for archiving previews.' }
  ],
  format: 'JPG compresses by discarding detail the eye struggles to see. Excellent for photographs, it is less comfortable on crisp text and flat colour, where it sometimes leaves a faint halo around letters.',
  faq: [
    { q: 'JPG or PNG, which should I pick?',
      r: 'On a document full of text, PNG stays sharper. JPG gives much lighter files and suits pages containing photographs.' },
    { q: 'How do I get several pages?',
      r: 'From two pages onwards the images are bundled into a ZIP archive your system opens with a double click. Each image carries its page number.' },
    { q: 'Is the quality good enough to print?',
      r: 'Pages are rendered at roughly 144 dots per inch, fine for screen use and everyday printing. For professional printing, print the PDF directly.' }
  ]
},

'pdf-png': {
  slug: 'pdf-to-png', carte: 'PDF → PNG', resume: 'One image per page, lossless',
  titre: 'PDF to PNG', h1: 'Convert a PDF to PNG',
  titreSeo: 'PDF to PNG, free, lossless and with no upload',
  meta: 'Turn every page of a PDF into a lossless PNG image inside your browser. Free, no account, no watermark, nothing uploaded.',
  chapo: 'Get one image per page with no lossy compression: text stays crisp and flat colours do not bleed. Ideal for a deed or an invoice.',
  note: 'Faithful rendering with no lossy compression. From two pages onwards you receive a ZIP archive.',
  garde: ['The exact rendering of the page, with no loss', 'Crisp text and hairlines',
          'Page order, numbered in the file name', 'Twice the resolution of your screen'],
  perdu: ['Selectable text: an image cannot be copied', 'Clickable links and bookmarks',
          'Lightness: a PNG weighs more than a JPG', 'Form fields, flattened into the image'],
  contexte: 'When sharpness matters — a deed, an invoice, a drawing, a capture meant to be enlarged — PNG is the right pick: it throws nothing away. Hairlines and small type stay exactly as the PDF draws them.',
  usages: [
    { t: 'Archive supporting evidence', d: 'No loss, so no degradation from one copy to the next.' },
    { t: 'Zoom into a detail', d: 'A stamp, a signature or small print stays readable when enlarged.' },
    { t: 'Prepare a visual for a document', d: 'The text stays crisp once the image sits in a report or a deck.' }
  ],
  format: 'PNG compresses without losing anything: the file is heavier than a JPG, but the rebuilt image matches the original pixel for pixel. It is the format to prefer wherever there is text or flat colour.',
  faq: [
    { q: 'Why is PNG heavier than JPG?',
      r: 'PNG discards no information, where JPG drops some to save space. That is exactly what makes PNG sharper on text, at the price of a bigger file.' },
    { q: 'Can I convert a hundred-page document?',
      r: 'Yes, no limit is imposed. Just allow some time and memory: pages are rendered one by one in your browser.' },
    { q: 'Do the images have a transparent background?',
      r: 'No: the white of the page is kept, as it would print. That avoids unpleasant surprises when the image lands on a coloured background.' }
  ]
},

'word-pdf': {
  slug: 'word-to-pdf', carte: 'Word → PDF', resume: 'From a .docx',
  titre: 'Word to PDF', h1: 'Convert a Word document to PDF',
  titreSeo: 'Word to PDF, free and with no upload or account',
  meta: 'Turn a .docx into a PDF right in your browser. Free, no sign-up, no watermark, and your document reaches no server.',
  chapo: 'Get a PDF from a Word document without opening Word and without handing your text to an online service. Handy for a letter, a quote or a contract.',
  note: 'Text, bold, italic, sizes, alignments, simple tables and images are carried over. Advanced styles, headers and columns are not.',
  garde: ['The text, with bold, italic and sizes', 'Left, centre and right alignment',
          'Simple tables, redrawn with their borders', 'Images placed in the flow of the text'],
  perdu: ['Headers, footers and page numbers', 'Columns, frames and text boxes',
          'The exact fonts, replaced by standard equivalents', 'Footnotes and the table of contents'],
  contexte: 'Sending a .docx means accepting that the layout shifts from one computer to the next, and that the recipient can change the words. A PDF freezes both: that is why quotes, contracts and applications travel in this form.',
  usages: [
    { t: 'Send a quote or a contract', d: 'The document arrives exactly as you designed it, with no pagination drift.' },
    { t: 'Submit an application', d: 'Most hiring platforms explicitly ask for a PDF.' },
    { t: 'Archive a final version', d: 'A PDF still reads in ten years without depending on your Word version.' }
  ],
  format: 'A PDF describes a page as a fixed surface: positions, fonts and images are frozen. That is what makes it render identically everywhere, and what makes it hard to edit — so keep your .docx as the source.',
  faq: [
    { q: 'Are my document fonts respected?',
      r: 'The text is rewritten in the PDF standard fonts: a sans-serif close to Helvetica, a serif close to Times, and a monospace. The overall look is respected, the exact letterforms are not.' },
    { q: 'Does the old .doc format work?',
      r: 'No, only .docx. The older .doc is a closed binary format a browser cannot read reliably. Save it again as .docx from Word or LibreOffice.' },
    { q: 'My document is sixty pages, is that a problem?',
      r: 'No. Text is laid out as it flows and pages are added automatically. No size limit is imposed, since the work happens on your machine.' }
  ]
},

'excel-pdf': {
  slug: 'excel-to-pdf', carte: 'Excel → PDF', resume: 'From an .xlsx',
  titre: 'Excel to PDF', h1: 'Convert an Excel workbook to PDF',
  titreSeo: 'Excel to PDF, free and without sharing the workbook',
  meta: 'Turn an .xlsx workbook into a readable PDF inside your browser. Free, no account, no watermark, and your data is never uploaded.',
  chapo: 'Get a clean PDF from a workbook, sheet by sheet, without opening Excel. Useful to pass on a table without risking changes to it.',
  note: 'A readable grid per sheet, in A4 landscape, up to twelve columns per page. Formulas appear as last saved, with no conditional formatting.',
  garde: ['Every sheet, with its name as a title', 'Values, including formula results',
          'The first row highlighted as a header', 'A readable grid, in A4 landscape'],
  perdu: ['The formulas themselves, only results are carried over',
          'Colours, styles and conditional formatting', 'Charts and images',
          'Beyond twelve columns, the following ones are not drawn'],
  contexte: 'Passing on a workbook means passing on its formulas, its hidden sheets and the ability to change everything. Freezing it as a PDF settles the matter: the reader sees the figures you decided on, laid out the way you chose.',
  usages: [
    { t: 'Circulate a dashboard', d: 'The figures stay those of the day you sent it, with no recalculation at the other end.' },
    { t: 'Attach a table to a file', d: 'A PDF prints and archives alongside the rest of the paperwork.' },
    { t: 'Show without giving the formulas', d: 'Only the results are visible: the machinery stays with you.' }
  ],
  format: 'The PDF produced here is a readable grid, designed for A4 landscape printing. Each sheet of the workbook gets its own section, with its name as a heading and its first row highlighted.',
  faq: [
    { q: 'Why only twelve columns?',
      r: 'Beyond that, cells become too narrow to stay readable on an A4 page. If your table is wider, hide the unneeded columns in Excel before converting, or split it across two sheets.' },
    { q: 'Do my formula results show up?',
      r: 'Yes, exactly as Excel last saved them. Formulas are not recalculated here, so remember to save your workbook after changing it.' },
    { q: 'What about the old .xls format?',
      r: 'Only .xlsx is handled. The older .xls is a binary format a browser cannot read reliably: save your workbook again as .xlsx.' }
  ]
},

'ppt-pdf': {
  slug: 'powerpoint-to-pdf', carte: 'PowerPoint → PDF', resume: 'From a .pptx',
  titre: 'PowerPoint to PDF', h1: 'Convert a PowerPoint deck to PDF',
  titreSeo: 'PowerPoint to PDF, free and with no upload',
  meta: 'Turn a .pptx presentation into a PDF inside your browser. Free, no account, no watermark, nothing sent to a server.',
  chapo: 'Get a PDF from a deck, to circulate or print it without the layout shifting from one machine to another.',
  note: 'Text is placed back where it sits in the slide, with its size, and images are carried over. Animations, gradients and decorative shapes are not.',
  garde: ['One PDF page per slide, at the original size',
          'Text in position, with its size and weight', 'Images placed in the slides', 'The slide order'],
  perdu: ['Animations and transitions', 'Shapes, arrows and decorative gradients',
          'Backgrounds inherited from the master', 'Presenter notes'],
  contexte: 'A deck sent as is rarely opens identically: missing fonts, a different version, animations that shift everything. As a PDF it reads anywhere, reads offline, and prints as a meeting handout.',
  usages: [
    { t: 'Send a handout after a meeting', d: 'The recipient gets exactly what was projected.' },
    { t: 'Print a set of slides', d: 'One page per slide, ready to hand out.' },
    { t: 'Circulate without allowing edits', d: 'The content is frozen, text can no longer be moved.' }
  ],
  format: 'The PDF keeps the exact format of your slides, whether 16:9 or 4:3. Each slide becomes a page, in presentation order.',
  faq: [
    { q: 'My background has disappeared, why?',
      r: 'Decor inherited from the slide master is not carried over: only what belongs to each slide is. If the background matters, export your slides as images from PowerPoint and use the JPG to PDF tool.' },
    { q: 'Are my presentation fonts kept?',
      r: 'Text is rewritten in the PDF standard fonts. Size and position are respected, the exact letterforms are not: a strongly styled title will render differently.' },
    { q: 'What about the old .ppt format?',
      r: 'Only .pptx is handled. Save your presentation again as .pptx from PowerPoint, LibreOffice Impress or Google Slides.' }
  ]
},

'jpg-pdf': {
  slug: 'jpg-to-pdf', carte: 'JPG → PDF', resume: 'One page per image',
  titre: 'JPG to PDF', h1: 'Convert JPG images to PDF',
  titreSeo: 'JPG to PDF, free and without uploading your photos',
  meta: 'Gather your JPG images into a single PDF inside your browser. Free, no account, no watermark, and your photos stay with you.',
  chapo: 'Gather photos or photographed pages into one PDF you can send in a single go. Every image becomes a page at its exact size.',
  note: 'Every image becomes a page at its exact size, with no recompression. You can drop several: they follow the order you choose.',
  garde: ['Every image at its original size and resolution',
          'The order in which you add the files', 'The quality: no recompression is applied',
          'The exact colours of your photographs'],
  perdu: ['Capture metadata', 'The automatic orientation some cameras rely on',
          'Nothing else: the image is embedded as it is'],
  contexte: 'Sending twelve separate photos means twelve attachments and a lost recipient. Gathering them into a PDF gives one paginated document that prints in one go — the normal way to pass on photographed evidence.',
  usages: [
    { t: 'Send photographed evidence', d: 'ID, invoices, a damage report: one file instead of a pile.' },
    { t: 'Build a submission', d: 'Images follow the order you choose, like the pages of a report.' },
    { t: 'Archive a series of photographs', d: 'A PDF is easier to leaf through, name and file than a folder of images.' }
  ],
  format: 'JPG files are embedded exactly as they are, without recompression: the original quality is preserved and the PDF weighs roughly the sum of the images.',
  faq: [
    { q: 'Can I choose the page order?',
      r: 'Images follow the order in which you add them. Drop them one at a time to control that order, or remove one from the list with a click if you got it wrong.' },
    { q: 'Are my photos recompressed?',
      r: 'No. JPG files are embedded as they are: no quality loss, no file bloat.' },
    { q: 'Can I mix JPG and PNG?',
      r: 'Yes: both formats are accepted here as on the PNG tool. Every image becomes a page, whatever its format.' }
  ]
},

'png-pdf': {
  slug: 'png-to-pdf', carte: 'PNG → PDF', resume: 'One page per image',
  titre: 'PNG to PDF', h1: 'Convert PNG images to PDF',
  titreSeo: 'PNG to PDF, free, lossless and with no upload',
  meta: 'Gather your PNG images into a single PDF, lossless and in your browser. Free, no account, no watermark, nothing uploaded.',
  chapo: 'Gather screenshots or PNG visuals into one PDF with no loss of quality. Every image becomes a page at its exact size.',
  note: 'Every image becomes a page at its exact size, with no loss at all. You can drop several at once.',
  garde: ['Every image at its original size and resolution',
          'Total sharpness: no lossy compression', 'The order in which you add the files',
          'Flat colours, with no bleeding'],
  perdu: ['Transparency, replaced by the page background',
          'Nothing else: the image is embedded as it is'],
  contexte: 'Screenshots pile up quickly and travel badly. Gathering them into a PDF gives a clean, ordered document where every capture stays as sharp as on screen — useful for a walkthrough, a procedure or a bug report.',
  usages: [
    { t: 'Document a procedure', d: 'Every captured step becomes a page, in order.' },
    { t: 'Report a problem', d: 'The offending screens go out in one send, readable without zooming.' },
    { t: 'Assemble visuals', d: 'Logos, diagrams and charts keep their flat colours clean.' }
  ],
  format: 'PNG is embedded without recompression: a screenshot stays readable letter by letter, where a trip through JPG would leave a halo around the characters.',
  faq: [
    { q: 'Is the transparency of my PNGs kept?',
      r: 'A PDF page has no transparent background: translucent areas land on the white of the page. If transparency matters, flatten the image onto the background you want before converting.' },
    { q: 'How many images can I gather?',
      r: 'As many as you like: no limit is imposed. The PDF simply weighs the sum of the images.' },
    { q: 'Do screenshots stay sharp?',
      r: 'Perfectly: the PNG is embedded without recompression, so the text of a capture stays as legible as in the original image.' }
  ]
},

'fusion': {
  slug: 'merge-pdf', carte: 'Merge PDFs', resume: 'Several files into one',
  titre: 'Merge PDFs', h1: 'Merge several PDFs into one',
  titreSeo: 'Merge PDF files for free, with no upload',
  meta: 'Combine several PDFs into a single file inside your browser. Free, no sign-up, no watermark, and your documents reach no server.',
  chapo: 'Put several documents end to end in the order you choose. Pages keep their original quality: nothing is recompressed.',
  note: 'Documents are placed end to end in the order you add them. Nothing is recompressed: pages keep their original quality.',
  garde: ['Every page of every document, in the order you choose',
          'Exact quality: no page is re-encoded', 'Selectable text and embedded fonts',
          'Different page sizes, kept as they are'],
  perdu: ['Bookmarks and the table of contents of each file',
          'Filled form fields', 'Electronic signatures, which become void'],
  contexte: 'A complete submission rarely starts as one file: a form, two supporting documents, a covering letter. Putting them end to end avoids multiple sends, forgotten items and recipients opening things out of order.',
  usages: [
    { t: 'Build an administrative file', d: 'Form, attachments and covering letter in a single send.' },
    { t: 'Gather chapters', d: 'Each part written separately takes its place in the right order.' },
    { t: 'Archive an exchange', d: 'The documents of one matter file under a single name.' }
  ],
  format: 'Pages are copied exactly as they are, with no re-encoding: text stays selectable, embedded fonts stay embedded, and different page sizes coexist without being resized.',
  faq: [
    { q: 'In what order are the documents assembled?',
      r: 'In the order you add them to the list. Add them one at a time to control the sequence, and remove with a click the one you placed wrongly.' },
    { q: 'Does quality drop?',
      r: 'No. Pages are copied as they are, without re-encoding: text stays text and images keep their resolution.' },
    { q: 'Can I merge documents of different sizes?',
      r: 'Yes. An A4 page and an A3 page sit together in the same file without trouble: each keeps its size.' }
  ]
},

'compresser': {
  slug: 'compress-pdf', carte: 'Compress a PDF', resume: 'To fit an attachment',
  titre: 'Compress a PDF', h1: 'Compress a PDF', actionTexte: 'Compress',
  titreSeo: 'Compress a PDF for free, without sending the file',
  meta: 'Shrink a PDF right in your browser, with no size limit and no upload. Free, no account, no watermark.',
  chapo: 'Make an oversized document fit an email attachment. Compression happens on your machine: the file goes nowhere, and you choose the trade-off between weight and sharpness.',
  note: 'Pages are re-rendered at the chosen resolution. The weight drops sharply, but the text is no longer selectable: that is the price of compressing without a server.',
  garde: ['The look of every page, fonts and images included', 'Size and page count',
          'Colours', 'A document readable on screen and in everyday printing'],
  perdu: ['Selectable text and searching inside the document', 'Clickable links and bookmarks',
          'Form fields', 'Some fine detail, in proportion to the level chosen'],
  contexte: 'A PDF grows heavy for almost always the same reason: it holds full-resolution images, often scanned pages. Mailboxes usually cap at 10 or 25 MB, and public services often lower still.',
  usages: [
    { t: 'Get an attachment through', d: 'A 40 MB scanned file commonly drops below 5 MB.' },
    { t: 'Upload to an online service', d: 'Most refuse anything beyond a few megabytes.' },
    { t: 'Archive without filling the disk', d: 'Hundreds of documents take far less room.' }
  ],
  format: 'Compression here means redrawing each page as a JPEG image at the chosen resolution. That is effective on scans and image-rich documents; on a text-only PDF, already very compact, the tool hands you back the original rather than inflating it.',
  faq: [
    { q: 'How much smaller will my file get?',
      r: 'On a scanned document the reduction often passes 80 %. On a PDF born in a word processor it is small or nil: those files are already compact. In that case the tool says so and returns your original untouched.' },
    { q: 'Why is the text no longer selectable?',
      r: 'Because genuinely compressing a PDF means re-encoding its images, which only a server engine can do while preserving the text layer. Here every page is redrawn as an image: honest and effective, but the text becomes picture.' },
    { q: 'Can I compress a 500-page document?',
      r: 'Yes, no limit is imposed. Just allow time: every page is redrawn one by one in your browser.' }
  ]
},

'diviser': {
  slug: 'split-pdf', carte: 'Split a PDF', resume: 'One file per page or per range',
  titre: 'Split a PDF', h1: 'Split a PDF into several files', actionTexte: 'Split',
  titreSeo: 'Split a PDF for free, with nothing uploaded',
  meta: 'Cut a PDF into several files, page by page or by ranges, inside your browser. Free, no account, no loss of quality.',
  chapo: 'Separate a document into as many files as you need: one page each, or ranges you define. Pages are copied as they are, with no re-encoding.',
  note: 'Pages are copied without re-encoding: text stays selectable and images keep their original resolution.',
  garde: ['The exact quality of the pages', 'Selectable text and embedded fonts',
          'Page sizes, even when they differ', 'The original order inside each piece'],
  perdu: ['Bookmarks and the table of contents', 'Filled form fields', 'Electronic signatures, which become void'],
  contexte: 'A single document rarely suits all its readers: the accountant wants the invoices, the client wants their page, the archive wants everything. Splitting avoids sending a hundred pages to someone expecting one.',
  usages: [
    { t: 'Isolate what concerns each person', d: 'A yearly statement becomes twelve monthly sends.' },
    { t: 'Separate a scanned batch', d: 'A continuous scan of several documents becomes one file per document.' },
    { t: 'Lighten a send', d: 'Two 4 MB files get through where a single 8 MB one is refused.' }
  ],
  format: 'From two pieces onwards the files are gathered into a ZIP archive your system opens with a double click. Each file carries its page or range number.',
  faq: [
    { q: 'How do I write the ranges?',
      r: 'Separate them with commas: “1-3, 4, 5-12” produces three files. A single number gives a single page. Ranges may overlap without trouble.' },
    { q: 'Does splitting reduce quality?',
      r: 'No. Pages are copied identically, with no re-encoding: text stays text and images keep their resolution.' },
    { q: 'What if I just want to cut it in two?',
      r: 'Pick the range mode and type for instance “1-10, 11-20”: you get two files.' }
  ]
},

'extraire-pages': {
  slug: 'extract-pdf-pages', carte: 'Extract pages', resume: 'Keep only what matters',
  titre: 'Extract pages', h1: 'Extract pages from a PDF', actionTexte: 'Extract the pages',
  titreSeo: 'Extract pages from a PDF, free and with no upload',
  meta: 'Pick the pages to keep from a visual preview and get a new PDF, with nothing sent to a server. Free, no account, no loss.',
  chapo: 'Choose the pages to keep by looking at them, and leave with a document that contains only those. Kept pages are copied with no loss at all.',
  note: 'Click the pages to keep in the preview. They are copied without re-encoding: quality, text and fonts intact.',
  garde: ['The exact quality of the pages you keep', 'Selectable text', 'The original order', 'Page sizes'],
  perdu: ['Bookmarks pointing at discarded pages', 'Filled form fields', 'Electronic signatures'],
  contexte: 'It is often simpler to say what you keep than what you throw away. To pass on three pages of an eighty-page report, extraction saves printing, rescanning or installing software.',
  usages: [
    { t: 'Pass on an excerpt', d: 'Three pages of a contract go out without the rest of the file.' },
    { t: 'Build a piece of evidence', d: 'Only the pages the authority asked for are attached.' },
    { t: 'Recover a chapter', d: 'Part of a book or a manual becomes a document of its own.' }
  ],
  format: 'The preview shows every page as a thumbnail: one click selects, another deselects. Nothing is sent to produce that preview — it is computed in your browser.',
  faq: [
    { q: 'Do extracted pages keep their quality?',
      r: 'Entirely: they are copied without re-encoding. Text stays selectable and images keep their resolution.' },
    { q: 'Can I reorder at the same time?',
      r: 'Pages come out in their original order. To rearrange them, use the organise tool, which lets you move each page.' },
    { q: 'Is there a limit on the number of pages?',
      r: 'No. The preview renders thumbnails as you scroll, which stays smooth even on a thick document.' }
  ]
},

'supprimer-pages': {
  slug: 'delete-pdf-pages', carte: 'Delete pages', resume: 'Remove what does not belong',
  titre: 'Delete pages', h1: 'Delete pages from a PDF', actionTexte: 'Delete the pages',
  titreSeo: 'Delete pages from a PDF, free and with no upload',
  meta: 'Remove the useless pages of a PDF by clicking them in a preview. Everything happens in your browser: no upload, no account.',
  chapo: 'Blank page, duplicate scan, pointless appendix: click the pages to remove and leave with a clean document. Kept pages are not re-encoded.',
  note: 'Click in the preview the pages to remove. The others are copied as they are, with no loss.',
  garde: ['The exact quality of the pages you keep', 'Selectable text', 'The original order', 'Page sizes'],
  perdu: ['Bookmarks pointing at removed pages', 'Filled form fields', 'Electronic signatures'],
  contexte: 'A scanner nearly always produces one page too many: a blank back, a separator sheet, a double feed. Leaving them in bloats the file and muddles the reading.',
  usages: [
    { t: 'Clean up a scan', d: 'Blank backs and doubled sheets disappear.' },
    { t: 'Drop an appendix', d: 'The body of the document goes out without the attachments.' },
    { t: 'Remove a confidential page', d: 'A sensitive page is taken out before sending — and here it genuinely leaves the file.' }
  ],
  format: 'Unlike redacting in the editor, which covers things visually, deletion genuinely removes the page from the document: its content can no longer be recovered from the file you get.',
  faq: [
    { q: 'Is the deleted content really gone?',
      r: 'Yes. The page is not copied into the document produced: its text and images are simply not there any more. That is the difference from the editor\'s redaction, which only covers.' },
    { q: 'Can I delete everything?',
      r: 'No: a PDF must keep at least one page. The tool stops you if your selection would leave nothing.' },
    { q: 'Is the rest of the document changed?',
      r: 'No, the pages you keep are copied identically: no recompression, no change of size.' }
  ]
},

'organiser': {
  slug: 'organize-pdf', carte: 'Organise pages', resume: 'Reorder and straighten',
  titre: 'Organise a PDF', h1: 'Rearrange the pages of a PDF', actionTexte: 'Apply the order',
  titreSeo: 'Rearrange the pages of a PDF, free and with no upload',
  meta: 'Move, reverse and rotate the pages of a PDF from a visual preview, in your browser. Free, no account, nothing uploaded.',
  chapo: 'Put the pages back in the right order and straighten the crooked ones, while looking at them. Everything is decided in the preview, nothing is sent.',
  note: 'Move pages with the arrows, rotate them with a click, reverse the whole order with one button. Pages are not re-encoded.',
  garde: ['The exact quality of the pages', 'Selectable text', 'Page sizes', 'The rotations you apply'],
  perdu: ['Bookmarks, whose targets no longer match', 'Filled form fields', 'Electronic signatures'],
  contexte: 'A scanner feeder sometimes swallows sheets upside down, and a document assembled in a hurry rarely comes out in order. Rescanning everything for two misplaced pages makes no sense.',
  usages: [
    { t: 'Put a scan back in order', d: 'Pages fed the wrong way round find their place.' },
    { t: 'Straighten sideways pages', d: 'A table scanned in landscape finally reads the right way up.' },
    { t: 'Reverse a whole document', d: 'A scan made from the last page to the first flips with one button.' }
  ],
  format: 'Rotation follows the page, not its rank: rotate page 3 then move it, and it carries its rotation along.',
  faq: [
    { q: 'How do I move a page?',
      r: 'The two arrows under each thumbnail move it forward or back by one place. For a long move, click several times: the preview follows live.' },
    { q: 'Is the rotation real or only visual?',
      r: 'It is written into the file you get: the page will open straight in any reader, and print that way.' },
    { q: 'Can I reverse everything at once?',
      r: 'Yes, the “Reverse the order” button flips the whole document, which settles the classic case of a scan made backwards.' }
  ]
},

'pivoter': {
  slug: 'rotate-pdf', carte: 'Rotate a PDF', resume: 'Straighten sideways pages',
  titre: 'Rotate a PDF', h1: 'Rotate the pages of a PDF', actionTexte: 'Apply the rotation',
  titreSeo: 'Rotate a PDF for free, with no upload',
  meta: 'Rotate a whole PDF or just some pages, in your browser. The rotation is written into the file. Free and with nothing sent.',
  chapo: 'Straighten a document scanned sideways. The rotation is written into the file: it will open straight everywhere, and print straight.',
  note: 'Rotate the whole document with one button, or page by page in the preview. Nothing else is touched.',
  garde: ['The exact quality of the pages', 'Selectable text', 'The file weight, to the byte or nearly', 'Links and bookmarks'],
  perdu: ['Nothing: only the declared orientation of the pages changes'],
  contexte: 'A sideways page is read by tilting your head or rotating the view every time — and prints crooked. Fixing the orientation once settles it for every reader.',
  usages: [
    { t: 'Straighten a scan', d: 'Sheets fed the wrong way round come back upright.' },
    { t: 'Set a table the right way up', d: 'A landscape page inside a portrait document reads normally.' },
    { t: 'Prepare a print run', d: 'A document straight on screen prints straight.' }
  ],
  format: 'Rotating a PDF is not a redraw: it is a property of the page, read by every viewer. The operation is therefore instant and strictly lossless.',
  faq: [
    { q: 'Is the rotation permanent?',
      r: 'It is written into the file you get, so it shows everywhere. You can of course run the tool again to go back.' },
    { q: 'Can I rotate just one page?',
      r: 'Yes: every thumbnail in the preview has its own rotate button. The buttons at the top act on the whole document.' },
    { q: 'Does the file get heavier?',
      r: 'No. No page is redrawn: only an orientation property changes.' }
  ]
},

'rogner': {
  slug: 'crop-pdf', carte: 'Crop a PDF', resume: 'Cut the useless margins',
  titre: 'Crop a PDF', h1: 'Crop the margins of a PDF', actionTexte: 'Crop',
  titreSeo: 'Crop a PDF for free, with no upload',
  meta: 'Cut the margins of a PDF by dragging the edges on a preview, inside your browser. Free, no account, nothing sent.',
  chapo: 'Remove the black margins of a scan or recentre a badly framed page. You see what you are cutting before you confirm.',
  note: 'Drag the four edges on the preview. The framing you choose applies to every page of the document.',
  garde: ['Everything inside the frame, with no loss', 'Selectable text',
          'Image resolution', 'The file weight, almost unchanged'],
  perdu: ['Whatever falls outside the frame is no longer displayed', 'The same framing applies to every page'],
  contexte: 'A photographed or scanned document often carries a black border, a corner of desk or an oversized margin. In print it spoils the page; on screen it eats the useful area.',
  usages: [
    { t: 'Remove a scan border', d: 'The black edge around the sheet disappears.' },
    { t: 'Reframe a photographed document', d: 'A page shot on a phone gets clean edges again.' },
    { t: 'Gain room in print', d: 'Smaller margins leave the text bigger.' }
  ],
  format: 'Cropping changes the displayed area of the page, not its content. Technically, what falls outside stays in the file but is no longer shown: to truly erase it, reprint the result as a PDF afterwards.',
  faq: [
    { q: 'Does the framing apply to every page?',
      r: 'Yes, the same frame is applied throughout. That is the dominant case, a scan having the same margins from first page to last.' },
    { q: 'Is the cropped content removed from the file?',
      r: 'No: it is merely hidden by the new display area. If the point is to erase information, reprint the result as a PDF after cropping.' },
    { q: 'Does the file get lighter?',
      r: 'Barely: nothing is re-encoded. To genuinely lighten it, follow up with compression.' }
  ]
},

'numeroter': {
  slug: 'add-page-numbers', carte: 'Add page numbers', resume: 'Paginate a document',
  titre: 'Number a PDF', h1: 'Add page numbers to a PDF', actionTexte: 'Add the numbers',
  titreSeo: 'Add page numbers to a PDF, free and with no upload',
  meta: 'Paginate a PDF at the position and in the format you choose, inside your browser. Free, no account, nothing uploaded.',
  chapo: 'Put page numbers on a document that has none. Choose the position, the format and the starting number.',
  note: 'Numbers are drawn on top of the existing pages, with nothing re-encoded. The rest of the document is untouched.',
  garde: ['All existing content, identically', 'Selectable text', 'The file weight, almost unchanged'],
  perdu: ['Nothing: only one line of text is added to every page'],
  contexte: 'A file handed to a court, a jury or a client gets paginated. It is also the only way to refer to a page in a conversation, and to spot a sheet that went missing after printing.',
  usages: [
    { t: 'Prepare an official file', d: 'Paginated exhibits can be cited and checked.' },
    { t: 'Paginate an assembled document', d: 'After a merge, the original numbering is worthless.' },
    { t: 'Make proofreading easier', d: 'A reviewer can point at “page 14” without ambiguity.' }
  ],
  format: 'The number is written in a PDF standard font, dark grey, a few millimetres from the edge. It sits on top of the content: if your pages already have a busy footer, pick a free position.',
  faq: [
    { q: 'Can I start at a number other than 1?',
      r: 'Yes. The “Start at” field shifts the whole numbering, which helps when a cover or a contents page is counted separately.' },
    { q: 'What if my pages already have a footer?',
      r: 'Pick one of the other five positions: the number sits on top of the content, it does not push it aside.' },
    { q: 'Is the numbering real text?',
      r: 'Yes, it is selectable and searchable text, not an image.' }
  ]
},

'filigrane': {
  slug: 'watermark-pdf', carte: 'Add a watermark', resume: 'Mark every page',
  titre: 'Watermark a PDF', h1: 'Add a watermark to a PDF', actionTexte: 'Apply the watermark',
  titreSeo: 'Add a watermark to a PDF, free and with no upload',
  meta: 'Stamp a notice across every page of a PDF, in your browser. Text, colour and strength of your choosing. Free and with nothing sent.',
  chapo: 'Mark a document with “CONFIDENTIAL”, “DRAFT” or the name of its recipient, across every page at once.',
  note: 'The watermark is placed at the centre of every page, on top of the existing content, with nothing re-encoded.',
  garde: ['All existing content, identically', 'Selectable text', 'The file weight, almost unchanged'],
  perdu: ['Nothing: the watermark is added, it replaces nothing'],
  contexte: 'A circulating document ends up mistaken for the final version, or shared further than intended. A notice across every page removes the ambiguity at once, including on a printout or a photo of a screen.',
  usages: [
    { t: 'Mark a draft', d: 'Nobody mistakes a working version for the signed one.' },
    { t: 'Flag a confidential document', d: 'The notice follows the document, even printed.' },
    { t: 'Personalise a copy', d: 'The recipient\'s name on every page discourages onward sharing.' }
  ],
  format: 'The watermark is text, not an image: it stays sharp at every zoom level and barely adds to the file. It is placed on top of the content, so it shows in print.',
  faq: [
    { q: 'Can the watermark be removed?',
      r: 'Not easily: it is part of the page content. It is not a cryptographic protection either — it is a visible notice, not a lock.' },
    { q: 'What strength should I pick?',
      r: 'Around 10 to 15 % the watermark shows without getting in the way. Beyond 25 %, the document text becomes tiring to read.' },
    { q: 'Can I use my logo?',
      r: 'This tool places text. For an image, use the editor, which lets you add an element wherever you want.' }
  ]
},

'metadonnees': {
  slug: 'remove-pdf-metadata', carte: 'Clean the metadata', resume: 'What your file says about you',
  titre: 'PDF metadata', h1: 'Remove the metadata from a PDF', actionTexte: 'Clean the file',
  titreSeo: 'Remove PDF metadata for free, with no upload',
  meta: 'See what your PDF reveals — author, software, dates — and erase it, in your browser. Free, no account, nothing uploaded.',
  chapo: 'A PDF often carries the name of its author, of its software and its creation dates. The tool first shows you what yours reveals, then wipes it.',
  note: 'Title, author, subject, keywords, producer and dates are emptied. The content of the pages is untouched.',
  garde: ['All page content, identically', 'Selectable text', 'Image quality'],
  perdu: ['The author and software names', 'Creation and modification dates',
          'Title, subject and keywords', 'Careful: text inside the pages is not concerned'],
  contexte: 'A CV exported from a word processor usually carries the account name of the computer. A quote reveals the invoicing software. This information travels with the file unnoticed — until the day someone notices.',
  usages: [
    { t: 'Send a CV', d: 'The workstation name or a former employer no longer travels with the file.' },
    { t: 'Pass on a company document', d: 'The internal software and the real author stay with you.' },
    { t: 'Publish a document', d: 'A file put online no longer reveals its production chain.' }
  ],
  format: 'Metadata are fields of the file, separate from the page content. Erasing them changes nothing of what is written: if sensitive information sits in the text, the editor is the tool to use.',
  faq: [
    { q: 'What exactly is erased?',
      r: 'Title, author, subject, keywords, the producing software name and the creation and modification dates. These are the fields a PDF reader shows in the document properties.' },
    { q: 'Does my personal data inside the text disappear?',
      r: 'No, and this matters: only the file metadata are emptied. To remove information written inside a page, use the editor then reprint the result as a PDF.' },
    { q: 'Does the document still open everywhere?',
      r: 'Yes. These fields are informative: no reader needs them to open the file.' }
  ]
},

'deverrouiller': {
  slug: 'unlock-pdf', carte: 'Unlock a PDF', resume: 'Remove a protection you know',
  titre: 'Unlock a PDF', h1: 'Unlock a protected PDF', actionTexte: 'Unlock',
  titreSeo: 'Unlock a PDF for free, with no upload',
  meta: 'Remove the protection from a PDF whose password you know, in your browser. No file sent, no account, free.',
  chapo: 'Produce an unprotected copy of a document you are entitled to open. The password you type never leaves your browser.',
  note: 'Pages are redrawn without the protection: the document opens and prints freely, but its text becomes picture.',
  garde: ['The exact look of every page', 'Size and page count', 'Colours and resolution'],
  perdu: ['Selectable text and searching', 'Clickable links and bookmarks', 'Form fields'],
  contexte: 'A bank statement or a phone bill often arrives protected by a password, or barred from printing. When it has to join a file, the protection becomes an obstacle even though you are perfectly entitled to the content.',
  usages: [
    { t: 'Attach a statement to a submission', d: 'The document opens without asking the rightful recipient for a password.' },
    { t: 'Print a restricted document', d: 'A print restriction no longer blocks a copy you hold.' },
    { t: 'Archive without depending on a password', d: 'The document still reads in ten years.' }
  ],
  format: 'pdf.js can decrypt a document but not rewrite it decrypted: the tool therefore redraws every page. That is the honest limit of unlocking without a server, and the reason the text becomes picture.',
  faq: [
    { q: 'Does this tool break passwords?',
      r: 'No, and that is not its purpose. It removes the protection from a document you can already open, typing the password if the document asks for one. No decryption attempt is made.' },
    { q: 'Is my password sent anywhere?',
      r: 'No. It is used by your browser\'s PDF reader, inside the tab. The page talks to no server at all — you can even cut your connection.' },
    { q: 'Why is the text no longer selectable?',
      r: 'Because a decrypted PDF cannot be rewritten as such from a browser. Pages are redrawn from their rendering, which preserves the look but turns the text into an image.' }
  ]
},

'signer': {
  slug: 'sign-pdf', carte: 'Sign a PDF', resume: 'Draw and place your signature',
  titre: 'Sign a PDF', h1: 'Sign a PDF by hand', actionTexte: 'Place the signature',
  titreSeo: 'Sign a PDF for free, without uploading the document',
  meta: 'Draw your signature and place it on a PDF, entirely inside your browser. No account, no upload of the document, no watermark.',
  chapo: 'Draw your signature with the mouse or a finger, pick the page, and take back the signed document. Neither the contract nor the signature leaves your computer.',
  note: 'The signature is drawn in the browser, turned into an image and placed on the chosen page. The rest of the document is not re-encoded.',
  garde: ['All existing content, identically', 'Selectable text', 'Page quality'],
  perdu: ['Nothing: the signature is simply added on top'],
  contexte: 'Print, sign, scan, send back: the classic loop costs ten minutes, a printer and a degraded copy. Signing the file directly avoids all three.',
  usages: [
    { t: 'Return a contract', d: 'The document goes back signed without touching a printer.' },
    { t: 'Approve a quote', d: 'An agreement is placed in seconds.' },
    { t: 'Sign an official form', d: 'The file you received goes back signed, at the same quality.' }
  ],
  format: 'This is a handwritten signature placed visually, like initials on paper. It is not a qualified electronic signature: that requires a certificate issued by a trusted provider and a dedicated infrastructure.',
  faq: [
    { q: 'Does this signature have legal value?',
      r: 'It is the digital equivalent of handwritten initials: widely accepted in everyday commercial exchanges, on the same footing as a scanned contract. A qualified electronic signature under eIDAS is a different thing and requires a certified provider.' },
    { q: 'Is my signature stored anywhere?',
      r: 'No. It is drawn in the tab, placed on the document, then gone when you close the page. Nothing is transmitted or kept.' },
    { q: 'Can I sign somewhere other than the last page?',
      r: 'Yes: give the page number you want, and set the position with the three lists provided.' }
  ]
},

'ocr': {
  slug: 'ocr-pdf', carte: 'Scanned PDF to text', resume: 'Character recognition',
  titre: 'OCR a PDF', h1: 'Extract the text from a scanned PDF', actionTexte: 'Read the text',
  titreSeo: 'OCR a scanned PDF for free, without sending it',
  meta: 'Read the text of a scanned PDF inside your browser and get it back as .txt or Word. Free, in French, with no upload.',
  chapo: 'A scanned document is only a picture: you can neither search it nor copy it. Character recognition transcribes it into text, here on your own machine.',
  note: 'Recognition runs on French and entirely inside your browser. Allow a few seconds per page.',
  garde: ['The text of every page, in reading order', 'Accents and French punctuation',
          'The separation between pages', 'Paragraphs, approximately'],
  perdu: ['Layout, columns and tables', 'Images and logos',
          'Fonts and styling', 'Some accuracy on a poor-quality scan'],
  contexte: 'Most documents received by post and then scanned are unreadable to a computer: nothing in them can be searched. This is precisely the recognition online services keep for their paid plans, because it costs them server time.',
  usages: [
    { t: 'Find something in a scan', d: 'Extracted text can be searched from the keyboard, unlike the image.' },
    { t: 'Reuse a letter you received', d: 'A scanned paper document becomes text to quote or correct.' },
    { t: 'Archive something usable', d: 'Years of correspondence become a searchable corpus.' }
  ],
  format: 'The engine is Tesseract, compiled for the browser, with the French language data bundled in. Quality depends mostly on the scan: a clean, straight document gives an excellent result, a crooked photograph far less.',
  faq: [
    { q: 'How do I know whether my PDF is a scan?',
      r: 'Try selecting a line with the mouse in your reader. If nothing selects, it is an image: this tool is made for that.' },
    { q: 'Does recognition handle accents?',
      r: 'Yes, the model is specifically French: accents, cedillas and French punctuation are supported.' },
    { q: 'What if I want to correct inside the PDF itself?',
      r: 'Open it in the editor instead: recognition starts automatically there and every recognised line becomes editable in place, inside the document.' }
  ]
},

'pdf-texte': {
  slug: 'pdf-to-text', carte: 'PDF → text', resume: 'Plain text, no recognition needed',
  titre: 'PDF to text', h1: 'Extract the text from a PDF', actionTexte: 'Extract the text',
  titreSeo: 'Extract the text from a PDF for free, with no upload',
  meta: 'Get the text of a PDF as .txt or Word, instantly and inside your browser. Free, no account, and the file is sent to no server.',
  chapo: 'When a PDF already holds text — which is the case for anything a computer produced — there is nothing to recognise: the text is read out exactly, in a second.',
  note: 'The text appears on screen as soon as it is ready. If the document is a scan, the tool says so instead of handing you an empty file.',
  garde: ['The exact text, character for character', 'Reading order and line breaks',
          'The separation between pages', 'All accents and punctuation'],
  perdu: ['Layout, columns and tables', 'Images and logos',
          'Fonts, sizes and colours', 'Hyperlinks'],
  contexte: 'The confusion is common: people look for an "OCR" when the text is already there. Character recognition is for scanned documents and stays approximate; on a native PDF it would degrade text that was already perfect.',
  usages: [
    { t: 'Quote a passage', d: 'Copy an exact sentence without retyping it.' },
    { t: 'Analyse a document', d: 'Feed the text to a spreadsheet, a script or a proofreader.' },
    { t: 'Archive in plain text', d: 'Keep a searchable, lightweight version of a file.' }
  ],
  format: 'Extraction relies on pdf.js, which reports the position of every fragment. Fragments sharing a baseline are grouped, which avoids getting one word per line. For a scanned document, use the character recognition tool instead.',
  faq: [
    { q: 'How is this different from OCR?',
      r: 'Here the text already exists inside the file: it is read out, exactly and instantly. Recognition guesses letters from an image — useful on a scan, pointless and degrading on a native PDF.' },
    { q: 'Why is my result empty?',
      r: 'Because your PDF is an image. The tool says so explicitly and points you to character recognition.' },
    { q: 'Is the layout preserved?',
      r: 'No, this is plain text. Columns end up one after the other. To keep the structure, convert to Word instead.' }
  ]
},

'reparer': {
  slug: 'repair-pdf', carte: 'Repair a PDF', resume: 'Reopen a damaged file',
  titre: 'PDF repair', h1: 'Repair a damaged PDF', actionTexte: 'Repair the document',
  titreSeo: 'Repair a corrupt PDF for free, with no upload',
  meta: 'A PDF that refuses to open? Rebuild it inside your browser. Free, no account, and the damaged file is sent to no server.',
  chapo: '"Cannot open this document" usually comes from a damaged internal structure, not from lost content. The tool reads whatever is readable and writes a clean file around it.',
  note: 'Two routes are tried in order: rewriting the structure while keeping the text, and if that is beyond saving, redrawing the pages from their rendering. The tool tells you which one was used.',
  garde: ['Every readable page', 'Selectable text, when the structure can be recovered',
          'Page size and orientation', 'Images'],
  perdu: ['Whatever is physically missing from a truncated file', 'Forms and their fields',
          'Selectable text, if the rendering route was needed', 'Bookmarks and links'],
  contexte: 'A PDF gets corrupted in transit, on a failing drive, or because the program that wrote it stopped halfway. The content is often intact: what is broken is the table telling the reader where each object lives.',
  usages: [
    { t: 'Recover a document you received', d: 'An attachment your reader refuses to open.' },
    { t: 'Save an archived file', d: 'An old document pulled off a tired disk.' },
    { t: 'Unblock printing', d: 'A PDF that displays but crashes on print.' }
  ],
  format: 'pdf.js tolerates broken cross-reference tables, unclosed objects and wrong lengths, where most readers give up. It is used here as a filter: whatever it manages to read, pdf-lib writes back cleanly.',
  faq: [
    { q: 'Can every PDF be repaired?',
      r: 'No. A truncated file has lost bytes no tool can invent. An inconsistent structure, which is the common case, can almost always be rebuilt.' },
    { q: 'Will my text stay selectable?',
      r: 'Yes if the structure can be recovered, which is the usual outcome. If it cannot, pages are redrawn from their rendering and the text becomes an image — the tool flags it.' },
    { q: 'What if the document asks for a password?',
      r: 'Run it through the unlock tool first, entering the password you already know.' }
  ]
},

'pages-blanches': {
  slug: 'remove-blank-pages-pdf', carte: 'Blank pages', resume: 'Find and drop empty pages',
  titre: 'Blank pages in a PDF', h1: 'Remove the blank pages from a PDF',
  actionTexte: 'Remove the blank pages',
  titreSeo: 'Remove blank pages from a PDF, for free',
  meta: 'Automatically find and drop the empty pages of a scanned PDF, inside your browser. Free, no account, no upload.',
  chapo: 'A double-sided scan produces an empty page for every unprinted back. The tool spots them by analysing each page’s rendering and hands the document back without them.',
  note: 'The outer 3 % margin is ignored: the edges of a scan are nearly always grey and would make an empty page look full.',
  garde: ['Every page carrying content', 'Their order and orientation',
          'Selectable text', 'The original quality'],
  perdu: ['Pages judged blank, listed in the report',
          'A page bearing only a very faint mark, on strict sensitivity',
          'Deliberately empty pages of a laid-out document'],
  contexte: 'Scanning a stack double-sided doubles the page count, half of it empty. Removing them by hand on a hundred-page document is tedious and error-prone.',
  usages: [
    { t: 'Clean up a double-sided scan', d: 'The commonest case, and the one that saves the most pages.' },
    { t: 'Lighten an archive', d: 'Fewer pages means a smaller file to send.' },
    { t: 'Prepare a print run', d: 'Avoid wasting paper on empty sheets.' }
  ],
  format: 'Each page is rendered small, then the share of pixels distinctly darker than the background is measured. Above the threshold, the page is kept. The threshold is what the sensitivity setting changes.',
  faq: [
    { q: 'What if a useful page gets removed?',
      r: 'Pick strict sensitivity: only near-immaculate pages are dropped. The report always lists the page numbers removed, so you can check.' },
    { q: 'Why are my empty pages not detected?',
      r: 'Your scanner probably leaves grain or an edge shadow. Switch to tolerant sensitivity.' },
    { q: 'Is the document changed in any other way?',
      r: 'No. Kept pages are copied as they are, with no re-encoding and no loss.' }
  ]
},

'aplatir': {
  slug: 'flatten-pdf', carte: 'Flatten a PDF', resume: 'Freeze form fields',
  titre: 'Flatten a PDF', h1: 'Flatten a PDF', actionTexte: 'Flatten the document',
  titreSeo: 'Flatten a PDF for free, without uploading the file',
  meta: 'Freeze the form fields of a PDF so nobody can change them. Free, in your browser, with no upload.',
  chapo: 'A filled-in form stays editable: the recipient can change your answers. Flattening turns those fields into fixed content — visible and printable, but frozen.',
  note: 'The values you typed stay exactly where they were; only changing them becomes impossible.',
  garde: ['The values you entered, in place', 'Layout and fonts',
          'The document text, selectable', 'Images and drawn signatures'],
  perdu: ['The editability of the fields — that is the point', 'Dropdowns and checkboxes, now drawings',
          'The form’s automatic calculations', 'Certificate-based electronic signatures, which become invalid'],
  contexte: 'Returning a filled PDF form without flattening it means sending a document the recipient can edit before filing it. For a signed quote or an administrative request, that is a weakness.',
  usages: [
    { t: 'Return a form', d: 'Your answers can no longer be altered afterwards.' },
    { t: 'Archive a file', d: 'The document freezes in the state it was approved in.' },
    { t: 'Make printing reliable', d: 'Some readers do not print form fields; flattened, the problem disappears.' }
  ],
  format: 'Flattening relies on pdf-lib: field appearances are drawn into the page content, then the form is removed. If an appearance cannot be regenerated, the form is simply deleted — what is already displayed stays visible.',
  faq: [
    { q: 'Do my answers stay readable?',
      r: 'Yes, and in exactly the same place. They simply stop being editable fields and become page content.' },
    { q: 'Can I undo it?',
      r: 'Not on the produced file. Keep your original — a general rule with these tools.' },
    { q: 'What if my PDF has no form?',
      r: 'The tool says so and simply re-saves the document, changing nothing.' }
  ]
},

'assainir': {
  slug: 'sanitize-pdf', carte: 'Sanitize a PDF', resume: 'Strip JavaScript and attachments',
  titre: 'Sanitize a PDF', h1: 'Sanitize a PDF', actionTexte: 'Sanitize the document',
  titreSeo: 'Sanitize a PDF: strip JavaScript and embedded files',
  meta: 'Remove JavaScript, attached files and automatic actions from a PDF you received. Free, in your browser, with no upload.',
  chapo: 'A PDF is not only a document: it can carry JavaScript, attached files and an action fired on opening. Those are the vectors of booby-trapped attachments. The tool removes them without touching the visible content.',
  note: 'The report states precisely what was found and removed — and tells you when the document was already clean.',
  garde: ['All visible content, unchanged', 'Selectable text',
          'Images and layout', 'Ordinary hyperlinks'],
  perdu: ['Embedded JavaScript', 'Files attached to the document',
          'The action fired on opening', 'Automatic actions set on pages'],
  contexte: 'PDF is one of the most used formats for getting something to execute when an attachment is opened. Most modern readers block these mechanisms, but not all do, and a document that circulates eventually meets a permissive reader.',
  usages: [
    { t: 'Clean a document you received', d: 'Before opening it on a sensitive machine or passing it on.' },
    { t: 'Prepare a distribution', d: 'Do not forward to your recipients what was forwarded to you.' },
    { t: 'Archive soundly', d: 'A document collection without executable code ages better.' }
  ],
  format: 'The tool removes the JavaScript and EmbeddedFiles entries from the catalogue, the open action, and the automatic actions on pages. It makes no claim to analyse content: this is not an antivirus, it is the removal of the execution mechanisms the format provides.',
  faq: [
    { q: 'Is this an antivirus?',
      r: 'No, and it should not be mistaken for one. It removes the execution mechanisms PDF provides — JavaScript, attachments, automatic actions. It does not analyse content and will not detect a malicious image.' },
    { q: 'Does the document stay identical?',
      r: 'Visually, entirely. Only what was executable or attached disappears.' },
    { q: 'How do I know whether my PDF carried anything?',
      r: 'The report says so, item by item. If it carried nothing, the tool tells you that too rather than implying a clean-up happened.' }
  ]
},

'ecrire-metadonnees': {
  slug: 'edit-pdf-metadata', carte: 'Write metadata', resume: 'Title, author, subject, keywords',
  titre: 'PDF metadata', h1: 'Edit the metadata of a PDF', actionTexte: 'Write the metadata',
  titreSeo: 'Edit PDF metadata for free, with no upload',
  meta: 'Set the title, author, subject and keywords of a PDF. Free, in your browser, no account and no upload.',
  chapo: 'Metadata is what your reader shows in the title bar and what your system searches on. A document exported from a word processor is often called "Document1": here is where you fix that.',
  note: 'Leave blank anything you do not want to change. The producer is always reset to VoilàPDF: claiming another program wrote the file would be a forgery.',
  garde: ['All document content', 'Text, images and layout',
          'The fields you leave blank', 'The original creation date'],
  perdu: ['The previous values of the fields you fill in',
          'The name of the producing software, replaced',
          'Nothing else: the content is not re-encoded'],
  contexte: 'A PDF you pass on keeps the name of its author in its metadata, the name of the software, and sometimes the path of the original file. That is often awkward — and conversely, a well-described document turns up in a search.',
  usages: [
    { t: 'Name a document properly', d: 'The displayed title stops being "Document1" or "Untitled".' },
    { t: 'Claim authorship', d: 'State the author or organisation on a distributed document.' },
    { t: 'Make a collection searchable', d: 'Consistent keywords make an archive usable.' }
  ],
  format: 'The fields written are those of the PDF information dictionary: Title, Author, Subject, Keywords. The modification date is updated. Page content is untouched.',
  faq: [
    { q: 'How is this different from "Clean the metadata"?',
      r: 'The other tool erases everything so the file reveals nothing. This one writes chosen values. They complement each other: clean first, then write back what you stand behind.' },
    { q: 'Is this information visible in the document?',
      r: 'No, it does not print. It appears in the file properties and in the reader’s title bar.' },
    { q: 'Can I clear an existing field?',
      r: 'This tool writes but does not erase. To empty the fields, use "Clean the metadata".' }
  ]
},

'comparer': {
  slug: 'compare-pdf', carte: 'Compare two PDFs', resume: 'See what changed',
  titre: 'PDF comparison', h1: 'Compare two PDFs', actionTexte: 'Compare the documents',
  titreSeo: 'Compare two PDFs for free, without uploading the files',
  meta: 'Spot the text differences between two versions of a PDF, page by page. Free, in your browser, with no upload.',
  chapo: 'Two versions of a contract, a quote or a report look alike enough that the one sentence that changed slips past. The tool reads the text of both files and lists what differs.',
  note: 'Drop both files: the first is the reference, the second the compared version. The report also appears on screen.',
  garde: ['Removed lines, marked with a minus', 'Added lines, marked with a plus',
          'The page number of every difference', 'The count of differing pages'],
  perdu: ['Purely visual differences: font, colour, position',
          'Images and their content', 'Word-level detail inside a line',
          'Scanned documents, for lack of text to compare'],
  contexte: 'Reading two versions side by side takes time and lets things through. Services that do it online ask you to upload two documents — often the two versions of a contract, which is exactly what you do not want to hand over.',
  usages: [
    { t: 'Check a returned contract', d: 'See what the other party changed before signing.' },
    { t: 'Follow a revision', d: 'Identify the paragraphs reworked between two versions.' },
    { t: 'Verify a reissue', d: 'Make sure a republished official document still says the same thing.' }
  ],
  format: 'Comparison works on text, line by line and page by page. Pixels are not compared: two identical renderings can differ by antialiasing, and two visually similar pages can say opposite things. Meaning lives in the text.',
  faq: [
    { q: 'Can scanned documents be compared?',
      r: 'Not directly: an image holds no text. Run both files through character recognition, then compare the results.' },
    { q: 'Are layout differences shown?',
      r: 'No. The tool compares what is written, not how it is presented. A paragraph moved without being changed will not show as a content difference.' },
    { q: 'Are my two files sent anywhere?',
      r: 'Neither of them. Everything is read and compared in your browser — which is precisely what matters when comparing two versions of a contract.' }
  ]
},

'resumer': {
  slug: 'summarize-pdf', carte: 'Summarise a PDF', resume: 'The gist of a long document',
  titre: 'PDF summary', h1: 'Summarise a PDF without sending it anywhere',
  actionTexte: 'Summarise the document',
  titreSeo: 'Summarise a PDF for free, without sending the document',
  meta: 'Get the gist of a long PDF in seconds, inside your browser. Free, no account, and your document is sent to no server and to no online AI.',
  chapo: 'A forty-page report, a contract, a set of minutes: the summary keeps the passages that carry the information and drops the rest. The work happens on your machine; the document goes nowhere.',
  note: 'The summary appears on screen as soon as it is ready, and stays downloadable in the format you chose. If the document is a scan, character recognition runs automatically before the analysis.',
  garde: ['Sentences exactly as the document writes them', 'The original reading order',
          'Figures, dates and proper nouns, untouched', 'The split into paragraphs'],
  perdu: ['Tables, images and captions', 'Layout, headers and footers',
          'Passages judged secondary, by design',
          'Footnotes, swallowed into the body text'],
  contexte: 'Online summarisers almost all require uploading the document to their servers, then forwarding it to a third-party AI. For internal minutes, a contract or a medical file, that amounts to publishing the document to save three minutes.',
  usages: [
    { t: 'Size up a report', d: 'Know within a minute whether the forty pages deserve a full read.' },
    { t: 'Prepare for a meeting', d: 'Pull the salient points out of the minutes before going back to them.' },
    { t: 'Sort through a file', d: 'Review twenty documents without opening every one.' }
  ],
  format: 'The default method is extractive: every sentence is scored on the words it shares with the rest of the document, and the best-scoring ones are returned in their original order. That is deliberate — on a document that commits you, a plausible but inaccurate rewording is worse than a faithful extract. The written mode relies on distilbart-cnn, a model trained on English only.',
  faq: [
    { q: 'Is my document sent to an AI?',
      r: 'No. The default method is a statistical computation that runs in the tab, with no network. The written mode downloads a model onto your machine and runs it there: the model weights come down, your document never goes up.' },
    { q: 'Does the summary invent sentences?',
      r: 'Not with the default method: every sentence of the summary appears word for word in the document. That is why it is offered first.' },
    { q: 'Does it work on a scanned PDF?',
      r: 'Yes. If the document holds no readable text, character recognition starts on its own before the summary, on your own machine. Allow a few extra seconds per page.' },
    { q: 'Which length should I pick?',
      r: '“Medium” suits almost everything. “Short” helps decide whether a document deserves reading; “Detailed” keeps a usable record without rereading the original.' }
  ]
},

'traduire': {
  slug: 'translate-pdf', carte: 'Translate a PDF', resume: 'French ↔ English, on your machine',
  titre: 'PDF translation', h1: 'Translate a PDF without uploading it',
  actionTexte: 'Translate the document',
  titreSeo: 'Translate a PDF for free, without uploading the document',
  meta: 'Translate a PDF from French to English or the other way round, entirely inside your browser. Free, no account, and the document is sent to no translation server.',
  chapo: 'The text of the PDF is translated sentence by sentence by a language model running on your own computer. No translation service receives your document, and none keeps it.',
  note: 'On first use the translation model — about 103 MB — downloads once, then stays in the browser cache: later translations start immediately. A scanned document goes through character recognition automatically.',
  garde: ['The full text, in reading order', 'The split into paragraphs',
          'Figures, dates and amounts', 'Proper nouns, left as they are'],
  perdu: ['Layout, columns and tables', 'Images, logos and signatures',
          'Fonts and styling', 'Headers and footers, mixed into the text'],
  contexte: 'Translating a PDF online nearly always means handing it to a provider, who forwards it to a third-party engine. For a contract, a commercial offer or a letter from a lawyer, the document ends up on two servers you know nothing about.',
  usages: [
    { t: 'Read a foreign contract', d: 'Understand what you are signing without handing the contract to a third party.' },
    { t: 'Answer an English-speaking client', d: 'Translate a quote or a technical note before adapting it.' },
    { t: 'Work through documentation', d: 'Make an English manual or standard readable.' }
  ],
  format: 'The engine is Marian (opus-mt), the open translation model from the University of Helsinki, converted to ONNX and run by transformers.js. Translation covers the text alone: the result is a clean document, not a copy of the original layout.',
  faq: [
    { q: 'Does my document go to Google or DeepL?',
      r: 'No, and it goes nowhere else either. The translation model is downloaded onto your machine and runs there. The model comes down to you; your document never goes up.' },
    { q: 'Why a 103 MB download?',
      r: 'That is the weight of the language model itself. It is fetched only when you start a translation, once: the browser then keeps it in cache for subsequent runs.' },
    { q: 'Is the layout preserved?',
      r: 'No, and that is deliberate: translation changes the length of the text, so the original layout would no longer hold. You get a clean document containing the translation, paragraph by paragraph.' },
    { q: 'Which languages are available?',
      r: 'French to English and English to French. Those two directions cover the vast majority of needs, and each extra pair would mean another full model.' },
    { q: 'Is the quality as good as DeepL?',
      r: 'No. A model that fits in a browser does not rival a service hosted on graphics cards. It is more than enough to understand a document; for a translation meant to be published, have it proofread.' }
  ]
}
};

/* Libellés des réglages, par outil puis par identifiant d'option. */
const OPTIONS = {
  compresser: { niveau: { label: 'Compression level',
    valeurs: { forte: ['Strong', 'smallest file'], moyenne: ['Balanced', 'recommended'], douce: ['Gentle', 'best quality'] } } },
  diviser: {
    mode: { label: 'Split mode', valeurs: { chaque: ['One page per file', 'ZIP archive'], plages: ['By ranges', 'you define them'] } },
    plages: { label: 'Ranges to extract', exemple: '1-3, 4, 5-12', aide: 'Separate ranges with commas. Each range becomes a file.' } },
  numeroter: {
    position: { label: 'Position', valeurs: { 'bas-centre': ['Bottom, centred'], 'bas-droite': ['Bottom right'], 'bas-gauche': ['Bottom left'],
      'haut-centre': ['Top, centred'], 'haut-droite': ['Top right'], 'haut-gauche': ['Top left'] } },
    format: { label: 'Format', valeurs: { simple: ['1', 'the number alone'], 'sur-total': ['1 / 12', 'with the total'], 'page-n': ['Page 1', 'spelled out'] } },
    debut: { label: 'Start at', aide: 'Useful when a cover page is numbered separately.' },
    taille: { label: 'Text size (pt)' } },
  filigrane: {
    texte: { label: 'Watermark text', exemple: 'CONFIDENTIAL' },
    couleur: { label: 'Colour', valeurs: { gris: ['Grey', 'discreet'], rouge: ['Red', 'alert'], bleu: ['Blue', 'notice'] } },
    angle: { label: 'Tilt', valeurs: { oblique: ['Diagonal', 'classic'], droit: ['Horizontal', 'discreet'] } },
    opacite: { label: 'Strength (%)', aide: 'Beyond 25 %, the watermark gets in the way of reading.' },
    taille: { label: 'Size (pt)' } },
  deverrouiller: { motdepasse: { label: 'Document password', exemple: 'leave empty if it opens without one',
    aide: 'It stays in your browser: this page talks to no server.' } },
  signer: {
    page: { label: 'Page to sign', aide: 'Leave empty to sign the last page, which is the usual case.' },
    largeur: { label: 'Signature size', valeurs: { '0.18': ['Small'], '0.26': ['Normal'], '0.36': ['Large'] } },
    x: { label: 'Horizontal position', valeurs: { '0.08': ['Left'], '0.37': ['Centre'], '0.62': ['Right'] } },
    y: { label: 'Vertical position', valeurs: { '0.1': ['Bottom'], '0.45': ['Middle'], '0.8': ['Top'] } } },
  ocr: { sortie: { label: 'Output format', valeurs: { txt: ['Plain text', '.txt file'], docx: ['Word document', '.docx file'] } } },
  resumer: {
    longueur: { label: 'Summary length', valeurs: { court: ['Short', 'about a tenth'],
      moyen: ['Medium', 'about a fifth'], long: ['Detailed', 'about a third'] } },
    moteur: { label: 'Method', valeurs: { extrait: ['Sentences from the document', 'any language · instant'],
      redige: ['Written summary', 'English · 271 MB model'] },
      aide: 'The first method picks the most load-bearing sentences of the document: it invents nothing and works in any language. The second writes fresh text, but the model exists in English only and is a 271 MB one-off download.' },
    sortie: { label: 'Summary format', valeurs: { txt: ['Plain text', '.txt file'],
      pdf: ['PDF', '.pdf file'], docx: ['Word', '.docx file'] } } },
  traduire: {
    sens: { label: 'Direction', valeurs: { 'fr-en': ['French → English'], 'en-fr': ['English → French'] } },
    sortie: { label: 'Output format', valeurs: { pdf: ['PDF', '.pdf file'],
      docx: ['Word', '.docx file'], txt: ['Plain text', '.txt file'] } } }
};

/* Panneaux d'aperçu : textes affichés autour des vignettes. */
const PANNEAUX = {
  lecture: 'Reading the document…',
  apercuIndispo: nom => `Preview unavailable: ${nom} — the tool still works.`,
  toutSelectionner: 'Select all', toutDeselectionner: 'Clear selection',
  pivoterGauche: '↺ Rotate all left', pivoterDroite: '↻ Rotate all right',
  inverser: "⇅ Reverse the order",
  compteSelection: (n, t) => `${n} page(s) selected out of ${t}`,
  comptePages: t => `${t} page(s)`,
  page: 'Page', avancer: 'Move earlier', reculer: 'Move later', pivoterCette: 'Rotate this page',
  rognerAide: 'Drag the edges on the preview. The crop applies to every page.',
  signatureAide: 'Draw your signature in the frame, with the mouse or a finger.',
  effacer: 'Clear',
  metaAide: 'Here is what your file reveals today:',
  metaVide: 'This document already carries no identifying metadata.',
  metaIllisible: 'Metadata unreadable.',
  metaChamps: { Titre: 'Title', Auteur: 'Author', Sujet: 'Subject', 'Mots-clés': 'Keywords',
                Logiciel: 'Software', 'Créé par': 'Created by', Création: 'Created', Pages: 'Pages' },
  inchange: "This file was already as tight as it gets: compressing it would have made it bigger, so we hand back your original.",
  reduction: (a, b, p) => `${a} → ${b}, that is ${p} % less`
};

/* Suffixes des fichiers produits : « invoice-compressed.pdf », pas « -compresse ». */
const SUFFIXES = {
  compresse: '-compressed', decoupe: '-split', pages: '-pages', extrait: '-extract',
  allege: '-trimmed', reorganise: '-reordered', pivote: '-rotated', rogne: '-cropped',
  numerote: '-numbered', filigrane: '-watermarked', anonymise: '-anonymised',
  deverrouille: '-unlocked', signe: '-signed',
  repare: '-repaired', sansBlanches: '-no-blank-pages', aplati: '-flattened',
  assaini: '-sanitized', metadonnees: '-metadata', comparaison: '-comparison',
  traduit: '-translated', resume: '-summary'
};

/* Messages des outils de langue. Le téléchargement du modèle est long : il doit
   se raconter dans la langue de la page, sinon l'attente paraît un blocage. */
const IA = {
  telechargement: 'Downloading the model…',
  traduction: 'Translating passage',
  redaction: 'Writing the summary, block',
  analyse: 'Analysing the document…',
  reconnaissance: 'Scanned document: reading page',
  vide: 'This document holds no usable text, even after recognition.',
  rienTraduit: 'No passage could be translated.',
  rienResume: 'The document is too short to summarise.',
  libIntrouvable: 'The language engine could not be loaded. Reload the page and try again.',
  titreResume: 'Summary',
  compte: (m, t, p) => `${m} words instead of ${t}, ${p} % shorter.`
};

/* Traduction de l'éditeur lui-même. Le générateur applique ces paires au fichier
   index.html pour produire /en/ : les chaînes sont assez contextuelles pour ne
   remplacer que du texte visible, jamais du code. Les plus longues d'abord. */
const REMPLACEMENTS = [
  ['Cliquez sur un bloc de texte dans la page pour le modifier.', 'Click a block of text in the page to edit it.'],
  ["<b style=\"color:var(--txt)\">Éditer</b> — modifie le texte existant (l'original est recouvert).",
   '<b style="color:var(--txt)">Edit</b> — rewrites the existing text (the original is covered).'],
  ['<b style="color:var(--txt)">Ajouter</b> — pose un nouveau texte où vous cliquez.',
   '<b style="color:var(--txt)">Add</b> — places new text where you click.'],
  ['<b style="color:var(--txt)">Masquer</b> — glissez pour couvrir une zone.',
   '<b style="color:var(--txt)">Redact</b> — drag to cover an area.'],
  ['<kbd>Échap</kbd> sortir · <kbd>Suppr</kbd> retirer l\'élément sélectionné',
   '<kbd>Esc</kbd> to leave · <kbd>Delete</kbd> removes the selected item'],
  ['Aucun texte sélectionnable : page scannée (image). Cliquez sur « OCR » pour la rendre modifiable',
   'No selectable text: this page is an image. Click “OCR” to make it editable'],
  ['Aucun texte reconnu sur cette page. Utilisez « Masquer » puis « Ajouter ».',
   'No text recognised on this page. Use “Redact” then “Add”.'],
  ['Page scannée — reconnaissance du texte en cours…', 'Scanned page — reading the text…'],
  ["Rien à reconnaître : ces pages ont déjà du texte.", 'Nothing to recognise: these pages already contain text.'],
  ["L'OCR demande le serveur local : lance « Editeur PDF.cmd »", 'OCR needs the local server: run “Editeur PDF.cmd”'],
  [" — il faut lancer « Editeur PDF.cmd ».", ' — you need to run “Editeur PDF.cmd”.'],
  ["Ce fichier n'est pas un PDF. Choisissez l'outil correspondant à son format.",
   'That file is not a PDF. Pick the tool that matches its format.'],
  ["Le texte tient déjà dans la largeur d'origine.", 'The text already fits the original width.'],
  ['Revenir à l\'accueil et ouvrir un autre fichier', 'Back to the home page and open another file'],
  ['Réduit la taille pour tenir dans la largeur d\'origine', 'Shrinks the size to fit the original width'],
  ['Encadrer tous les blocs de texte modifiables', 'Outline every editable text block'],
  ['Reconnaître le texte des pages scannées', 'Recognise the text of scanned pages'],
  ['Cliquer sur un texte pour le modifier', 'Click a text to edit it'],
  ['Cliquer pour ajouter du texte', 'Click to place new text'],
  ['Glisser pour masquer une zone', 'Drag to cover an area'],
  ['Annuler toutes les modifications', 'Undo every change'],
  ['Chargement du moteur OCR…', 'Loading the recognition engine…'],
  ['Arrêt après la page en cours…', 'Stopping after the current page…'],
  ['Aucun texte reconnu sur ces pages.', 'No text could be recognised on these pages.'],
  ['Reconnaissance impossible : ', 'Recognition failed: '],
  ['Reconnaissance du texte — page ', 'Reading text — page '],
  ['Reconnaissance interrompue — ', 'Reading stopped — '],
  [' ligne(s) reconnue(s) — cliquez dessus pour les modifier.', ' line(s) recognised — click them to edit.'],
  ['-modifie.pdf', '-edited.pdf'],
  ['Modifications annulées', 'Changes undone'],
  ['Ouvrir un autre PDF', 'Open another PDF'],
  ['Enregistrer le PDF', 'Save the PDF'],
  ['Éditer un nouveau fichier', 'Edit another file'],
  ["Continuer l'édition", 'Keep editing'],
  ['PDF enregistré', 'PDF saved'],
  ['Donner mon avis', 'Leave a review'],
  ['Ça vous a rendu service ?', 'Did this help?'],
  ['Taille ramenée à ', 'Size reduced to '],
  ['Tout annuler', 'Undo everything'],
  ['Génération…', 'Building…'],
  ['Erreur : ', 'Error: '],
  ['aucun fichier', 'no file'],
  ["Éditeur PDF gratuit : modifier le texte en ligne — VoilàPDF",
   'Free PDF editor: edit the text online — VoilàPDF'],
  [' modification', ' change'],
  ['Gras italique', 'Bold italic'],
  ['>Sélection<', '>Selection<'],
  ['>Italique<', '>Italic<'],
  ['>Rétablir<', '>Reset<'],
  ['>Ajuster<', '>Fit<'],
  ['>Normal<', '>Regular<'],
  ['>Gras<', '>Bold<'],
  ['>Texte</label>', '>Text</label>'],
  ['>Police</label>', '>Font</label>'],
  ['>Style</label>', '>Style</label>'],
  ['>Taille</label>', '>Size</label>'],
  ['>Couleur</label>', '>Colour</label>'],
  ['>Fond</label>', '>Background</label>'],
  ['class="lib">Accueil<', 'class="lib">Home<'],
  ['class="lib">Éditer<', 'class="lib">Edit<'],
  ['class="lib">Ajouter<', 'class="lib">Add<'],
  ['class="lib">Masquer<', 'class="lib">Redact<'],
  ['class="lib">Repères<', 'class="lib">Guides<'],
  ['title="Réduire"', 'title="Zoom out"'],
  ['title="Agrandir"', 'title="Zoom in"'],
  ["police d'origine : ", 'original font: '],
  ['largeur ', 'width '],
  [" pt d'origine", ' pt originally'],
  ['— débordement, « Ajuster » le réduit', '— overflowing, “Fit” shrinks it'],
  ['texte ajouté', 'added text'],
  ['zone masquée', 'redacted area'],
  ['Zone masquée. « Rétablir » la supprime.', 'Redacted area. “Reset” removes it.'],
  ['Nouveau texte', 'New text'],
  [' page(s) chargée(s)', ' page(s) loaded'],
  [" modification(s) non enregistrée(s). Revenir à l'accueil ?",
   ' unsaved change(s). Go back to the home page?'],
  ['>Supprimer<', '>Delete<']
];

const DATA = { UI, OUTILS, OPTIONS, PANNEAUX, SUFFIXES, REMPLACEMENTS, IA };
if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
else global.TEXTES = DATA;

})(typeof globalThis !== 'undefined' ? globalThis : this);
