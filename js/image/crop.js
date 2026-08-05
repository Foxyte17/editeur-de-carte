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
  preloadFaceImage(face, doRenderCropBox);
}

function doRenderCropBox(face) {
  if (!face || !face.imageNatural) return;
  const box = document.getElementById('crop-box');
  const canvas = document.getElementById('crop-canvas');
  const boxW = box.clientWidth || 260;
  const boxH = boxW / CROP_BOX_RATIO;
  canvas.width = boxW;
  canvas.height = boxH;
  const ctx = canvas.getContext('2d');

  const geo = getCropGeometry(face, CARD_W, HALF_H);
  const ratio = boxW / CARD_W;
  const m = 28, r = 12;

  const img = face._imgCache;

  // Fond = encre de la carte
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, boxW, boxH);

  // Même clip que l'aperçu (marges du cadre doré) pour un rendu synchronisé
  ctx.save();
  ctx.beginPath();
  ctx.moveTo((m + r) * ratio, m * ratio);
  ctx.lineTo((CARD_W - m - r) * ratio, m * ratio);
  ctx.arcTo((CARD_W - m) * ratio, m * ratio, (CARD_W - m) * ratio, (m + r) * ratio, r * ratio);
  ctx.lineTo((CARD_W - m) * ratio, HALF_H * ratio);
  ctx.lineTo(m * ratio, HALF_H * ratio);
  ctx.lineTo(m * ratio, (m + r) * ratio);
  ctx.arcTo(m * ratio, m * ratio, (m + r) * ratio, m * ratio, r * ratio);
  ctx.closePath();
  ctx.clip();

  if (img && img.complete) {
    ctx.filter = `brightness(${face.filters.brightness}%) contrast(${face.filters.contrast}%) saturate(${face.filters.saturation}%)`;
    if (face.flipH || face.flipV) {
      ctx.save();
      if (face.flipH) { ctx.translate(boxW, 0); ctx.scale(-1, 1); }
      if (face.flipV) { ctx.translate(0, boxH); ctx.scale(1, -1); }
      ctx.drawImage(img, geo.x * ratio, geo.y * ratio, geo.drawW * ratio, geo.drawH * ratio);
      ctx.restore();
    } else {
      ctx.drawImage(img, geo.x * ratio, geo.y * ratio, geo.drawW * ratio, geo.drawH * ratio);
    }
    ctx.filter = 'none';
  }
  ctx.restore();

  // Cadre doré
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo((m + r) * ratio, m * ratio);
  ctx.lineTo((CARD_W - m - r) * ratio, m * ratio);
  ctx.arcTo((CARD_W - m) * ratio, m * ratio, (CARD_W - m) * ratio, (m + r) * ratio, r * ratio);
  ctx.lineTo((CARD_W - m) * ratio, HALF_H * ratio);
  ctx.lineTo(m * ratio, HALF_H * ratio);
  ctx.lineTo(m * ratio, (m + r) * ratio);
  ctx.arcTo(m * ratio, m * ratio, (m + r) * ratio, m * ratio, r * ratio);
  ctx.closePath();
  ctx.stroke();

  setupCropDrag(box, boxW, boxH);
}

function setupCropDrag(box, boxW, boxH) {
  const ratio = boxW / CARD_W;
  box.onpointerdown = e => {
    const face = activeFace();
    if (!face) return;
    dragState = { startX: e.clientX, startY: e.clientY, origX: face.crop.x, origY: face.crop.y };
    box.setPointerCapture(e.pointerId);
  };
  box.onpointermove = e => {
    if (!dragState) return;
    const face = activeFace();
    const dx = (e.clientX - dragState.startX) / ratio;
    const dy = (e.clientY - dragState.startY) / ratio;
    face.crop.x = dragState.origX + dx;
    face.crop.y = dragState.origY + dy;
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
