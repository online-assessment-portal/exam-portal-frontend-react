const disableEvents = (elem) => {
  elem.style.userSelect = 'none';
  elem.style.pointerEvents = 'none';
};
const enableEvents = (elem) => {
  elem.style.removeProperty('user-select');
  elem.style.removeProperty('pointer-events');
};
let setWidth = false,
  x,
  y,
  resizer,
  leftEle,
  rightEle,
  leftWidth,
  topEle,
  belowEle,
  topHeight,
  edtrColl = [];
// Horizontal Resizer
function mouseDownHandlerH(e) {
  // Get the current mouse position
  x = e.clientX;
  //
  resizer = e.target;
  leftEle = resizer.previousSibling;
  rightEle = resizer.nextSibling;
  leftWidth = leftEle.getBoundingClientRect().width;
  // Attach the listeners to `document`
  document.addEventListener('mousemove', mouseMoveHandlerH);
  document.addEventListener('mouseup', mouseUpHandlerH);
}
// Vertical Resizer
function mouseDownHandlerV(e) {
  // Get the current mouse position
  x = e.clientX;
  y = e.clientY;
  //
  resizer = e.target;
  topEle = resizer.previousSibling;
  belowEle = resizer.nextSibling;
  topHeight = topEle.getBoundingClientRect().height;
  // Attach the listeners to `document`
  document.addEventListener('mousemove', mouseMoveHandlerV);
  document.addEventListener('mouseup', mouseUpHandlerV);
}
//
//
//
function mouseMoveHandlerH(e) {
  // How far the mouse has been moved
  const dx = e.clientX - x;
  const newLeftWidth =
    ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
  // if (newLeftWidth > 10)
  if (setWidth) leftEle.style.width = `${newLeftWidth}%`;
  else leftEle.style.minWidth = `${newLeftWidth}%`;
  // rightEle.style.minWidth = `${90 - newLeftWidth}vw`;
  edtrColl.forEach((each) => {
    each.resize();
  });
  //
  document.body.style.cursor = 'ew-resize';

  disableEvents(leftEle);
  disableEvents(rightEle);
}
//
function mouseMoveHandlerV(e) {
  // How far the mouse has been moved
  const dy = e.clientY - y;
  const newTopHeight =
    ((topHeight + dy) * 100) /
    resizer.parentNode.getBoundingClientRect().height;
  topEle.style.height = `${newTopHeight}%`;
  //
  document.body.style.cursor = 'ns-resize';

  disableEvents(topEle);
  disableEvents(belowEle);
}
//
//
//
function mouseUpHandlerH() {
  document.body.style.removeProperty('cursor');

  enableEvents(leftEle);
  enableEvents(rightEle);

  // Remove the handlers of `mousemove` and `mouseup`
  document.removeEventListener('mousemove', mouseMoveHandlerH);
  document.removeEventListener('mouseup', mouseUpHandlerH);
}
function mouseUpHandlerV() {
  document.body.style.removeProperty('cursor');

  enableEvents(topEle);
  enableEvents(belowEle);

  // Remove the handlers of `mousemove` and `mouseup`
  document.removeEventListener('mousemove', mouseMoveHandlerV);
  document.removeEventListener('mouseup', mouseUpHandlerV);
}
//
function resetEdtrColl(isSetWidth) {
  try {
    setWidth = isSetWidth;
    edtrColl = [];
  } catch (error) {
    resetEdtrColl();
  }
}
export {
  resetEdtrColl,
  edtrColl,
  enableEvents,
  disableEvents,
  mouseDownHandlerH,
  mouseDownHandlerV,
};
