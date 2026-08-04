function normalizeFace(face) {
  if (CATEGORY_ICON_ALIASES[face.categoryIcon]) face.categoryIcon = CATEGORY_ICON_ALIASES[face.categoryIcon];
  if (!CATEGORY_ICONS[face.categoryIcon]) face.categoryIcon = 'npc';
  if (!TYPE_ICONS[face.typeIcon]) face.typeIcon = 'event';
  return face;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function writeBlobToFolder(handle, filename, blob) {
  const fileHandle = await handle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function exportCardPng() {
  const card = activeCard();
  if (!card) { showStatus('Aucune carte sélectionnée.'); return; }
  const deck = activeDeck();
  const handle = getImageFolderHandle(deck);
  const canvas = document.getElementById('preview-canvas');
  canvas.toBlob(blob => {
    if (handle) {
      writeBlobToFolder(handle, card.id + '.png', blob).then(() => {
        showStatus('Carte enregistrée dans « ' + (deck.imageFolder || handle.name) + ' ».');
      }).catch(() => {
        downloadBlob(blob, card.id + '.png');
        showStatus('Écriture dans le dossier impossible - PNG téléchargé.');
      });
      return;
    }
    downloadBlob(blob, card.id + '.png');
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
  const handle = getImageFolderHandle(deck);
  let index = 0;
  function next() {
    if (index >= deck.cards.length) {
      showStatus(handle
        ? deck.cards.length + ' carte(s) enregistrée(s) dans « ' + deck.imageFolder + ' ».'
        : 'Toutes les cartes du deck ont été téléchargées (PNG).');
      return;
    }
    const card = deck.cards[index];
    renderCardToDataUrl(card, dataUrl => {
      if (handle) {
        writeBlobToFolder(handle, card.id + '.png', dataUrlToBlob(dataUrl)).then(() => {
          index++;
          next();
        }).catch(() => {
          downloadDataUrlAsPng(dataUrl, card.id + '.png');
          index++;
          next();
        });
        return;
      }
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
  const folder = deck.imageFolder || '';
  const prefix = folder ? folder + '/' : '';
  const payload = {
    format: 'CARDS_SPECS',
    deck: {
      name: deck.name,
      cards: deck.cards.map(card => ({
        id: card.id,
        name: card.top.name || card.bottom.name || '',
        image: prefix + card.id + '.png'
      }))
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const filename = deck.name.replace(/[^a-z0-9]+/gi, '_') + '.json';
  const jsonFolder = deck.jsonFolder || getJsonFolderName() || '';
  const handle = getJsonFolderHandle();
  if (handle) {
    writeBlobToFolder(handle, filename, blob).then(() => {
      showStatus(folder
        ? 'Deck exporté dans « ' + jsonFolder + ' » - images référencées dans « ' + folder + ' ».'
        : 'Deck exporté dans « ' + jsonFolder + ' » - images à côté du JSON.');
    }).catch(() => {
      downloadBlob(blob, filename);
      showStatus('Écriture dans le dossier impossible - JSON téléchargé.');
    });
    return;
  }
  downloadBlob(blob, filename);
  showStatus(folder
    ? 'Deck exporté (JSON conforme CARDS_SPECS) - images référencées dans « ' + folder + ' ».'
    : 'Deck exporté (JSON conforme CARDS_SPECS) - images à côté du JSON.');
}

function saveProjectJson() {
  const deck = activeDeck();
  if (deck.cards.length === 0) {
    showStatus('Ce deck ne contient aucune carte.');
    return;
  }
  const payload = {
    format: 'ORACLE_CARD_EDITOR_PROJECT',
    cropSpace: 'card',
    deckName: deck.name,
    imageFolder: deck.imageFolder,
    imageFolderPicked: deck.imageFolderPicked,
    jsonFolder: deck.jsonFolder || getJsonFolderName() || '',
    cards: deck.cards.map(card => ({
      id: card.id,
      top: card.top,
      bottom: card.bottom
    }))
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  downloadBlob(blob, deck.name.replace(/[^a-z0-9]+/gi, '_') + '-projet.json');
  showStatus('Projet sauvegardé - ce fichier peut être rechargé pour continuer l\'édition.');
}

function loadProjectJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      if (data && data.format === 'CARDS_SPECS') {
        showStatus('Ce fichier est un export final CARDS_SPECS, non réimportable - utilise un fichier de sauvegarde de projet (-projet.json).');
        return;
      }

      const deck = newDeck(data.deckName || 'Deck importé');
      deck.imageFolder = data.imageFolder || sanitizeDeckName(deck.name);
      deck.imageFolderPicked = Boolean(data.imageFolder);
      deck.jsonFolder = data.jsonFolder || getJsonFolderName() || '';
      if (deck.jsonFolder) setJsonFolderName(deck.jsonFolder);
      const isCardSpace = data.cropSpace === 'card';
      (data.cards || []).forEach(c => {
        const card = newCard();
        card.id = c.id || card.id;
        card.top = normalizeFace(Object.assign(newFace(), c.top || {}));
        card.bottom = normalizeFace(Object.assign(newFace(), c.bottom || {}));
        if (!isCardSpace) {
          card.top.crop = { zoom: 100, x: null, y: null };
          card.bottom.crop = { zoom: 100, x: null, y: null };
        }
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
      showStatus('Fichier illisible - vérifie que c\'est bien un fichier de sauvegarde de projet.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
