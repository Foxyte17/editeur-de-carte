function normalizeFace(face) {
  if (CATEGORY_ICON_ALIASES[face.categoryIcon]) face.categoryIcon = CATEGORY_ICON_ALIASES[face.categoryIcon];
  if (!CATEGORY_ICONS[face.categoryIcon]) face.categoryIcon = 'npc';
  if (!TYPE_ICONS[face.typeIcon]) face.typeIcon = 'event';
  return face;
}

function exportCardPng() {
  const card = activeCard();
  if (!card) { showStatus('Aucune carte sélectionnée.'); return; }
  const canvas = document.getElementById('preview-canvas');
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = card.id + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function renderCardToDataUrl(card, then) {
  const off = document.createElement('canvas');
  preloadFaceImage(card.top, () => {
    preloadFaceImage(card.bottom, () => {
      drawCard(off, card);
      then(off.toDataURL('image/png'));
    });
  });
}

function downloadDataUrlAsPng(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportDeckPngs() {
  const deck = activeDeck();
  if (deck.cards.length === 0) {
    showStatus('Ce deck ne contient aucune carte.');
    return;
  }
  let index = 0;
  function next() {
    if (index >= deck.cards.length) {
      showStatus('Toutes les cartes du deck ont été téléchargées (PNG).');
      return;
    }
    const card = deck.cards[index];
    renderCardToDataUrl(card, dataUrl => {
      downloadDataUrlAsPng(dataUrl, card.id + '.png');
      index++;
      setTimeout(next, 300);
    });
  }
  next();
}

function exportDeckJson() {
  const deck = activeDeck();
  if (deck.cards.length === 0) {
    showStatus('Ce deck ne contient aucune carte.');
    return;
  }
  const payload = {
    format: 'CARDS_SPECS',
    deck: {
      name: deck.name,
      cards: deck.cards.map(card => ({
        id: card.id,
        name: card.top.name || card.bottom.name || '',
        image: card.id + '.png'
      }))
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = deck.name.replace(/[^a-z0-9]+/gi, '_') + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showStatus('Deck exporté (JSON conforme CARDS_SPECS).');
}

function saveProjectJson() {
  const deck = activeDeck();
  if (deck.cards.length === 0) {
    showStatus('Ce deck ne contient aucune carte.');
    return;
  }
  const payload = {
    format: 'ORACLE_CARD_EDITOR_PROJECT',
    deckName: deck.name,
    cards: deck.cards.map(card => ({
      id: card.id,
      top: card.top,
      bottom: card.bottom
    }))
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = deck.name.replace(/[^a-z0-9]+/gi, '_') + '-projet.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showStatus('Projet sauvegardé — ce fichier peut être rechargé pour continuer l\'édition.');
}

function loadProjectJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      if (data && data.format === 'CARDS_SPECS') {
        showStatus('Ce fichier est un export final CARDS_SPECS, non réimportable — utilise un fichier de sauvegarde de projet (-projet.json).');
        return;
      }

      const deck = newDeck(data.deckName || 'Deck importé');
      (data.cards || []).forEach(c => {
        const card = newCard();
        card.id = c.id || card.id;
        card.top = normalizeFace(Object.assign(newFace(), c.top || {}));
        card.bottom = normalizeFace(Object.assign(newFace(), c.bottom || {}));
        deck.cards.push(card);
      });
      decks.push(deck);
      activeDeckId = deck.id;
      activeCardId = deck.cards[0] ? deck.cards[0].id : null;
      renderDeckSelect();
      renderCardList();
      setActiveFace('top');
      resetPreviewFlip();
      showStatus(`Projet "${deck.name}" chargé (${deck.cards.length} carte(s)).`);
    } catch (err) {
      showStatus('Fichier illisible — vérifie que c\'est bien un fichier de sauvegarde de projet.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}