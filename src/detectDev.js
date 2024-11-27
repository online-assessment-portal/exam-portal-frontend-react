export function checkDev(isFullScr) {
  //
  const widthThreshold = Math.abs(window.outerWidth - window.innerWidth) > 160;
  const hThreshold = isFullScr ? 160 : 200;
  const heightThreshold =
    Math.abs(window.outerHeight - window.innerHeight) > hThreshold;
  const orientation = widthThreshold ? 'Vertical' : 'Horizontal';
  //
  const isOpen =
    !(heightThreshold && widthThreshold) &&
    ((window.Firebug &&
      window.Firebug.chrome &&
      window.Firebug.chrome.isInitialized) ||
      widthThreshold ||
      heightThreshold);
  return { isOpen: isOpen, orientation: orientation };
}
