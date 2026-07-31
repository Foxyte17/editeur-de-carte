const TYPE_ICONS = {
  event: {
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
  },
  quest: {
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
  },
  danger: {
    label: 'Danger',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.5, cy + r * 0.1);
      ctx.bezierCurveTo(cx + r * 0.5, cy + r * 0.55, cx + r * 0.2, cy + r * 0.7, cx, cy + r * 0.75);
      ctx.bezierCurveTo(cx - r * 0.2, cy + r * 0.7, cx - r * 0.5, cy + r * 0.55, cx - r * 0.5, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.5, cy - r * 0.4);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.15);
      ctx.lineTo(cx, cy + r * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.42, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  unexpected: {
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
  }
};

const CATEGORY_ICONS = {
  pnj: {
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
  },
  monstre: {
    label: 'Monstre',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.1);
      ctx.bezierCurveTo(cx - r * 0.4, cy - r * 0.6, cx + r * 0.4, cy - r * 0.6, cx + r * 0.55, cy - r * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.15);
      ctx.bezierCurveTo(cx - r * 0.3, cy + r * 0.65, cx + r * 0.3, cy + r * 0.65, cx + r * 0.6, cy + r * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy - r * 0.05, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.22, cy - r * 0.05, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  animal: {
    label: 'Animal',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + r * 0.5);
      ctx.bezierCurveTo(cx - r * 0.35, cy - r * 0.55, cx, cy - r * 0.65, cx, cy - r * 0.65);
      ctx.bezierCurveTo(cx, cy - r * 0.65, cx + r * 0.35, cy - r * 0.55, cx + r * 0.5, cy + r * 0.5);
      ctx.bezierCurveTo(cx + r * 0.25, cy + r * 0.65, cx - r * 0.25, cy + r * 0.65, cx - r * 0.5, cy + r * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.3);
      ctx.lineTo(cx, cy + r * 0.45);
      ctx.stroke();
    }
  },
  objet: {
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
  },
  arme: {
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
  },
  relique: {
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
  },
  environnement: {
    label: 'Environnement',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.4);
      ctx.lineTo(cx - r * 0.3, cy - r * 0.3);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.05);
      ctx.lineTo(cx + r * 0.15, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.35, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.6, cy + r * 0.3);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.15, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.05, cy - r * 0.2);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy - r * 0.3);
      ctx.lineTo(cx - r * 0.4, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.05);
      ctx.closePath();
      ctx.stroke();
    }
  }
};
