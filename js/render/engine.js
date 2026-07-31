function drawOrnaments(ctx) {
  ctx.save();
  ctx.strokeStyle = COLORS.brass;

  ctx.lineWidth = 5;
  roundRectStroke(ctx, 15, 15, CARD_W - 30, CARD_H - 30, 12);
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.75;
  roundRectStroke(ctx, 27, 27, CARD_W - 54, CARD_H - 54, 6);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  roundRectStroke(ctx, 35, 35, CARD_W - 70, CARD_H - 70, 4);
  ctx.globalAlpha = 1;

  [40, CARD_W - 40].forEach(x => {
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 120);
    ctx.lineTo(x, CARD_H - 120);
    ctx.stroke();
    ctx.globalAlpha = 0.85;
    for (let y = 150; y < CARD_H - 120; y += 125) {
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 6, y);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x - 6, y);
      ctx.closePath();
      ctx.fillStyle = COLORS.brass;
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;

  [[0, 0, 1, 1], [CARD_W, 0, -1, 1], [0, CARD_H, 1, -1], [CARD_W, CARD_H, -1, -1]].forEach(([ox, oy, sx, sy]) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(sx, sy);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(17, 95);
    ctx.lineTo(17, 30);
    ctx.bezierCurveTo(17, 20, 20, 17, 30, 17);
    ctx.lineTo(95, 17);
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(17, 62);
    ctx.bezierCurveTo(38, 62, 46, 54, 46, 33);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(30, 30, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.brass;
    ctx.fill();
    ctx.restore();
  });

  ctx.strokeStyle = COLORS.brass;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, HALF_H);
  ctx.lineTo(CARD_W - 48, HALF_H);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const mx = CARD_W / 2, my = HALF_H, ms = 32;
  ctx.beginPath();
  ctx.moveTo(mx, my - ms);
  ctx.lineTo(mx + ms, my);
  ctx.lineTo(mx, my + ms);
  ctx.lineTo(mx - ms, my);
  ctx.closePath();
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = COLORS.brassBright;
  ctx.stroke();
  ctx.beginPath();
  const ms2 = 16;
  ctx.moveTo(mx, my - ms2);
  ctx.lineTo(mx + ms2, my);
  ctx.lineTo(mx, my + ms2);
  ctx.lineTo(mx - ms2, my);
  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.brass;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(mx, my, 4, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.brassBright;
  ctx.fill();

  ctx.restore();
}

