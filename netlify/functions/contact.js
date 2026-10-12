/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
/* Verification du defi Altcha, puis transmission a Netlify Forms.

   C'est la seule partie du site qui s'execute sur un serveur, et elle existe
   pour une raison precise : un controle anti-robot pose dans une page ne prouve
   rien tant que personne n'a verifie sa resolution avec une cle que le
   navigateur ne possede pas. Le formulaire passe donc par ici, et seulement lui
   — les outils PDF ne touchent jamais au reseau.

   Turnstile faisait ce travail jusqu'ici, mais au prix d'un appel a Cloudflare
   depuis la page, donc d'une adresse IP transmise a un tiers sur un site dont
   tout l'argument est qu'aucun tiers ne voit rien. Altcha fait la meme chose
   sans quitter le domaine : le defi vient de notre propre fonction, la
   resolution a lieu dans l'onglet, la verification ici.

   La cle est lue dans l'environnement Netlify (ALTCHA_HMAC_KEY) et n'apparait
   nulle part dans le depot, qui est public. */

const crypto = require('crypto');

const SITE = 'https://voilapdf.com';

/* Limites. Netlify plafonne la charge utile d'une fonction synchrone a 6 Mo ;
   le fichier voyage en base64, ce qui l'alourdit d'environ un tiers. On s'arrete
   donc bien en dessous, et la page annonce la meme valeur. */
const MAX_FICHIER = 3 * 1024 * 1024;
const MAX_TEXTE = 8000;

const TYPES = {
  'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg',
  'image/webp': 'webp', 'text/plain': 'txt'
};

const sha256 = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const hmac = (cle, s) => crypto.createHmac('sha256', cle).update(s, 'utf8').digest('hex');

/* Comparaison a duree constante : comparer deux signatures avec === laisse
   fuiter, par le temps de reponse, le nombre d'octets corrects au debut. */
function memeChaine(a, b){
  const x = Buffer.from(String(a), 'utf8'), y = Buffer.from(String(b), 'utf8');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/* Trois conditions, toutes necessaires : le defi n'a pas expire, le nombre
   annonce redonne bien l'empreinte publiee, et cette empreinte porte notre
   signature. La derniere est celle qui compte — sans elle, n'importe qui
   fabriquerait son propre defi et le resoudrait. */
function verifierAltcha(charge, cle){
  let d;
  try { d = JSON.parse(Buffer.from(charge, 'base64').toString('utf8')); }
  catch { return false; }
  if (!d || d.algorithm !== 'SHA-256') return false;
  if (typeof d.salt !== 'string' || typeof d.challenge !== 'string') return false;
  if (!Number.isInteger(d.number) || d.number < 0) return false;

  const ech = /[?&]expires=(\d+)/.exec(d.salt);
  if (!ech || Number(ech[1]) * 1000 < Date.now()) return false;

  if (!memeChaine(sha256(d.salt + d.number), d.challenge)) return false;
  return memeChaine(hmac(cle, d.challenge), d.signature);
}

const reponse = (code, corps) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify(corps)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reponse(405, { erreur: 'methode' });

  let d;
  try { d = JSON.parse(event.body || '{}'); }
  catch { return reponse(400, { erreur: 'illisible' }); }

  /* Piege a robots : un champ invisible qu'un humain ne remplit jamais. On
     repond 200 pour ne pas apprendre au robot qu'il a ete repere. */
  if (d.site) return reponse(200, { ok: true });

  const nom = String(d.nom || '').trim().slice(0, 120);
  const email = String(d.email || '').trim().slice(0, 200);
  const sujet = String(d.sujet || '').trim().slice(0, 60);
  const message = String(d.message || '').trim().slice(0, MAX_TEXTE);

  if (!nom || !message) return reponse(400, { erreur: 'champs' });
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return reponse(400, { erreur: 'email' });

  const cle = process.env.ALTCHA_HMAC_KEY;
  if (!cle) return reponse(500, { erreur: 'config' });

  // --- 1. le defi a-t-il reellement ete resolu ? ---
  if (!verifierAltcha(String(d.jeton || ''), cle)) return reponse(403, { erreur: 'refus' });

  // --- 2. la piece jointe, si elle existe ---
  const fd = new FormData();
  fd.set('form-name', 'contact');
  fd.set('nom', nom);
  fd.set('email', email);
  fd.set('sujet', sujet || 'autre');
  fd.set('message', message);

  if (d.fichier && d.fichier.donnees) {
    const type = String(d.fichier.type || '');
    if (!TYPES[type]) return reponse(400, { erreur: 'type' });
    let octets;
    try { octets = Buffer.from(d.fichier.donnees, 'base64'); }
    catch { return reponse(400, { erreur: 'fichier' }); }
    if (!octets.length || octets.length > MAX_FICHIER) return reponse(413, { erreur: 'taille' });
    /* Le nom d'origine est nettoye : il finira dans une interface et dans un
       nom de fichier, deux endroits ou une barre oblique ne doit pas arriver. */
    const propre = String(d.fichier.nom || 'piece-jointe')
      .replace(/[^\w.\- ]+/g, '_').slice(0, 80) || ('piece-jointe.' + TYPES[type]);
    fd.set('fichier', new Blob([octets], { type }), propre);
  }

  // --- 3. depot dans la boite Netlify Forms ---
  try {
    const r = await fetch(SITE + '/contact/', { method: 'POST', body: fd });
    if (!r.ok) return reponse(502, { erreur: 'depot', code: r.status });
  } catch {
    return reponse(502, { erreur: 'depot' });
  }

  return reponse(200, { ok: true });
};
