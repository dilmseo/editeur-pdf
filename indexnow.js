/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
/* Signale les adresses du site aux moteurs qui parlent IndexNow.
       node indexnow.js            toutes les adresses du sitemap
       node indexnow.js /contact/  seulement celles-ci

   Google n'implemente pas IndexNow — et son ancienne URL de « ping » sitemap est
   morte depuis 2023, il n'existe donc plus aucun moyen de le prevenir autrement
   que par Search Console. Bing, Yandex, Seznam et Naver, eux, prennent les URL
   en compte en quelques minutes. Un seul envoi suffit : le protocole partage la
   soumission entre les moteurs participants, inutile de les appeler un par un.

   La cle n'est pas un secret : le protocole exige qu'elle soit lisible a la
   racine du site, c'est precisement ce qui prouve qu'on en est proprietaire. */
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE = 'https://voilapdf.com';
const CLE = '67ffc0350a7cb80c22ef26d6c6a1798b';
const HOTE = 'voilapdf.com';

const sitemap = path.join(__dirname, 'sitemap.xml');
if (!fs.existsSync(sitemap)) {
  console.error('sitemap.xml introuvable : lancez d\'abord `node build-pages.js`.');
  process.exit(1);
}

const args = process.argv.slice(2);
const urls = args.length
  ? args.map(a => (a.startsWith('http') ? a : SITE + (a.startsWith('/') ? a : '/' + a)))
  : [...fs.readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

if (!urls.length) { console.error('aucune adresse a soumettre.'); process.exit(1); }

/* Le protocole plafonne a 10 000 adresses par envoi ; on reste tres en dessous,
   mais le decoupage evite d'avoir a y repenser si le site grossit. */
const LOT = 1000;
const lots = [];
for (let i = 0; i < urls.length; i += LOT) lots.push(urls.slice(i, i + LOT));

function soumettre(liste){
  const corps = JSON.stringify({
    host: HOTE, key: CLE, keyLocation: `${SITE}/${CLE}.txt`, urlList: liste
  });
  return new Promise((ok, non) => {
    const r = https.request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8',
                 'Content-Length': Buffer.byteLength(corps) }
    }, res => {
      let t = '';
      res.on('data', c => t += c);
      res.on('end', () => ok({ code: res.statusCode, corps: t.trim() }));
    });
    r.on('error', non);
    r.write(corps);
    r.end();
  });
}

/* 200 = pris en compte, 202 = accepte mais la cle n'a pas encore ete verifiee
   (normal au premier envoi), 422 = l'URL ne correspond pas a l'hote declare. */
const SENS = {
  200: 'pris en compte',
  202: 'accepte, verification de la cle en cours',
  400: 'requete mal formee',
  403: 'cle refusee : le fichier de preuve est-il en ligne ?',
  422: 'adresses incoherentes avec l\'hote declare',
  429: 'trop de soumissions, reessayer plus tard'
};

(async () => {
  console.log(`${urls.length} adresse(s) en ${lots.length} envoi(s) vers IndexNow.`);
  for (const [i, lot] of lots.entries()){
    try {
      const r = await soumettre(lot);
      console.log(`  envoi ${i + 1}/${lots.length} : HTTP ${r.code} — ${SENS[r.code] || 'reponse inattendue'}`
                  + (r.corps ? ` ${r.corps.slice(0, 120)}` : ''));
    } catch (e) {
      console.log(`  envoi ${i + 1}/${lots.length} : echec reseau — ${e.message}`);
    }
  }
})();
