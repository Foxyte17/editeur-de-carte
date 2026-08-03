// ---- Normalisation de taille : toutes les icônes (type + catégorie) occupent la même empreinte ----
function _measureIcon(iconDef, r) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let lineW = 0;
  let current = null;
  const stack = [];
  let tx = 0, ty = 0, sx = 1, sy = 1;
  function includePoint(px, py) {
    const x = tx + px * sx, y = ty + py * sy;
    const m = lineW / 2;
    if (x - m < minX) minX = x - m;
    if (x + m > maxX) maxX = x + m;
    if (y - m < minY) minY = y - m;
    if (y + m > maxY) maxY = y + m;
  }
  function includeArc(x, y, rad, a0, a1) {
    const cx0 = tx + x * sx, cy0 = ty + y * sy;
    const rr = rad * sx;
    let span = a1 - a0;
    while (span < 0) span += Math.PI * 2;
    includePoint(cx0 + Math.cos(a0) * rr, cy0 + Math.sin(a0) * rr);
    includePoint(cx0 + Math.cos(a1) * rr, cy0 + Math.sin(a1) * rr);
    for (const t of [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]) {
      if (t >= a0 && t <= a0 + span) includePoint(cx0 + Math.cos(t) * rr, cy0 + Math.sin(t) * rr);
    }
  }
  function includeCmd(p) {
    const t = p[0];
    if (t === 'M' || t === 'L') includePoint(p[1], p[2]);
    else if (t === 'A') includeArc(p[1], p[2], p[3], p[4], p[5]);
    else if (t === 'Q') { includePoint(p[1], p[2]); includePoint(p[3], p[4]); }
    else if (t === 'B') { includePoint(p[1], p[2]); includePoint(p[3], p[4]); includePoint(p[5], p[6]); }
  }
  const rec = {
    save() { stack.push({ tx, ty, sx, sy }); },
    restore() { const s = stack.pop(); if (s) { tx = s.tx; ty = s.ty; sx = s.sx; sy = s.sy; } },
    translate(x, y) { tx += x; ty += y; },
    scale(x, y) { sx *= x; sy *= y; },
    beginPath() { current = []; },
    moveTo(x, y) { if (current) current.push(['M', x, y]); },
    lineTo(x, y) { if (current) current.push(['L', x, y]); },
    arc(x, y, rad, a0, a1) { if (current) current.push(['A', x, y, rad, a0, a1]); },
    quadraticCurveTo(x1, y1, x, y) { if (current) current.push(['Q', x1, y1, x, y]); },
    bezierCurveTo(x1, y1, x2, y2, x, y) { if (current) current.push(['B', x1, y1, x2, y2, x, y]); },
    closePath() {},
    stroke() { if (current) { current.forEach(includeCmd); current = null; } },
    fill() { if (current) { current.forEach(includeCmd); current = null; } },
    set lineWidth(v) { lineW = v; }
  };
  iconDef.draw(rec, 0, 0, r);
  if (current) current.forEach(includeCmd);
  return { minX, maxX, minY, maxY };
}

function _normalizeIcon(iconDef, targetHalf) {
  const bb = _measureIcon(iconDef, 1);
  const extent = Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY) / 2;
  if (!(extent > 0)) return iconDef;
  const scale = targetHalf / extent;
  return {
    label: iconDef.label,
    draw(ctx, cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      iconDef.draw(ctx, 0, 0, r);
      ctx.restore();
    }
  };
}

