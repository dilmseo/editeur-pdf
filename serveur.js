/* VoilaPDF - https://voilapdf.com - GNU AGPL v3, voir LICENSE */
/* Petit serveur local pour l'éditeur PDF.
   Il n'existe que pour l'OCR : depuis un file://, Chrome refuse de construire un
   Worker et de lire les données de langue, donc Tesseract ne peut pas démarrer.
   Rien ne sort de la machine, le serveur n'écoute que sur 127.0.0.1. */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'text/javascript; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pdf' : 'application/pdf',
  '.png' : 'image/png',
  '.ico' : 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, path.normalize(rel).replace(/^[\\/]+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('403'); return; }
  // Un dossier sert son index.html, comme le fait l'hébergeur : c'est ce qui
  // donne aux pages d'outil des adresses du type /pdf-en-word/.
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); }
  catch { /* inexistant : le lecteur ci-dessous répondra 404 */ }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable : ' + rel); return; }
    const ext = path.extname(file).toLowerCase();
    // Les .traineddata.gz sont décompressés par Tesseract lui-même : surtout ne pas
    // annoncer Content-Encoding, sinon le navigateur décompresse et pako échoue.
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

function listen(port, reste){
  server.once('error', e => {
    if (e.code === 'EADDRINUSE' && reste > 0) listen(port + 1, reste - 1);
    else { console.error('Impossible de démarrer :', e.message); process.exit(1); }
  });
  server.listen(port, '127.0.0.1', () => {
    const url = 'http://127.0.0.1:' + port + '/';
    console.log('Éditeur PDF : ' + url);
    console.log('Laisse cette fenêtre ouverte. Ctrl+C pour arrêter.');
    require('child_process').exec('start "" "' + url + '"', { shell: 'cmd.exe' });
  });
}
listen(Number(process.argv[2]) || 8765, 20);