function roundRectStroke(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

function drawFaceContent(ctx, face) {
  if (face.imageRaw && face.imageNatural) {
  const geo = getCropGeometry(face, CARD_W, HALF_H);
  const img = face._imgCache;
  if (img && img.complete) {
    ctx.save();
    // --- AJOUT : clip aux marges du cadre doré ---
    const m = 15, r = 12;
    ctx.beginPath();
    ctx.moveTo(m + r, m);
    ctx.lineTo(CARD_W - m - r, m);
    ctx.arcTo(CARD_W - m, m, CARD_W - m, m + r, r);
    ctx.lineTo(CARD_W - m, HALF_H);
    ctx.lineTo(m, HALF_H);
    ctx.lineTo(m, m + r);
    ctx.arcTo(m, m, m + r, m, r);
    ctx.closePath();
    ctx.clip();
    // --- fin ajout ---
    ctx.filter = `brightness(${face.filters.brightness}%) contrast(${face.filters.contrast}%) saturate(${face.filters.saturation}%)`;
    if (face.flipH || face.flipV) {
      ctx.save();
      if (face.flipH) { ctx.translate(CARD_W, 0); ctx.scale(-1, 1); }
      if (face.flipV) { ctx.translate(0, HALF_H); ctx.scale(1, -1); }
      ctx.drawImage(img, geo.x, geo.y, geo.drawW, geo.drawH);
      ctx.restore();
    } else {
      ctx.drawImage(img, geo.x, geo.y, geo.drawW, geo.drawH);
    }
    ctx.filter = 'none';
    ctx.restore();
  }
}

  const grad = ctx.createLinearGradient(0, HALF_H * 0.62, 0, HALF_H);
  grad.addColorStop(0, 'rgba(20,24,31,0)');
  grad.addColorStop(1, COLORS.ink);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, HALF_H);

  const bannerY = 68;
  const badgeR = 24;
  ctx.save();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(78, bannerY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLORS.brassBright;
  ctx.fillStyle = COLORS.brassBright;
  ctx.lineWidth = 2.2;
  TYPE_ICONS[face.typeIcon].draw(ctx, 78, bannerY, 15);

  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(CARD_W - 78, bannerY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLORS.brassBright;
  ctx.fillStyle = COLORS.brassBright;
  ctx.lineWidth = 2.2;
  CATEGORY_ICONS[face.categoryIcon].draw(ctx, CARD_W - 78, bannerY, 15);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = COLORS.brassBright;
  ctx.font = '700 30px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 6;
  const title = (face.name || 'Sans titre').toUpperCase();
  ctx.fillText(title, CARD_W / 2, bannerY, CARD_W - 220);
  ctx.restore();

  if (face.description && face.description.trim()) {
    const boxW = CARD_W * 0.38;
    const marginSide = 28;
    const boxX = face.textPosition === 'left' ? marginSide : CARD_W - marginSide - boxW;
    const padding = 18;
    let fontSize = 19;
    let lines, lineHeight;
    const maxBoxHeight = HALF_H - 130;

    do {
      ctx.font = `italic 400 ${fontSize}px "Iowan Old Style", "Palatino Linotype", Georgia, serif`;
      lines = wrapText(ctx, face.description, boxW - padding * 2);
      lineHeight = fontSize * 1.32;
      const h = lines.length * lineHeight + padding * 2;
      if (h <= maxBoxHeight || fontSize <= 12) break;
      fontSize -= 1;
    } while (true);

    const boxH = Math.min(maxBoxHeight, lines.length * lineHeight + padding * 2);
    const boxY = 128 + (maxBoxHeight - boxH) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(20,24,31,0.86)';
    ctx.strokeStyle = COLORS.brass;
    ctx.lineWidth = 1.5;
    roundRectStroke(ctx, boxX, boxY, boxW, boxH, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.parchment;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, boxX + padding, boxY + padding + i * lineHeight);
    });
    ctx.restore();
  }
}

function preloadFaceImage(face, then) {
  if (!face.imageRaw) { then(); return; }
  if (face._imgCache && face._imgCache.src === face.imageRaw && face._imgCache.complete) { then(); return; }
  const img = new Image();
  img.onload = () => { face._imgCache = img; then(); };
  img.onerror = () => {
    showStatus('Une image de carte est illisible — elle a été ignorée dans le rendu.');
    then();
  };
  img.src = face.imageRaw;
}

function drawHalf(ctx, face) {
  drawFaceContent(ctx, face);
}

function drawCard(canvas, card) {
  const ctx = canvas.getContext('2d');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  drawHalf(ctx, card.top);

  ctx.save();
  ctx.translate(CARD_W, CARD_H);
  ctx.rotate(Math.PI);
  drawHalf(ctx, card.bottom);
  ctx.restore();

  drawOrnaments(ctx);
}

function renderPreview() {
  const canvas = document.getElementById('preview-canvas');
  const card = activeCard();
  if (!card) {
    const ctx = canvas.getContext('2d');
    canvas.width = CARD_W; canvas.height = CARD_H;
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = COLORS.parchmentDim;
    ctx.font = '20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sélectionne ou crée une carte', CARD_W / 2, CARD_H / 2);
    return;
  }
  preloadFaceImage(card.top, () => {
    preloadFaceImage(card.bottom, () => {
      drawCard(canvas, card);
    });
  });
}

function togglePreviewFlip() {
  previewFlipped = !previewFlipped;
  document.getElementById('preview-canvas').classList.toggle('flipped', previewFlipped);
}