const TYPE_ICONS = {
  event: _normalizeIcon({
    label: 'Événement',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.6);
      ctx.lineTo(cx, cy + r * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.55, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  quest: _normalizeIcon({
    label: 'Quête',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.25, r * 0.35, Math.PI * 1.1, Math.PI * 2.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.02);
      ctx.lineTo(cx, cy + r * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.55, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  danger: _normalizeIcon({
    label: 'Danger',
    draw(ctx, cx, cy, r) {
      // Logo biohazard : 3 bras à 120° + pastilles aux extrémités + « ! » central
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.11;
      const armR = r * 0.52;
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(cx, cy, armR, a - Math.PI * 0.33, a + Math.PI * 0.33);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * armR, cy + Math.sin(a) * armR, r * 0.13, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = r * 0.13;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.22);
      ctx.lineTo(cx, cy + r * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.15, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.6),
  unexpected: _normalizeIcon({
    label: 'Inattendu',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.1, cy - r * 0.65);
      ctx.lineTo(cx - r * 0.45, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.25, cy + r * 0.65);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6)
};

const CATEGORY_ICONS = {
  npc: _normalizeIcon({
    label: 'PNJ',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.32, r * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + r * 0.65);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.05, cx - r * 0.28, cy + r * 0.2, cx, cy + r * 0.2);
      ctx.bezierCurveTo(cx + r * 0.28, cy + r * 0.2, cx + r * 0.5, cy + r * 0.05, cx + r * 0.5, cy + r * 0.65);
      ctx.stroke();
    }
  }, 0.6),
  monster: _normalizeIcon({
    label: 'Monstre',
    draw(ctx, cx, cy, r) {
      // Visage rond (emoji) : pointe + cornes sur le bord, barbe en bas, yeux en « trous »
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.09;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.55);
      ctx.lineTo(cx, cy - r * 0.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.42, cy - r * 0.3);
      ctx.quadraticCurveTo(cx - r * 0.74, cy - r * 0.32, cx - r * 0.56, cy - r * 0.62);
      ctx.quadraticCurveTo(cx - r * 0.44, cy - r * 0.55, cx - r * 0.34, cy - r * 0.45);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.42, cy - r * 0.3);
      ctx.quadraticCurveTo(cx + r * 0.74, cy - r * 0.32, cx + r * 0.56, cy - r * 0.62);
      ctx.quadraticCurveTo(cx + r * 0.44, cy - r * 0.55, cx + r * 0.34, cy - r * 0.45);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy - r * 0.08, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.22, cy - r * 0.08, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.22, cy + r * 0.5);
      ctx.lineTo(cx - r * 0.13, cy + r * 0.74);
      ctx.lineTo(cx, cy + r * 0.5);
      ctx.lineTo(cx + r * 0.13, cy + r * 0.74);
      ctx.lineTo(cx + r * 0.22, cy + r * 0.5);
      ctx.stroke();
    }
  }, 0.6),
  animal: _normalizeIcon({
    label: 'Animal',
    draw(ctx, cx, cy, r) {
      // Forme de patte : coussinet central + trois doigts arrondis
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.12;
      const toeR = r * 0.14;
      const toes = [
        [-0.32, -0.34],
        [0, -0.46],
        [0.32, -0.34]
      ];
      for (const [dx, dy] of toes) {
        ctx.beginPath();
        ctx.arc(cx + dx * r, cy + dy * r, toeR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy - r * 0.05);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.5, cx + r * 0.5, cy + r * 0.5, cx + r * 0.5, cy - r * 0.05);
      ctx.bezierCurveTo(cx + r * 0.5, cy - r * 0.22, cx + r * 0.22, cy - r * 0.24, cx, cy - r * 0.24);
      ctx.bezierCurveTo(cx - r * 0.22, cy - r * 0.24, cx - r * 0.5, cy - r * 0.22, cx - r * 0.5, cy - r * 0.05);
      ctx.stroke();
    }
  }, 0.6),
  object: _normalizeIcon({
    label: 'Objet',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.35, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6),
  weapon: _normalizeIcon({
    label: 'Arme',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.15, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.65, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy + r * 0.15);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.05, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.55, cy + r * 0.55);
      ctx.stroke();
    }
  }, 0.6),
  relic: _normalizeIcon({
    label: 'Relique',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.35);
      ctx.lineTo(cx - r * 0.4, cy - r * 0.35);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy - r * 0.3);
      ctx.bezierCurveTo(cx - r * 0.35, cy + r * 0.5, cx - r * 0.1, cy + r * 0.65, cx, cy + r * 0.65);
      ctx.bezierCurveTo(cx + r * 0.1, cy + r * 0.65, cx + r * 0.35, cy + r * 0.5, cx + r * 0.35, cy - r * 0.3);
      ctx.stroke();
    }
  }, 0.6),
  environment: _normalizeIcon({
    label: 'Environnement',
    draw(ctx, cx, cy, r) {
      // Forme de montagne : double pic asymétrique (pic droit nettement plus haut)
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy + r * 0.42);
      ctx.lineTo(cx - r * 0.15, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.02, cy - r * 0.02);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.55);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.42);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.6)
};

// Migration : anciennes clés françaises (fichiers de projet sauvegardés avant le passage en anglais) -> clés actuelles.
const CATEGORY_ICON_ALIASES = {
  pnj: 'npc',
  monstre: 'monster',
  animal: 'animal',
  objet: 'object',
  arme: 'weapon',
  relique: 'relic',
  environnement: 'environment'
};
