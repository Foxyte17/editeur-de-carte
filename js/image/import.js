function importDeckJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.format === 'CARDS_SPECS') {
        importCardsSpecsDeck(data);
      } else {
        importLegacyDeck(data);
      }
    } catch (err) {
      showStatus('Fichier illisible — vérifie que c\'est bien un export de cet éditeur.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function importCardsSpecsDeck(data) {
  if (!data.deck || !Array.isArray(data.deck.cards) || data.deck.cards.length === 0) {
    showStatus('Fichier CARDS_SPECS invalide : champ "deck.cards" manquant ou vide.');
    return;
  }
  const deck = newDeck(data.deck.name || 'Deck importé');
  data.deck.cards.forEach(c => {
    const card = newCard();
    card.id = c.id || card.id;
    card.top.name = c.name || '';
    deck.cards.push(card);
  });
  finalizeImport(deck);
  showStatus(`Deck "${deck.name}" importé (${deck.cards.length} carte(s), format CARDS_SPECS).`);
}

function importLegacyDeck(data) {
  const deck = newDeck(data.deckName || 'Deck importé');
  (data.cards || []).forEach(c => {
    const card = newCard();
    card.id = c.id || card.id;
    card.top = Object.assign(newFace(), c.top || {});
    card.bottom = Object.assign(newFace(), c.bottom || {});
    deck.cards.push(card);
  });
  finalizeImport(deck);
  showStatus(`Deck "${deck.name}" importé (${deck.cards.length} carte(s), format historique).`);
}

function finalizeImport(deck) {
  decks.push(deck);
  activeDeckId = deck.id;
  activeCardId = deck.cards[0] ? deck.cards[0].id : null;
  renderDeckSelect();
  renderCardList();
  setActiveFace('top');
}

function handleImageFile(event) {
  const file = event.target.files[0];
  const errEl = document.getElementById('image-error');
  if (errEl) errEl.textContent = '';
  if (!file) return;
  const face = activeFace();
  if (!face) { showStatus('Crée ou sélectionne une carte d\'abord.'); event.target.value = ''; return; }

  const reader = new FileReader();
  reader.onerror = () => {
    if (errEl) errEl.textContent = 'Impossible de lire ce fichier image.';
  };
  reader.onload = e => {
    const img = new Image();
    img.onerror = () => {
      if (errEl) errEl.textContent = 'Impossible de charger cette image (fichier corrompu ou format non supporté).';
    };
    img.onload = () => {
      face.imageNatural = { width: img.naturalWidth, height: img.naturalHeight };
      compressAndStore(face, img, /png|gif|webp/i.test(file.type) ? 'image/png' : 'image/jpeg');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function compressAndStore(face, img, mime) {
  const MAX = 1400;
  const ratio = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  face.imageRaw = canvas.toDataURL(mime || 'image/jpeg', 0.85);
  face.crop = { zoom: 100, x: null, y: null };
  delete face._imgCache;
  document.getElementById('image-error').textContent = '';
  loadFaceIntoForm();
  showStatus('Image importée — tu peux la recadrer et régler les filtres.');
}