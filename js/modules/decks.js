function renderDeckSelect() {
  const select = document.getElementById('deck-select');
  select.innerHTML = decks.map(d => `<option value="${d.id}" ${d.id === activeDeckId ? 'selected' : ''}>${d.name} (${d.cards.length})</option>`).join('');
  document.getElementById('deck-name').value = activeDeck().name;
}

function createDeck() {
  const deck = newDeck('Nouveau deck');
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
  activeDeck().name = name;
  renderDeckSelect();
}
