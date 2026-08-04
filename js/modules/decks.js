let jsonFolderHandle = null;
let jsonFolderName = '';
const imageFolderHandles = new Map();

function renderDeckSelect() {
  const select = document.getElementById('deck-select');
  select.innerHTML = decks.map(d => `<option value="${d.id}" ${d.id === activeDeckId ? 'selected' : ''}>${d.name} (${d.cards.length})</option>`).join('');
  const deck = activeDeck();
  document.getElementById('deck-name').value = deck.name;
  renderFolderRows(deck);
}

function renderFolderRows(deck) {
  const usePicker = typeof window.showDirectoryPicker === 'function';
  const jsonPick = document.getElementById('json-folder-pick');
  const imgPick = document.getElementById('image-folder-pick');
  const jsonName = document.getElementById('json-folder-name');
  const imgName = document.getElementById('image-folder-name');
  const jsonFallback = document.getElementById('json-folder-fallback');
  const imgFallback = document.getElementById('image-folder-fallback');
  if (!jsonName) return;

  const jsonFolder = deck.jsonFolder || jsonFolderName || '';
  const imgFolder = deck.imageFolder || '';

  if (usePicker) {
    jsonPick.style.display = '';
    imgPick.style.display = '';
    jsonName.style.display = '';
    imgName.style.display = '';
    jsonFallback.style.display = 'none';
    imgFallback.style.display = 'none';
    jsonName.textContent = jsonFolder;
    imgName.textContent = imgFolder;
  } else {
    jsonPick.style.display = 'none';
    imgPick.style.display = 'none';
    jsonName.style.display = 'none';
    imgName.style.display = 'none';
    jsonFallback.style.display = '';
    imgFallback.style.display = '';
    jsonFallback.value = jsonFolder;
    imgFallback.value = imgFolder;
  }
}

async function pickJsonFolder() {
  if (typeof window.showDirectoryPicker !== 'function') {
    const el = document.getElementById('json-folder-fallback');
    el.style.display = '';
    el.focus();
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    jsonFolderHandle = handle;
    jsonFolderName = handle.name;
    const deck = activeDeck();
    if (deck) deck.jsonFolder = handle.name;
    renderFolderRows(activeDeck());
    showStatus('Dossier JSON choisi : « ' + handle.name + ' ».');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showStatus('Impossible de choisir le dossier JSON.');
  }
}

async function pickImageFolder() {
  if (typeof window.showDirectoryPicker !== 'function') {
    const el = document.getElementById('image-folder-fallback');
    el.style.display = '';
    el.focus();
    return;
  }
  try {
    const deck = activeDeck();
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    deck.imageFolder = handle.name;
    deck.imageFolderPicked = true;
    imageFolderHandles.set(deck.id, handle);
    renderFolderRows(deck);
    showStatus('Dossier des images choisi : « ' + handle.name + ' ».');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showStatus('Impossible de choisir le dossier des images.');
  }
}

function getJsonFolderHandle() {
  return jsonFolderHandle;
}

function getJsonFolderName() {
  return jsonFolderName;
}

function setJsonFolderName(name) {
  jsonFolderName = name || '';
}

function getImageFolderHandle(deck) {
  return imageFolderHandles.get(deck.id) || null;
}

function setDeckJsonFolder(value) {
  jsonFolderName = (value || '').trim();
  const deck = activeDeck();
  if (deck) deck.jsonFolder = jsonFolderName;
}

function setDeckImageFolder(value) {
  const deck = activeDeck();
  if (!deck) return;
  deck.imageFolder = (value || '').trim();
  deck.imageFolderPicked = true;
}

function createDeck() {
  const deck = newDeck('Nouveau deck');
  deck.imageFolder = sanitizeDeckName(deck.name);
  deck.imageFolderPicked = false;
  deck.jsonFolder = jsonFolderName;
  decks.push(deck);
  activeDeckId = deck.id;
  activeCardId = null;
  renderDeckSelect();
  renderCardList();
  loadFaceIntoForm();
  renderPreview();
}

function selectDeck(id) {
  activeDeckId = id;
  activeCardId = null;
  renderDeckSelect();
  renderCardList();
  loadFaceIntoForm();
  renderPreview();
}

function renameDeck(name) {
  const deck = activeDeck();
  deck.name = name;
  if (!deck.imageFolderPicked) deck.imageFolder = sanitizeDeckName(name);
  renderDeckSelect();
}
