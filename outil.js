/* Convertisseur d'une page d'outil. La page déclare window.OUTIL_COURANT (la clé
   du catalogue) ; tout le reste est câblé ici. */
(() => {
'use strict';

const $ = id => document.getElementById(id);
const cle = window.OUTIL_COURANT;
const O = OUTILS_DATA.OUTILS[cle];
if (!O) return;

const APPELS = {
  pdfVersDocx:   (f, p) => Conv.pdfVersDocx(f[0], p),
  pdfVersXlsx:   (f, p) => Conv.pdfVersXlsx(f[0], p),
  pdfVersPptx:   (f, p) => Conv.pdfVersPptx(f[0], p),
  pdfVersJpg:    (f, p) => Conv.pdfVersJpg(f[0], p),
  pdfVersPng:    (f, p) => Conv.pdfVersPng(f[0], p),
  docxVersPdf:   (f, p) => Conv.docxVersPdf(f[0], p),
  xlsxVersPdf:   (f, p) => Conv.xlsxVersPdf(f[0], p),
  pptxVersPdf:   (f, p) => Conv.pptxVersPdf(f[0], p),
  imagesVersPdf: (f, p) => Conv.imagesVersPdf(f, p),
  fusionnerPdf:  (f, p) => Conv.fusionnerPdf(f, p)
};

let fichiers = [];
const entree = $('fichier');
entree.accept = O.accept;
entree.multiple = !!O.multiple;

const poids = n => n < 1024 ? n + ' o'
                 : n < 1048576 ? (n / 1024).toFixed(0) + ' Ko'
                 : (n / 1048576).toFixed(1) + ' Mo';

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
    const b = document.createElement('button'); b.textContent = 'Retirer';
    b.onclick = () => { fichiers.splice(i, 1); majListe(); };
    li.append(n, t, b); ul.append(li);
  });
  $('go').disabled = !fichiers.length;
  $('go').textContent = fichiers.length > 1 ? `Convertir les ${fichiers.length} fichiers` : 'Convertir';
}

function ajouter(liste){
  const fs = [...liste];
  if (!fs.length) return;
  fichiers = O.multiple ? fichiers.concat(fs) : [fs[0]];
  cacher(); majListe();
}

entree.onchange = e => ajouter(e.target.files);
$('encore').onclick = () => { fichiers = []; entree.value = ''; cacher(); majListe(); };

['dragover', 'drop'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
document.addEventListener('dragover', () => $('zone').classList.add('over'));
document.addEventListener('dragleave', e => { if (!e.relatedTarget) $('zone').classList.remove('over'); });
document.addEventListener('drop', e => {
  $('zone').classList.remove('over');
  ajouter(e.dataTransfer?.files || []);
});

$('go').onclick = async () => {
  if (!fichiers.length) return;
  cacher();
  $('go').disabled = true;
  $('barre').hidden = false; $('etat').hidden = false;
  $('etat').textContent = 'Lecture du fichier…';
  const avance = p => {
    $('barre').firstElementChild.style.width = Math.round(p * 100) + '%';
    $('etat').textContent = 'Conversion… ' + Math.round(p * 100) + ' %';
  };
  try {
    const r = await APPELS[O.fonction](fichiers, avance);
    avance(1);
    $('barre').hidden = true; $('etat').hidden = true;
    $('fini-nom').textContent = r.nom + ' — ' + poids(r.blob.size);
    $('dl').href = URL.createObjectURL(r.blob);
    $('dl').download = r.nom;
    $('fini').hidden = false;
    $('fini').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    console.error(e);
    $('barre').hidden = true; $('etat').hidden = true;
    $('err').textContent = 'Conversion impossible : ' + (e.message || e);
    $('err').hidden = false;
  }
  $('go').disabled = false;
};

majListe();
})();
