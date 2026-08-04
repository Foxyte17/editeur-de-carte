function renderCardList() {
  const container = document.getElementById('card-list');
  const deck = activeDeck();
  if (deck.cards.length === 0) {
    container.innerHTML = '<p class="legend">Aucune carte pour l\'instant.</p>';
    return;
  }
  container.innerHTML = deck.cards.map(c => {
    const label = escapeHtml(c.top.name || c.bottom.name || '(sans nom)');
    return `<div class="card-list-item ${c.id === activeCardId ? 'active' : ''}" onclick="loadCard('${c.id}')">
      <span>${label}</span>
      <button class="del" onclick="event.stopPropagation(); deleteCard('${c.id}')">✕</button>
    </div>`;
  }).join('');
}

function addNewCard() {
  const card = newCard();
  activeDeck().cards.push(card);
  renderDeckSelect();
  loadCard(card.id);
  resetPreviewFlip();
  showStatus('Nouvelle carte créée et sélectionnée.');
}

function loadCard(id) {
  activeCardId = id;
  activeFaceKey = 'top';
  renderCardList();
  setActiveFace('top');
}

function deleteCard(id) {
  const deck = activeDeck();
  deck.cards = deck.cards.filter(c => c.id !== id);
  if (activeCardId === id) activeCardId = null;
  renderDeckSelect();
  renderCardList();
  loadFaceIntoForm();
  renderPreview();
}
