/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
/* Emet un defi Altcha.

   Le principe tient en peu de choses : le serveur tire un nombre au hasard, en
   publie l'empreinte sans le nombre, et signe cette empreinte. Le navigateur
   retrouve le nombre par force brute — quelques dixiemes de seconde pour un
   humain, un cout qui s'accumule pour qui veut poster mille fois. Rien n'est
   envoye a un tiers : le defi vient d'ici, la resolution se fait sur place.

   C'est ce qui distingue Altcha de Turnstile, qu'il remplace : aucun appel a
   Cloudflare, donc aucune adresse IP transmise a qui que ce soit, et le site
   redevient entierement sans tiers. */

const crypto = require('crypto');

const ALGO = 'SHA-256';
/* Plafond du nombre a retrouver. 50 000 essais tiennent largement sous la
   seconde sur un telephone, tout en rendant le postage en masse couteux. */
const MAX = 50000;
/* Duree de validite. Assez pour rediger un message, assez court pour qu'un defi
   intercepte ne serve plus a rien. */
const VALIDITE = 15 * 60 * 1000;

const sha256 = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const hmac = (cle, s) => crypto.createHmac('sha256', cle).update(s, 'utf8').digest('hex');

exports.handler = async () => {
  const cle = process.env.ALTCHA_HMAC_KEY;
  if (!cle) {
    return { statusCode: 500, body: JSON.stringify({ erreur: 'config' }) };
  }

  const nombre = crypto.randomInt(0, MAX + 1);
  /* L'echeance voyage dans le sel : elle est donc couverte par la signature et
     ne peut pas etre repoussee par le client. */
  const sel = crypto.randomBytes(12).toString('hex')
            + '?expires=' + Math.floor((Date.now() + VALIDITE) / 1000);
  const defi = sha256(sel + nombre);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({
      algorithm: ALGO,
      challenge: defi,
      salt: sel,
      signature: hmac(cle, defi),
      maxnumber: MAX
    })
  };
};
