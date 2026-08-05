function setActiveFace(key) {
  activeFaceKey = key;
  previewFlipped = key === 'bottom';
  const canvas = document.getElementById('preview-canvas');
  if (canvas) canvas.classList.toggle('flipped', previewFlipped);
  const btn = document.getElementById('btn-flip-preview');
  if (btn) {
    btn.classList.toggle('active', previewFlipped);
    btn.textContent = previewFlipped ? '↻ Haut' : '↻ Bas';
  }
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
    renderIconSlots(null);
    renderPreview();
    return;
  }

  document.getElementById('field-name').value = face.name;
  document.getElementById('field-description').value = face.description;
  document.getElementById('pos-left').classList.toggle('active', face.textPosition === 'left');
  document.getElementById('pos-right').classList.toggle('active', face.textPosition === 'right');
  renderIconSlots(face);

  document.getElementById('btn-flipH').classList.toggle('active', !!face.flipH);
  document.getElementById('btn-flipV').classList.toggle('active', !!face.flipV);

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

function toggleFlip(field) {
  const face = activeFace();
  if (!face) { showStatus('Crée ou sélectionne une carte d\'abord.'); return; }
  face[field] = !face[field];
  const btn = document.getElementById(field === 'flipH' ? 'btn-flipH' : 'btn-flipV');
  if (btn) {
    btn.classList.toggle('active', face[field]);
    btn.setAttribute('aria-pressed', String(face[field]));
  }
  renderCropBox();
  renderPreview();
}

function renderIconSlots(face) {
  const tKey = (face && face.typeIcon) || 'event';
  const cKey = (face && face.categoryIcon) || 'npc';
  const typeCurrent = document.getElementById('type-icon-current');
  const catCurrent = document.getElementById('category-icon-current');
  if (typeCurrent) typeCurrent.innerHTML = iconToSvg(TYPE_ICONS[tKey] || TYPE_ICONS.event);
  if (catCurrent) catCurrent.innerHTML = iconToSvg(CATEGORY_ICONS[cKey] || CATEGORY_ICONS.npc);

  const typeTray = document.getElementById('type-icon-tray');
  const catTray = document.getElementById('category-icon-tray');
  if (typeTray) typeTray.innerHTML = Object.keys(TYPE_ICONS).map(key => `
    <button class="icon-choice-btn ${face && face.typeIcon === key ? 'active' : ''}" title="${TYPE_ICONS[key].label}" onclick="updateFaceField('typeIcon','${key}'); renderIconSlots(activeFace());">
      ${iconToSvg(TYPE_ICONS[key])}
    </button>`).join('');
  if (catTray) catTray.innerHTML = Object.keys(CATEGORY_ICONS).map(key => `
    <button class="icon-choice-btn ${face && face.categoryIcon === key ? 'active' : ''}" title="${CATEGORY_ICONS[key].label}" onclick="updateFaceField('categoryIcon','${key}'); renderIconSlots(activeFace());">
      ${iconToSvg(CATEGORY_ICONS[key])}
    </button>`).join('');

  closeIconTrays();
}

function toggleIconTray(kind) {
  const slot = document.getElementById(kind + '-icon-slot');
  const tray = document.getElementById(kind + '-icon-tray');
  const other = kind === 'type' ? 'category' : 'type';
  const otherSlot = document.getElementById(other + '-icon-slot');
  const otherTray = document.getElementById(other + '-icon-tray');
  const opening = tray && !tray.classList.contains('open');
  closeIconTrays();
  if (opening) {
    tray.classList.add('open');
    if (slot) slot.classList.add('active');
  }
  if (otherTray) otherTray.classList.remove('open');
  if (otherSlot) otherSlot.classList.remove('active');
}

function closeIconTrays() {
  ['type', 'category'].forEach(kind => {
    const tray = document.getElementById(kind + '-icon-tray');
    const slot = document.getElementById(kind + '-icon-slot');
    if (tray) tray.classList.remove('open');
    if (slot) slot.classList.remove('active');
  });
}
