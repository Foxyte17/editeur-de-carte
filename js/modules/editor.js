function setActiveFace(key) {
  activeFaceKey = key;
  document.getElementById('tab-face-top').classList.toggle('active', key === 'top');
  document.getElementById('tab-face-bottom').classList.toggle('active', key === 'bottom');
  loadFaceIntoForm();
}

function loadFaceIntoForm() {
  const face = activeFace();
  const disabled = !face;
  ['field-name', 'field-description'].forEach(id => document.getElementById(id).disabled = disabled);

  if (!face) {
    document.getElementById('field-name').value = '';
    document.getElementById('field-description').value = '';
    document.getElementById('crop-section').style.display = 'none';
    renderIconGrids(null);
    renderPreview();
    return;
  }

  document.getElementById('field-name').value = face.name;
  document.getElementById('field-description').value = face.description;
  document.getElementById('pos-left').classList.toggle('active', face.textPosition === 'left');
  document.getElementById('pos-right').classList.toggle('active', face.textPosition === 'right');
  renderIconGrids(face);

  document.getElementById('chk-flipH').checked = face.flipH || false;
  document.getElementById('chk-flipV').checked = face.flipV || false;

  if (face.imageRaw) {
    document.getElementById('crop-section').style.display = 'block';
    document.getElementById('zoom-slider').value = face.crop.zoom;
    document.getElementById('lbl-bright').textContent = face.filters.brightness + '%';
    document.getElementById('lbl-contrast').textContent = face.filters.contrast + '%';
    document.getElementById('lbl-sat').textContent = face.filters.saturation + '%';
    renderCropBox();
  } else {
    document.getElementById('crop-section').style.display = 'none';
  }

  renderPreview();
}

function updateFaceField(field, value) {
  const face = activeFace();
  if (!face) { showStatus('Crée ou sélectionne une carte d\'abord.'); return; }
  face[field] = value;
  if (field === 'textPosition') {
    document.getElementById('pos-left').classList.toggle('active', value === 'left');
    document.getElementById('pos-right').classList.toggle('active', value === 'right');
  }
  if (field === 'name') {
    renderCardList();
  }
  renderPreview();
}

function renderIconGrids(face) {
  const typeGrid = document.getElementById('type-icon-grid');
  const catGrid = document.getElementById('category-icon-grid');

  typeGrid.innerHTML = Object.keys(TYPE_ICONS).map(key => `
    <button class="icon-choice-btn ${face && face.typeIcon === key ? 'active' : ''}" title="${TYPE_ICONS[key].label}" onclick="updateFaceField('typeIcon','${key}'); renderIconGrids(activeFace());">
      ${iconToSvg(TYPE_ICONS[key])}
    </button>`).join('');

  catGrid.innerHTML = Object.keys(CATEGORY_ICONS).map(key => `
    <button class="icon-choice-btn ${face && face.categoryIcon === key ? 'active' : ''}" title="${CATEGORY_ICONS[key].label}" onclick="updateFaceField('categoryIcon','${key}'); renderIconGrids(activeFace());">
      ${iconToSvg(CATEGORY_ICONS[key])}
    </button>`).join('');
}
