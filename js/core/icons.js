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
    translate(x, y) { tx += x * sx; ty += y * sy; },
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
  // Recentrage automatique : certaines icônes ne sont pas dessinées symétriquement
  // autour de leur propre origine (ex. la patte animal). Sans ce recentrage, seul
  // le redimensionnement était appliqué et l'icône pouvait apparaître décalée dans
  // le badge. Les icônes déjà centrées ne sont pas affectées (offset proche de 0).
  const offsetX = (bb.minX + bb.maxX) / 2;
  const offsetY = (bb.minY + bb.maxY) / 2;
  return {
    label: iconDef.label,
    draw(ctx, cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-offsetX, -offsetY);
      iconDef.draw(ctx, 0, 0, r);
      ctx.restore();
    }
  };
}
      // Chaque icône a un bloc qui se termine par }, <un nombre>), - c'est toujours ce nombre-là qui contrôle sa taille.
      // Épaisseur et taille du "!" pilotées ici : lineWidth propre (au lieu d'hériter
      // du lineWidth fixe posé par le badge) + facteur de normalisation dédié (0.68
      // au lieu de 0.6 partagé) pour que le symbole occupe davantage le badge.
const TYPE_ICONS = {
  event: _normalizeIcon({
    label: 'Événement',
    draw(ctx, cx, cy, r) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.09;
      const outerR = [0.62, 0.7, 0.58, 0.72, 0.6, 0.68, 0.56, 0.74];
      const innerR = 0.26;
      const n = outerR.length;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const aOuter = (i / n) * Math.PI * 2 - Math.PI / 2;
        const aInner = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
        const ox = cx + Math.cos(aOuter) * outerR[i] * r;
        const oy = cy + Math.sin(aOuter) * outerR[i] * r;
        const ix = cx + Math.cos(aInner) * innerR * r;
        const iy = cy + Math.sin(aInner) * innerR * r;
        if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.90),

  quest: _normalizeIcon({
    label: 'Quête',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.25, r * 0.35, Math.PI * 1.1, Math.PI * 2.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.1);
      ctx.lineTo(cx, cy + r * 0.32);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.55, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.80),

  danger: _normalizeIcon({
    label: 'Danger',
    draw(ctx, cx, cy, r) {
      ctx.lineCap = 'round';
      ctx.lineWidth = r * 0.17;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.62);
      ctx.lineTo(cx, cy + r * 0.14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.52, r * 0.115, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 0.90),

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
  }, 0.90)
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
  // ============================================================================
  // BLOC SVG CONVERTI — NE PAS MODIFIER À LA MAIN
  // Les icônes ci-dessous (monster, weapon, relic) sont générées automatiquement
  // depuis des fichiers .svg sources, pas dessinées ligne par ligne comme le
  // reste du fichier. Les coordonnées sont "cuites" (baked) : les retoucher ici
  // à la main désynchronise le code du dessin source et casse la géométrie.
  // Pour changer un dessin : modifier/remplacer le .svg source correspondant,
  // puis relancer la conversion (voir documentation/ pour les .svg sources :
  // monster.svg, axe.svg [weapon], chalice.svg [relic]).
  // ============================================================================
  monster: _normalizeIcon({
    label: 'Monstre',
    draw: function (ctx, cx, cy, r) {
      var S = 0.0101;
      var CX = 80.5809, CY = 98.5602;
      var P = [[['M',32.7901,0],['C',13.0357,9.0942,0,23.7162,0,40.1162],['C',0,50.9104,5.548,60.9058,14.9738,69.0715],['C',10.1517,79.5714,7.1231,91.3586,6.3707,103.8858],['C',13.4789,104.1181,20.2324,105.6242,26.2938,108.7227],['C',43.4777,117.5077,51.5462,136.3981,50.1836,158.7839],['C',53.3115,159.5404,56.5022,160.1709,59.7425,160.6773],['C',60.1121,153.7486,60.0856,146.8413,59.5375,139.9563],['L',67.2393,139.3424],['C',67.8338,146.7983,67.8454,154.231,67.4286,161.641],['C',70.745,161.9552,74.1011,162.1412,77.4836,162.2123],['L',77.4836,138.9641],['L',85.2091,138.9641],['L',85.2091,162.1689],['C',88.4461,162.0656,91.6967,161.8568,94.9511,161.543],['C',94.5398,154.1657,94.5542,146.7656,95.1454,139.3428],['L',102.8473,139.9567],['C',102.3003,146.8181,102.2726,153.7014,102.6389,160.6066],['C',105.6597,160.1643,108.6747,159.6331,111.6773,159.0179],['C',110.244,136.5304,118.3084,117.5391,135.551,108.7239],['C',141.6116,105.6246,148.3659,104.1177,155.4733,103.8862],['C',154.7114,91.1878,151.6108,79.2493,146.6743,68.642],['C',155.8024,60.5557,161.1618,50.7223,161.1618,40.1166],['C',161.1618,23.7166,148.1262,9.0942,128.3717,0.0012],['C',133.7688,6.8502,137.0914,15.0564,137.0914,23.7215],['C',137.0914,41.3693,124.0648,56.6349,105.248,63.8828],['L',102.7096,57.971],['C',107.3183,56.1355,111.4876,53.7555,115.0607,50.9579],['C',119.2361,47.6899,122.5856,43.894,124.9454,39.7321],['C',112.605,29.2592,97.3948,23.0787,80.922,23.0787],['C',64.245,23.0787,48.8603,29.4097,36.4389,40.1208],['C',38.7846,44.1308,42.0563,47.7916,46.1012,50.9579],['C',50.0989,54.0874,54.8428,56.6948,60.1133,58.6019],['L',57.5812,64.4988],['C',37.871,57.5274,24.0701,41.8868,24.0701,23.7215],['C',24.0701,15.0564,27.3931,6.8502,32.7901,0.0012],['Z'],['M',37.0425,75.7072],['C',37.0648,75.7055,37.0838,75.7089,37.095,75.7225],['C',44.7076,85.3757,58.5635,92.1337,74.751,93.5662],['C',72.3152,101.7096,63.593,107.8413,52.9766,107.8413],['C',40.4874,107.8413,30.1778,99.3316,30.1778,89.024],['C',30.1786,83.8709,32.743,79.1034,36.8379,75.7233],['C',36.8722,75.7622,36.9743,75.7122,37.0421,75.7068],['Z'],['M',124.5485,75.708],['C',124.5704,75.7068,124.5898,75.7105,124.6056,75.7246],['C',128.7012,79.1042,131.2665,83.8717,131.2665,89.0253],['C',131.2665,99.3316,120.9572,107.8417,108.4668,107.8417],['C',97.8504,107.8417,89.1291,101.7108,86.6924,93.5666],['C',102.88,92.1337,116.7363,85.3757,124.3488,75.7238],['C',124.3951,75.7589,124.482,75.7114,124.5485,75.708],['Z'],['M',80.9005,93.9618],['C',83.2259,105.2976,86.6585,116.6333,94.5059,127.969],['C',86.1244,130.2147,75.9776,130.2953,67.2951,127.969],['C',74.7233,116.6333,78.3886,105.2976,80.9005,93.9618],['Z'],['M',49.3531,166.5321],['C',48.3857,172.8986,46.7019,179.4718,44.2888,186.1162],['C',47.921,188.4892,51.7455,190.5169,55.725,192.1673],['C',57.2244,184.2194,58.4274,176.3022,59.1687,168.4147],['C',55.8531,167.9104,52.5773,167.2849,49.3526,166.5325],['Z'],['M',112.5232,166.7305],['C',109.4308,167.3523,106.3241,167.8909,103.2107,168.3378],['C',103.9453,176.1811,105.1351,184.0537,106.6205,191.956],['C',110.4206,190.345,114.0764,188.3883,117.556,186.1162],['C',115.1682,179.5405,113.4947,173.0342,112.5232,166.7301],['Z'],['M',95.5344,169.2585],['C',92.0886,169.5892,88.6437,169.8055,85.2095,169.9117],['L',85.2095,197.0704],['C',90.0232,196.7545,94.7204,195.9103,99.2543,194.5857],['C',97.6428,186.1757,96.3364,177.7326,95.5344,169.2581],['Z'],['M',66.8428,169.3565],['C',66.0355,177.848,64.722,186.3072,63.1044,194.7338],['C',67.7457,196.0484,72.555,196.8612,77.4841,197.1204],['L',77.4841,169.9539],['C',73.9114,169.8828,70.3593,169.6872,66.8428,169.3565],['Z'],['M',3.0427,54.7688],['L',4.6096,60.6163]]];
      var H = [[['M',12.5217,68.9308],['L',18.2879,56.5242],['L',10.4653,65.8903],['Z']],[['M',25.3339,32.4115],['L',22.5557,37.3724],['L',26.7891,32.6099],['Z']],[['M',129.5797,33.2052],['L',147.3729,40.0182],['L',130.5719,26.8552],['Z']],[['M',154.649,19.4469],['C',154.649,19.4469,151.9688,19.9335,150.3081,20.0753],['C',149.0686,20.1811,147.5166,20.6156,146.4401,21.3874],['C',145.7295,21.897,144.7601,23.3826,144.7601,23.3826],['C',144.7601,23.3826,145.8299,22.0063,146.5708,21.5217],['C',147.3961,20.982,148.2457,20.7427,149.2177,20.5942],['C',151.2457,20.2842,155.3435,20.0753,155.3435,20.0753],['Z']]];
      function fillPaths(list, color) {
        for (var i = 0; i < list.length; i++) {
          ctx.beginPath();
          var a = list[i];
          for (var j = 0; j < a.length; j++) {
            var s = a[j];
            if (s[0] === 'M') ctx.moveTo(s[1], s[2]);
            else if (s[0] === 'L') ctx.lineTo(s[1], s[2]);
            else if (s[0] === 'C') ctx.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]);
            else if (s[0] === 'Z') ctx.closePath();
          }
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(r * S, r * S);
      ctx.translate(-CX, -CY);
      fillPaths(P, COLORS.parchment);
      fillPaths(H, COLORS.ink);
      ctx.restore();
    }
  }, 0.8),
  weapon: _normalizeIcon({
    label: 'Arme',
    draw: function (ctx, cx, cy, r) {
      // Source : documentation/axe.svg (hache, viewBox 0 0 16 16)
      var S = 0.0627;
      var CX = 8.0215, CY = 7.9786;
      var P = [[['M',1,7.5],['C',1,3.3579,4.3579,0,8.5,0],['L',8.5,5],['L',9.0429,5.5429],['L',11.293,3.2929],['L',12.7072,4.7071],['L',10.4571,6.9571],['L',11,7.5],['L',16,7.5],['C',16,11.6422,12.6421,15,8.5,15],['L',8.5,10],['L',7.9571,9.4571],['L',1.4572,15.9571],['L',0.043,14.5429],['L',6.5429,8.0429],['L',6,7.5],['L',1,7.5],['Z']]];
      function fillPaths(list, color) {
        for (var i = 0; i < list.length; i++) {
          ctx.beginPath();
          var a = list[i];
          for (var j = 0; j < a.length; j++) {
            var s = a[j];
            if (s[0] === 'M') ctx.moveTo(s[1], s[2]);
            else if (s[0] === 'L') ctx.lineTo(s[1], s[2]);
            else if (s[0] === 'C') ctx.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]);
            else if (s[0] === 'Z') ctx.closePath();
          }
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(r * S, r * S);
      ctx.translate(-CX, -CY);
      fillPaths(P, COLORS.parchment);
      ctx.restore();
    }
  }, 0.65),
  relic: _normalizeIcon({
    label: 'Relique',
    draw: function (ctx, cx, cy, r) {
      // Source : documentation/chalice.svg (calice, viewBox 0 0 495.047 495.047)
      var S = 0.00202;
      var CX = 247.524, CY = 247.5235;
      var P = [
        [['M',450.834,69.286],['C',441.903,58.12,428.578,51.712,414.289,51.712],['L',411.532,51.712],['C',412.038,46.819,412.384,41.992,412.694,37.18],['L',419.119,37.18],['C',429.394,37.18,437.71,28.855,437.71,18.59],['C',437.71,8.323,429.395,0,419.12,0],['L',75.928,0],['C',65.651,0,57.337,8.323,57.337,18.59],['C',57.337,28.856,65.651,37.18,75.928,37.18],['L',82.335,37.18],['C',82.645,41.992,82.988,46.819,83.497,51.712],['L',80.754,51.712],['C',66.47,51.712,53.144,58.12,44.21,69.304],['C',35.295,80.469,31.993,94.866,35.133,108.817],['L',54.722,195.27],['C',62.983,231.679,94.808,257.103,132.133,257.103],['L',155.281,257.103],['C',161.98,266.617,169.004,275.349,176.338,283.02],['C',207.983,316.107,223.05,361.91,217.134,407.314],['L',213.793,432.912],['C',195.291,442.989,181.695,460.933,177.809,482.365],['C',177.246,485.507,178.118,488.737,180.17,491.178],['C',182.202,493.63,185.234,495.047,188.412,495.047],['L',306.634,495.047],['C',309.811,495.047,312.844,493.64,314.895,491.188],['C',316.946,488.737,317.799,485.507,317.237,482.366],['C',313.352,460.916,299.735,442.962,281.198,432.895],['L',277.876,407.333],['C',271.96,361.856,286.992,316.152,318.689,283.02],['C',326.026,275.35,333.049,266.618,339.75,257.103],['L',362.915,257.103],['C',400.241,257.103,432.066,231.679,440.325,195.27],['L',459.913,108.808],['C',463.055,94.866,459.749,80.469,450.834,69.286],['Z']],
        [['M',132.133,219.922],['C',112.29,219.922,95.368,206.408,90.994,187.046],['L',71.406,100.604],['C',70.752,97.745,71.441,94.785,73.258,92.505],['C',75.092,90.209,77.814,88.893,80.754,88.893],['L',88.853,88.893],['C',97.313,134.488,112.724,180.8,132.987,219.923],['L',132.133,219.923],['Z']],
        [['M',404.05,187.046],['C',399.676,206.408,382.756,219.922,362.914,219.922],['L',362.042,219.922],['C',382.302,180.808,397.715,134.487,406.176,88.892],['L',414.289,88.892],['C',417.232,88.892,419.954,90.208,421.788,92.487],['C',423.603,94.783,424.294,97.743,423.641,100.593],['L',404.05,187.046],['Z']]
      ];
      function fillPaths(list, color) {
        for (var i = 0; i < list.length; i++) {
          ctx.beginPath();
          var a = list[i];
          for (var j = 0; j < a.length; j++) {
            var s = a[j];
            if (s[0] === 'M') ctx.moveTo(s[1], s[2]);
            else if (s[0] === 'L') ctx.lineTo(s[1], s[2]);
            else if (s[0] === 'C') ctx.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]);
            else if (s[0] === 'Z') ctx.closePath();
          }
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(r * S, r * S);
      ctx.translate(-CX, -CY);
      fillPaths(P, COLORS.parchment);
      ctx.restore();
    }
  }, 0.6),
  // ============================================================================
  // FIN DU BLOC SVG — la suite reprend des icônes dessinées à la main normalement.
  // ============================================================================
    animal: _normalizeIcon({
    label: 'Animal',
    draw(ctx, cx, cy, r) {
      // Forme de patte de loup/chien : 4 doigts ovales + coussinet en fer de lance + griffes
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.1; // Un peu plus fin pour la lisibilité

      // 1. Les 4 coussinets (doigts) - On utilise des cercles mis à l'échelle pour faire des ovales
      const toes = [
        { x: -0.32, y: -0.15, sx: 0.7, sy: 1.0 }, // Doigt gauche
        { x: -0.11, y: -0.35, sx: 0.7, sy: 1.0 }, // Doigt centre-gauche
        { x: 0.11,  y: -0.35, sx: 0.7, sy: 1.0 }, // Doigt centre-droit
        { x: 0.32,  y: -0.15, sx: 0.7, sy: 1.0 }  // Doigt droit
      ];
      const toeR = r * 0.12;

      for (const t of toes) {
        ctx.save();
        ctx.translate(cx + t.x * r, cy + t.y * r);
        ctx.scale(t.sx, t.sy); // Voici l'astuce pour faire des ovales !
        ctx.beginPath();
        ctx.arc(0, 0, toeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Le coussinet principal (paume) - Forme en fer de lance
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.32, cy + r * 0.15); // Base gauche
      // Courbe bas-gauche vers le centre
      ctx.bezierCurveTo(cx - r * 0.32, cy + r * 0.45, cx, cy + r * 0.55, cx, cy + r * 0.30);
      // Courbe bas-droite
      ctx.bezierCurveTo(cx, cy + r * 0.55, cx + r * 0.32, cy + r * 0.45, cx + r * 0.32, cy + r * 0.15);
      ctx.lineTo(cx + r * 0.20, cy - r * 0.05); // Montée droite
      // Plafond en V (le haut du fer de lance)
      ctx.bezierCurveTo(cx + r * 0.10, cy - r * 0.15, cx - r * 0.10, cy - r * 0.15, cx - r * 0.20, cy - r * 0.05);
      ctx.closePath();
      ctx.fill();

      // 3. Les griffes (petits triangles au-dessus des doigts)
      const claws = [
        { x: -0.32, y: -0.30 },
        { x: -0.11, y: -0.50 },
        { x: 0.11,  y: -0.50 },
        { x: 0.32,  y: -0.30 }
      ];
      
      ctx.beginPath();
      for (const c of claws) {
        ctx.moveTo(cx + (c.x - 0.04) * r, cy + (c.y + 0.04) * r);
        ctx.lineTo(cx + c.x * r, cy + (c.y - 0.07) * r);
        ctx.lineTo(cx + (c.x + 0.04) * r, cy + (c.y + 0.04) * r);
      }
      ctx.fill();
    }
  }, 0.9),
  location: _normalizeIcon({
    label: 'Lieu',
    draw(ctx, cx, cy, r) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.35, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.1);
      ctx.closePath();
      ctx.stroke();
    }
  }, 0.50),
    environment: _normalizeIcon({
    label: 'Environnement',
    draw(ctx, cx, cy, r) {
      // Sapin à 3 étages de feuillage + tronc, en traits fins (style "environment").
      ctx.lineJoin = 'miter';
      ctx.lineWidth = r * 0.09;   // <-- ÉPAISSEUR DU TRAIT : change ce 0.09 (plus petit = plus fin)

      // --- Étage 1 (sommet) ---
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.62);
      ctx.lineTo(cx - r * 0.13, cy - r * 0.38);
      ctx.lineTo(cx + r * 0.13, cy - r * 0.38);
      ctx.closePath();
      ctx.fillStyle = COLORS.parchment; ctx.fill();  // <-- décommente ces 2 lignes pour remplir cet étage
      ctx.stroke();

      // --- Étage 2 (milieu) ---
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.40);
      ctx.lineTo(cx - r * 0.23, cy - r * 0.12);
      ctx.lineTo(cx + r * 0.23, cy - r * 0.12);
      ctx.closePath();
      ctx.fillStyle = COLORS.parchment; ctx.fill();  // <-- idem pour cet étage
      ctx.stroke();

      // --- Étage 3 (base) ---
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.14);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.16);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.16);
      ctx.closePath();
      ctx.fillStyle = COLORS.parchment; ctx.fill();  // <-- idem pour cet étage
      ctx.stroke();

      // --- Tronc ---
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.06, cy + r * 0.16);
      ctx.lineTo(cx - r * 0.06, cy + r * 0.46);
      ctx.lineTo(cx + r * 0.06, cy + r * 0.46);
      ctx.lineTo(cx + r * 0.06, cy + r * 0.16);
      ctx.stroke();
    }
  }, 0.7)
}

// Migration : anciennes clés françaises (fichiers de projet sauvegardés avant le passage en anglais) -> clés actuelles.
const CATEGORY_ICON_ALIASES = {
  pnj: 'npc',
  monstre: 'monster',
  animal: 'animal',
  lieu: 'location',
  arme: 'weapon',
  relique: 'relic',
  environnement: 'environment'
};
