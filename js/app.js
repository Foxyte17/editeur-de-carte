window.addEventListener('resize', () => { if (activeFace() && activeFace().imageRaw) renderCropBox(); });

const previewWrap = document.querySelector('.preview-wrap');
if (previewWrap) {
  previewWrap.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const slider = document.getElementById('preview-zoom-range');
    const step = 5;
    const next = (Number(slider.value) || 50) + (e.deltaY < 0 ? step : -step);
    slider.value = next;
    setPreviewZoom(next);
  }, { passive: false });
}

renderDeckSelect();
renderCardList();
setActiveFace('top');
setPreviewZoom(100);
