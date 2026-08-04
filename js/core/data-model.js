function newFace() {
  return {
    name: '',
    description: '',
    typeIcon: 'event',
    categoryIcon: 'npc',
    textPosition: 'right',
    imageRaw: null,
    imageNatural: null,
    crop: { zoom: 100, x: null, y: null },
    filters: { brightness: 100, contrast: 100, saturation: 100 },
    flipH: false,
    flipV: false
  };
}
function newCard() {
  return { id: 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), top: newFace(), bottom: newFace() };
}
function newDeck(name) {
  return {
    id: 'deck-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    name: name || 'Nouveau deck',
    cards: [],
    imageFolder: '',
    imageFolderPicked: false,
    jsonFolder: ''
  };
}

let decks = [newDeck('Mon premier deck')];
let activeDeckId = decks[0].id;
let activeCardId = null;
let activeFaceKey = 'top';
let previewFlipped = false;
let previewZoom = 100;
let dragState = null;
