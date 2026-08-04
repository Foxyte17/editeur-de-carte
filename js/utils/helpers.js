function activeDeck() { return decks.find(d => d.id === activeDeckId); }
function activeCard() { const deck = activeDeck(); return deck ? deck.cards.find(c => c.id === activeCardId) : null; }
function activeFace() { const card = activeCard(); return card ? card[activeFaceKey] : null; }

function sanitizeDeckName(name) { return (name || '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, ''); }

function preloadFaceImage(face, then) {
  if (!face.imageRaw) { then(face); return; }
  if (face._imgCache && face._imgCache.src === face.imageRaw && face._imgCache.complete) { then(face); return; }
  const img = new Image();
  img.onload = () => { face._imgCache = img; then(face); };
  img.onerror = () => {
    showStatus('Une image de carte est illisible — elle a été ignorée dans le rendu.');
    then(face);
  };
  img.src = face.imageRaw;
}

function showStatus(msg) {
  document.getElementById('status-msg').textContent = msg;
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { document.getElementById('status-msg').textContent = ''; }, 2200);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];
  paragraphs.forEach(paragraph => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) { lines.push(''); return; }
    let current = '';
    words.forEach(word => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
  });
  return lines;
}

function iconToSvg(iconDef) {
  const c = document.createElement('canvas');
  c.width = 40; c.height = 40;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = COLORS.parchment;
  ctx.fillStyle = COLORS.parchment;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  iconDef.draw(ctx, 20, 20, 15);
  return `<img src="${c.toDataURL()}" style="width:20px;height:20px;">`;
}
