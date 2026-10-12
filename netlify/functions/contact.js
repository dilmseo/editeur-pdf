/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
/* Verification du jeton Turnstile, puis transmission a Netlify Forms.

   C'est la seule partie du site qui s'execute sur un serveur, et elle existe
   pour une raison precise : un widget Turnstile pose dans une page ne prouve
   rien tant que personne n'a demande a Cloudflare si le jeton est authentique.
   Cette verification exige la cle secrete, qui ne peut pas vivre dans le
   navigateur. Le formulaire passe donc par ici, et seulement lui — les outils
   PDF, eux, ne touchent jamais au reseau.

   La cle secrete est lue dans l'environnement Netlify (TURNSTILE_SECRET) et
   n'apparait nulle part dans le depot, qui est public. */

const SITE = 'https://voilapdf.com';
const VERIF = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/* Limites. Netlify plafonne la charge utile d'une fonction synchrone a 6 Mo ;
   le fichier voyage en base64, ce qui l'alourdit d'environ un tiers. On s'arrete
   donc bien en dessous, et la page annonce la meme valeur. */
const MAX_FICHIER = 3 * 1024 * 1024;
const MAX_TEXTE = 8000;

const TYPES = {
  'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg',
  'image/webp': 'webp', 'text/plain': 'txt'
};

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

  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return reponse(500, { erreur: 'config' });

  // --- 1. le jeton est-il authentique ? ---
  const jeton = String(d.jeton || '');
  if (!jeton) return reponse(400, { erreur: 'jeton' });

  const form = new URLSearchParams({ secret, response: jeton });
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'];
  if (ip) form.set('remoteip', ip);

  let verdict;
  try {
    const r = await fetch(VERIF, {
      method: 'POST', body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    verdict = await r.json();
  } catch {
    return reponse(502, { erreur: 'verification' });
  }
  if (!verdict.success) return reponse(403, { erreur: 'refus', codes: verdict['error-codes'] || [] });

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
