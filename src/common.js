const apiUrl = import.meta.env.VITE_API_URL;
const appEnv = import.meta.env.VITE_APP_ENV;
const isProd = appEnv === 'PROD';

let crntHide;
function mouseHide(msgHolder, ele, tm) {
  // Check if the Element is being removed
  if (crntHide === ele) return false;
  clearTimeout(tm);
  hideMsg(msgHolder, ele);
}
function hideMsg(msgHolder, node) {
  crntHide = node;
  //
  const style = node.style;
  style.padding = '0.1px';
  style.marginTop = 0;
  style.maxHeight = 0;
  style.minHeight = 0;
  style.transition = 'all 200ms linear';
  node.style.animation = 'fadeOutUp 300ms ease-out';
  setTimeout(() => {
    // Check id node to be removed exists in Message Holder
    if (node.parentNode === msgHolder) msgHolder.removeChild(node);
    node = null;
    crntHide = null;
  }, 295);
}
function notify(msgHolder, what, msg, time = 5000) {
  msgHolder = msgHolder.current;
  if (!msgHolder) return false;
  const ele = document.createElement('div');
  if (what === 's') ele.className = 'msgS';
  else ele.className = 'msgE';
  if (msg) ele.innerHTML = `<p>${msg}</p>`;
  else
    ele.innerHTML =
      "<p>Something went wrong.<br>Request couldn't be fulfilled at the moment.<br>Please retry after sometime.</p>";
  msgHolder.appendChild(ele);
  const timeOut = setTimeout(() => {
    hideMsg(msgHolder, ele);
  }, time);
  ele.addEventListener('mouseleave', () => mouseHide(msgHolder, ele, timeOut));
  ele.addEventListener('click', () => mouseHide(msgHolder, ele, timeOut));
}
function cjoinQbank(resp, dictFlow) {
  const myDict = [
    'testOnCmnd',
    'isEventAuth',
    'liveCmnd',
    'myPick',
    'lastPick',
    'handleVio',
    'ckOrder',
    'pullOff',
    'pushRes',
    'qContent',
    'prebuild',
    'attempt',
    'review',
    'green',
    'yellow',
    'clear',
    'check',
    'mark',
    'pnpOs',
    'virtualize',
    'keepTrack',
    'freeView',
    'testOffCmnd',
    'negCand',
    'clearResp',
    'messPre',
    'bearPull',
    'reAlloc',
    'freeMaloc',
    'vmClear',
    'forceEnd',
    'rebuild',
    'postbuild',
    'shuffle',
    'deGrade',
    'upGrade',
    'poctoC',
    'invigC',
    'shieldFact',
    'browserR',
    'camView',
    'clearAngle',
    'micPober',
    'shareScr',
    'reShare',
    'holdTest',
    'cancelTest',
    'hackP',
    'myCha',
    'careFlow',
  ];
  // Join qBank in order
  const dictOrder = JSON.parse(dictFlow);
  const sflDict = [];
  dictOrder.forEach((each) => {
    sflDict.push(myDict[each]);
  });
  let qBank = '';
  for (let i = 0; i < sflDict.length; i++) {
    const pieces = resp[sflDict[i]];
    if (!pieces) break;
    qBank += pieces;
  }
  qBank = JSON.parse(window.atob(qBank));
  return qBank;
}
function makeDateTimeReadable(recDate) {
  let dateObj;
  if (recDate) dateObj = new Date(recDate);
  else dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const date = ('0' + dateObj.getDate()).slice(-2);
  let hours = dateObj.getHours();
  const minutes = ('0' + dateObj.getMinutes()).slice(-2);
  let str = date + '-' + month + '-' + year + ' ';
  //
  let ampm = 'AM';
  //
  if (hours > 12) {
    hours -= 12;
    ampm = 'PM';
  } else if (hours === 0) hours = 12;
  str += ('0' + hours).slice(-2);
  //
  str += ':' + minutes + ' ' + ampm;
  return str;
}
async function storeError(err, token) {
  if (!token) return false;
  const formData = new FormData();
  formData.append('error', err);
  formData.append('_csrf', token);
  const formBody = new URLSearchParams(formData).toString();
  try {
    await fetch(`${apiUrl}/cand/mystore/`, {
      method: 'POST',
      credentials: isProd ? 'same-origin' : 'include',
      body: formBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch (error) {
    console.log('SpamD');
  }
}
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
export { notify, cjoinQbank, makeDateTimeReadable, storeError, isInViewport };
