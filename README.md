# VoilàPDF

Modifier le texte d'un PDF dans le navigateur. Rien n'est téléversé : le fichier
est lu, modifié et réenregistré dans l'onglet, sans serveur et sans appel réseau.

## Utiliser

**En ligne** — ouvrir l'adresse du site, déposer un PDF.

**Hors ligne** — ouvrir `index.html` directement dans Chrome. Tout fonctionne
*sauf l'OCR* : depuis un `file://`, Chrome refuse de construire un Worker
(`Script at 'file://…' cannot be accessed from origin 'null'`) et de lire les
données de langue. Pour l'OCR en local, lancer `Editeur PDF.cmd`, qui démarre
`serveur.js` sur `127.0.0.1` et ouvre le navigateur.

## Les outils

| Outil | Ce qu'il fait |
|---|---|
| **Éditer** | Clic sur un bloc de texte, saisie sur place |
| **Ajouter** | Clic pour poser un nouveau texte |
| **Masquer** | Glisser pour couvrir une zone |
| **Repères** | Encadre tous les blocs modifiables |
| **OCR** | Reconnaît le texte des pages scannées et les rend modifiables |

Le panneau de droite règle le texte, la police, la taille, la couleur et le fond
du bloc sélectionné. « Ajuster » réduit la taille jusqu'à tenir dans la largeur
d'origine ; le panneau signale les débordements.

## Comment ça marche

pdf.js donne la position, la ligne de base et la largeur exactes de chaque
fragment de texte ; les fragments d'une même ligne sont regroupés en un bloc
éditable. À l'enregistrement, pdf-lib recouvre l'ancienne ligne d'un rectangle
à la couleur du fond relevée sur le rendu, puis réécrit le nouveau texte sur la
même ligne de base.

## Limites, mesurées

- **Le texte d'origine reste dans le fichier.** C'est un recouvrement visuel, pas
  un caviardage : un copier-coller ou `pdftotext` retrouve l'ancien texte. Ne pas
  s'en servir pour masquer une donnée sensible.
- **Les polices ne sont pas réemployées.** Le texte est réécrit dans l'une des 14
  polices standard du PDF (Helvetica, Times, Courier). La famille est lue dans les
  métadonnées pdf.js et le gras retrouvé en comparant la largeur réelle aux
  métriques — à 0,2 % près contre 3,4 % pour la mauvaise graisse.
- **L'italique n'est pas détectable** : le nom interne de la police ne le dit pas
  et les largeurs sont identiques à celles du romain. Mesurer la pente de l'encre
  s'est révélé faux (3 lignes droites sur 4 marquées italiques), donc abandonné.
  À régler à la main dans « Style ».
- **Caractères** : tout le latin-1 plus les apostrophes, tirets et symboles
  typographiques (œ € – — ' " …). Hors de ce répertoire (CJK, symboles rares),
  le caractère est remplacé par `?` plutôt que de faire échouer l'enregistrement.
- **OCR** : français uniquement, et la mise en page reconnue reste une
  approximation — la taille de chaque ligne est recalée sur sa largeur mesurée.

## Dépendances, toutes embarquées dans `vendor/`

| Bibliothèque | Rôle | Licence |
|---|---|---|
| [pdf.js](https://github.com/mozilla/pdf.js) 3.11 | lecture, rendu, position du texte | Apache-2.0 |
| [pdf-lib](https://github.com/Hopding/pdf-lib) 1.17 | réécriture du PDF | MIT |
| [tesseract.js](https://github.com/naptha/tesseract.js) 5.1 | OCR | Apache-2.0 |
| [tessdata](https://github.com/tesseract-ocr/tessdata) `fra` 4.0 | données de langue | Apache-2.0 |

Seuls `tesseract-core-simd-lstm.wasm.js` (SIMD) et son repli `-lstm` sont
embarqués : ce sont les seuls que tesseract.js demande avec `oem: 1`.
