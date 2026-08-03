window.addEventListener('resize', () => { if (activeFace() && activeFace().imageRaw) renderCropBox(); });

renderDeckSelect();
renderCardList();
setActiveFace('top');
