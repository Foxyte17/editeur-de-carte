function getCropGeometry(face, boxW, boxH) {
  const iw = face.imageNatural.width;
  const ih = face.imageNatural.height;
  const baseScale = Math.max(boxW / iw, boxH / ih);
  const scale = baseScale * (face.crop.zoom / 100);
  const drawW = iw * scale;
  const drawH = ih * scale;

  if (face.crop.x === null) { face.crop.x = (boxW - drawW) / 2; }
  if (face.crop.y === null) { face.crop.y = (boxH - drawH) / 2; }

  const minX = boxW - drawW, maxX = 0;
  const minY = boxH - drawH, maxY = 0;
  face.crop.x = Math.min(maxX, Math.max(minX, face.crop.x));
  face.crop.y = Math.min(maxY, Math.max(minY, face.crop.y));

  return { drawW, drawH, x: face.crop.x, y: face.crop.y };
}

function renderCropBox() {
  const face = activeFace();
  if (!face || !face.imageRaw) return;
  const box = document.getElementById('crop-box');
  const canvas = document.getElementById('crop-canvas');
  const boxW = box.clientWidth || 260;
  const boxH = boxW / CROP_BOX_RATIO;
  canvas.width = boxW;
  canvas.height = boxH;
  const ctx = canvas.getContext('2d');

  const geo = getCropGeometry(face, boxW, boxH);
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, boxW, boxH);
    ctx.filter = `brightness(${face.filters.brightness}%) contrast(${face.filters.contrast}%) saturate(${face.filters.saturation}%)`;
    ctx.drawImage(img, geo.x, geo.y, geo.drawW, geo.drawH);
    ctx.filter = 'none';
  };
  img.src = face.imageRaw;

  setupCropDrag(box, boxW, boxH);
}

function setupCropDrag(box, boxW, boxH) {
  box.onpointerdown = e => {
    const face = activeFace();
    if (!face) return;
    dragState = { startX: e.clientX, startY: e.clientY, origX: face.crop.x, origY: face.crop.y };
    box.setPointerCapture(e.pointerId);
  };
  box.onpointermove = e => {
    if (!dragState) return;
    const face = activeFace();
    face.crop.x = dragState.origX + (e.clientX - dragState.startX);
    face.crop.y = dragState.origY + (e.clientY - dragState.startY);
    renderCropBox();
    renderPreview();
  };
  box.onpointerup = () => { dragState = null; };
  box.onpointercancel = () => { dragState = null; };
}

function updateZoom(value) {
  const face = activeFace();
  if (!face) return;
  face.crop.zoom = Number(value);
  renderCropBox();
  renderPreview();
}

function updateFilter(kind, value) {
  const face = activeFace();
  if (!face) return;
  face.filters[kind] = Number(value);
  const labelMap = { brightness: 'lbl-bright', contrast: 'lbl-contrast', saturation: 'lbl-sat' };
  document.getElementById(labelMap[kind]).textContent = value + '%';
  renderCropBox();
  renderPreview();
}
