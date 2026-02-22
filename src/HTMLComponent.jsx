import React, { PureComponent } from 'react';
import AceEditor from 'react-ace';
// TODO: use maintained libs (React-Ace is causing issues with VITE)
// import 'ace-builds/webpack-resolver'; // Ensure you have at least one mode and theme imported
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-jsx';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-chrome';
import EditorControl from './edtitorControl';
import Beautify from 'ace-builds/src-noconflict/ext-beautify';
//
import {
  edtrColl,
  resetEdtrColl,
  enableEvents,
  disableEvents,
  mouseDownHandlerH,
  mouseDownHandlerV,
} from './helpers/resizer';
//
class HTMLComponent extends PureComponent {
  constructor(props) {
    super();
    resetEdtrColl(true);
    this.state = {
      displayEdtr: 1,
      imgScale: 1,
      edtrSetting: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.edtrOption = {
      wrap: true,
      dragEnabled: true,
      highlightActiveLine: false,
      highlightGutterLine: false,
      useWorker: false,
      showPrintMargin: false,
    };
    if (!props.isPrepare && props.testInfo.disEdtrDrag) {
      this.edtrOption = {
        ...this.edtrOption,
        dragEnabled: false,
      };
    }
    this.jsEdtrBtn = {
      0: 'index.js',
      1: 'react_jsx.js',
      2: 'vue_app.js',
      3: 'jQuery.js',
      4: 'angular.js',
    };
    this.cssStore = {
      0: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css" integrity="sha512-P5MgMn1jBN01asBgU0z60Qk4QxiXo86+wlFahKrsQf37c9cro517WzVSPPV1tDKzhku2iJ2FVgL67wG03SGnNA==" crossorigin="anonymous" />',
      1: '',
      2: '',
      3: '',
      4: '',
    };
    this.jsStore = {
      0: '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.bundle.min.js" integrity="sha512-wV7Yj1alIZDqZFCUQJy85VN+qvEIly93fIQAN7iqDFCPEucLCeNFz4r35FCo9s6WrpdDQPi80xbljXB8Bjtvcg==" crossorigin="anonymous"></script>',
      1: '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.development.js" integrity="sha512-Vf2xGDzpqUOEIKO+X2rgTLWPY+65++WPwCHkX2nFMu9IcstumPsf/uKKRd5prX3wOu8Q0GBylRpsDB26R6ExOg==" crossorigin="anonymous"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.development.min.js" integrity="sha512-aNBFq6ue8EmNDwVD/l0mWFy3iVZLIxtQaD7fEYBn3HluJer36T1AhJK0THj6MKKfhZrexxWsKX1T16TxLZo6uQ==" crossorigin="anonymous"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js" integrity="sha512-kp7YHLxuJDJcOzStgd6vtpxr4ZU9kjn77e6dBsivSz+pUuAuMlE2UTdKB7jjsWT84qbS8kdCWHPETnP/ctrFsA==" crossorigin="anonymous"></script>',
      2: '<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.2/vue.js" integrity="sha512-9cBpxTrWHJC8JqDUn0uJpGWG80V3DiGiu2u1YHt2EqF+qloD6IvkOJaIZOdGBOTy0BisjueoEyG7vsdEYlmi4g==" crossorigin="anonymous"></script>',
      3: '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous"></script>',
      4: '<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.2/angular.js" integrity="sha512-rCVQBDU9Ny0aKLo1/B1MqgRjWEMlCL3WJ0DD6mJeK6qMZqpN9JCRxPtMQWWR9XWCMFIqlSgT4uOdwpvxWTSejw==" crossorigin="anonymous"></script>',
    };
    this.toPullCss = '';
    this.toPullJs = '';
    //
    this.htmlDefM = {
      0: '<h1>Hello World</h1>',
      1: '<div id="root"></div>',
      2: '<div id="main">\n\t\t<h1>{{ message }}</h1>\n\t</div>',
      3: '<div id="main"></div>',
      4: '<div ng-app="app">\n\t\t<h1 ng-controller="helloCtrl">{{message}}</h1>\n\t</div>',
    };
    this.htmlDefU =
      '<!--Use Ctrl+S (Windows) and Control+S (Mac) to Execute-->\n<!--Use Alt+Shift+F (Windows) and Option+Shift+F (Mac) to Format and Beautify-->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Document</title>\n</head>\n\n<body>\n\t';
    this.htmlDefD = '\n</body>\n\n</html>';
    //
    this.jsDef = {
      0: 'console.log("My console");',
      1: 'const { Component, PureComponent } = React;\nclass SubCom extends PureComponent {\n\trender() {\n\t\treturn <p>Hello World</p>;\n\t}\n}\nclass MainComponent extends Component {\n\tconstructor() {\n\t\tsuper();\n\t\tthis.state = { state: "React Up and Running" };\n\t}\n\trender() {\n\t\tconsole.log("My console");\n\t\tconst { state } = this.state;\n\t\treturn (\n\t\t\t<div>\n\t\t\t\t<SubCom />\n\t\t\t\t<SubCom />\n\t\t\t\t<h1>{state}</h1>\n\t\t\t\t<button onClick={() => this.setState({ state: "Action Success" })}>Click</button>\n\t\t\t</div>\n\t\t);\n\t}\n}\nconst renderEle = document.getElementById("root");\nReactDOM.render(<MainComponent />, renderEle);',
      2: "const myObject = new Vue({\n\tel: '#main',\n\tdata: { message: 'Hello Vue!' }\n})\n\nconsole.log('My console');",
      3: '$(document).ready(function(){\n\t$("#main").html("<h1>Hello jQuery!</h1>");\n});\n\nconsole.log("My console");',
      4: 'angular.module("app", []).controller("helloCtrl", function ($scope) {\n\t$scope.message = "Hello Angular!"\n})\n\nconsole.log("My console");',
    };
    //
    this.cssDef = 'h1,\np {\n\tfont-family: monospace;\n}';
    //
    this.jsString =
      "<script nonce=\"ekp3ldxrt5qi\">const _0x2913=['parent','clear','146290lRZPEY','error','addEventListener','info','93500kUENkL','1GTmGuH','http://localhost:3000/','1259192XuAeFw','push','warn','stringify','357262hIeulx','76oAagjS','188397qXQTTs','log','forEach','3XCKIfv','18449SGbaar','apply','contextmenu','stack','postMessage','1KVIKbN','onload','736321vpqJDi','rightclick','preventDefault'];const _0x4ec2ad=_0x1271;function _0x1271(_0xf3cec8,_0x538cfc){_0xf3cec8=_0xf3cec8-0x169;let _0x29137b=_0x2913[_0xf3cec8];return _0x29137b;}(function(_0x55ad14,_0x3a1d28){const _0x22bfea=_0x1271;while(!![]){try{const _0x3a2905=-parseInt(_0x22bfea(0x183))*-parseInt(_0x22bfea(0x169))+-parseInt(_0x22bfea(0x16a))*parseInt(_0x22bfea(0x182))+-parseInt(_0x22bfea(0x17b))*parseInt(_0x22bfea(0x17a))+parseInt(_0x22bfea(0x17d))+parseInt(_0x22bfea(0x176))+-parseInt(_0x22bfea(0x16f))*-parseInt(_0x22bfea(0x171))+-parseInt(_0x22bfea(0x181));if(_0x3a2905===_0x3a1d28)break;else _0x55ad14['push'](_0x55ad14['shift']());}catch(_0xf9cb21){_0x55ad14['push'](_0x55ad14['shift']());}}}(_0x2913,0xd085c),console['clear']());let showAll=[];const originalError=console[_0x4ec2ad(0x177)],originalLog=console[_0x4ec2ad(0x184)],originalWarning=console['warn'],originalInfo=console['info'],originalClear=console[_0x4ec2ad(0x175)];console[_0x4ec2ad(0x175)]=function(..._0x3ae0e3){const _0x415822=_0x4ec2ad;(showAll=[])['push']({'clear':''}),originalClear[_0x415822(0x16b)](console,_0x3ae0e3);},console[_0x4ec2ad(0x177)]=function(_0x31eb4e){const _0x5caa9=_0x4ec2ad,_0x3e289e=_0x31eb4e['toString']()+'\x20'+_0x31eb4e['stack'];showAll[_0x5caa9(0x17e)]({'err':_0x3e289e}),originalError[_0x5caa9(0x16b)](console,arguments);},console[_0x4ec2ad(0x17f)]=function(..._0x17565e){const _0x5df75a=_0x4ec2ad;_0x17565e['forEach'](_0x49354b=>showAll['push']({'warn':_0x49354b})),originalWarning[_0x5df75a(0x16b)](console,_0x17565e);},console[_0x4ec2ad(0x184)]=function(..._0x73c070){const _0x2dab28=_0x4ec2ad;_0x73c070[_0x2dab28(0x185)](_0x29b5ff=>showAll[_0x2dab28(0x17e)]({'log':_0x29b5ff})),originalLog[_0x2dab28(0x16b)](console,_0x73c070);},console[_0x4ec2ad(0x179)]=function(..._0x2f8ab4){const _0x37a167=_0x4ec2ad;_0x2f8ab4[_0x37a167(0x185)](_0x39d2b3=>showAll[_0x37a167(0x17e)]({'info':_0x39d2b3})),originalInfo[_0x37a167(0x16b)](console,_0x2f8ab4);},window[_0x4ec2ad(0x178)]('error',_0xc19eeb=>{const _0x4530f1=_0x4ec2ad;_0xc19eeb[_0x4530f1(0x173)]();let _0x3ea529='';_0x3ea529=_0xc19eeb[_0x4530f1(0x177)]?_0xc19eeb[_0x4530f1(0x177)][_0x4530f1(0x16d)]:_0xc19eeb['message'],showAll[_0x4530f1(0x17e)]({'winerr':_0x3ea529}),window[_0x4530f1(0x174)][_0x4530f1(0x16e)](JSON[_0x4530f1(0x180)](showAll),_0x4530f1(0x17c));}),window[_0x4ec2ad(0x170)]=()=>{const _0x59e9df=_0x4ec2ad;window[_0x59e9df(0x174)][_0x59e9df(0x16e)](JSON[_0x59e9df(0x180)](showAll),'https://shredtest.scriptbliss.com/');},document[_0x4ec2ad(0x178)](_0x4ec2ad(0x16c),_0x14f37b=>{const _0x2c53d2=_0x4ec2ad;_0x14f37b['preventDefault'](),window[_0x2c53d2(0x174)][_0x2c53d2(0x16e)](_0x2c53d2(0x172),_0x2c53d2(0x17c));});</script>";
    this.restrictCmnd = {
      name: 'breakTheEditor',
      bindKey: 'ctrl-c|ctrl-v|ctrl-x|ctrl-shift-v|shift-del|cmd-c|cmd-v|cmd-x',
      exec: () => {
        if (this.cmndNoti) return;
        const { notify, msgHolder } = this.props;
        notify(msgHolder, 'e', 'Command Not Allowed');
        this.cmndNoti = true;
        setTimeout(() => {
          this.cmndNoti = false;
        }, 5000);
      },
    };
    this.saveCmnd = {
      name: 'myCommand',
      bindKey: {
        win: 'ctrl-s',
        mac: 'Control-S',
      },
      exec: () => {
        this.executeHTML();
      },
    };
    this.beautifyCmnd = {
      name: 'beautifyC',
      bindKey: { win: 'Alt-Shift-F', mac: 'Option-Shift+F' },
      exec: () => {
        const { displayEdtr } = this.state;
        if (displayEdtr === 1) Beautify.beautify(this.htmlEdtr.session);
        else if (displayEdtr === 2) Beautify.beautify(this.cssEdtr.session);
        else Beautify.beautify(this.jsEdtr.session);
      },
    };
    this.dragger = React.createRef();
    this.draggable = React.createRef();
    this.qFrame = React.createRef();
    this.consoleEle = React.createRef();
    this.outputFrame = React.createRef();
    // The current position of mouse - at the time of Click
    this.x = 0;
    this.y = 0;
    // Width of left side
    this.topHeight = 0;
    this.resizerH = React.createRef();
    this.resizerV = React.createRef();
    this.imgEle = React.createRef();
    // to stop repeated notification
    // Command Not Allowed Notification
    this.cmndNoti = false;
    // Notification Right Click
    this.nRClick = false;
  }
  static getDerivedStateFromProps(props) {
    if (props.isPrepare) return {};
    const { myKey, ques } = props;
    const prefix = myKey + '-' + ques.qIndex;
    return {
      keyCdH: `${prefix}-H`,
      keyCdC: `${prefix}-C`,
      keyCdJ: `${prefix}-J`,
    };
  }
  setParentCompState = (obj) => {
    this.setState(obj);
  };
  submitCode = async () => {
    let code = [];
    code.push(this.htmlEdtr.getValue());
    code.push(this.cssEdtr.getValue());
    code.push(this.jsEdtr.getValue());
    this.props.recRes('ansQ', code);
    //
    this.body.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.setState({ displayEdtr: 1, imgScale: 1 });
  };
  resetQFrame = () => {
    this.qFrame.current.src = this.props.ques[5];
  };
  zoomImage = (wh) => {
    let { imgScale } = this.state;
    if (wh === 1) {
      if (imgScale > 1.5) return;
      imgScale += 0.1;
      this.setState({
        imgScale: imgScale,
      });
    } else if (wh === 2) {
      if (imgScale < 0.5) return;
      imgScale -= 0.1;
      this.setState({
        imgScale: imgScale,
      });
    } else if (wh === 3) {
      this.setState({
        imgScale: 1,
      });
    } else {
      const { notify, msgHolder } = this.props;
      notify(msgHolder, 'e', 'WebPage Error');
    }
  };
  dragToggle = () => {
    const draggable = this.draggable.current;
    const dragger = this.dragger.current;
    if (draggable.className === 'dragOff') {
      draggable.className = 'dragOn';
      dragger.style.cursor = 'move';
      dragger.addEventListener('mousedown', this.mouseDownHandlerE);
    } else {
      draggable.className = 'dragOff';
      draggable.style.top = '0px';
      draggable.style.left = '0px';
      dragger.style.cursor = 'grab';
      dragger.removeEventListener('mousedown', this.mouseDownHandlerE);
    }
  };
  // insert after startIndex - cdnCSS -> userCSS -> fascJS-> cdnJS
  insertCode = (code, cssCode, startI) => {
    // suppose tagName is </title>
    code =
      code.slice(0, startI) +
      '\n' +
      this.toPullCss +
      '\n' +
      cssCode +
      '\n' +
      this.jsString +
      '\n' +
      this.toPullJs +
      code.slice(startI);
    return code;
  };
  executeHTML = () => {
    this.consoleErr = '';
    let code = this.htmlEdtr.getValue();
    const cssCode = '<style>' + this.cssEdtr.getValue() + '</style>';
    let jsCode = this.jsEdtr.getValue();
    const { ques } = this.props;
    if (ques[3].indexOf(1) !== -1)
      jsCode =
        '<script nonce="ekp3ldxrt5qi" type="text/babel">' +
        jsCode +
        '</script>';
    else jsCode = '<script nonce="ekp3ldxrt5qi">' + jsCode + '</script>';
    //
    const headS_Index = code.search('<head>');
    const titleE_Index = code.search('</title>');
    // Insert CDN (CSS+JS)
    // Insert Fascilator JS String
    if (titleE_Index !== -1)
      code = this.insertCode(code, cssCode, titleE_Index + 8);
    else if (headS_Index !== -1) {
      code = this.insertCode(code, cssCode, headS_Index + 8);
      // code =
      // 	code.slice(0, headS_Index + 6) +
      // 	this.toPullCss +
      // 	cssCode +
      // 	this.jsString +
      // 	this.toPullJs +
      // 	code.slice(headS_Index + 6);
      // Add user's css code
      // let headE_Index = code.search("</head>");
      // code =
      // 	code.slice(0, headE_Index) +
      // 	this.toPullCss +
      // 	cssCode +
      // 	code.slice(headE_Index);
    } else
      code =
        this.toPullCss +
        '\n' +
        cssCode +
        '\n' +
        this.jsString +
        '\n' +
        this.toPullJs +
        code;
    //
    let bodyEIndex = code.search('</body>');
    if (bodyEIndex !== -1)
      code = code.slice(0, bodyEIndex) + jsCode + '\n' + code.slice(bodyEIndex);
    else code = code + jsCode;
    let scriptI = code.indexOf('<script>');
    while (scriptI !== -1) {
      code =
        code.slice(0, scriptI + 7) +
        ' nonce="ekp3ldxrt5qi"' +
        code.slice(scriptI + 7);
      scriptI = code.indexOf('<script>');
    }
    this.outputFrame.current.srcdoc = code;
    // Now process data for the console
    this.consoleEle.current.innerHTML = '';
    this.htmlEdtr.focus();
  };
  mouseDownHandlerE = (e) => {
    if (this.draggable.current.className === 'dragOff') return;
    // Get the current mouse position
    this.x = e.clientX;
    this.y = e.clientY;
    // Attach the listeners to `document`
    document.addEventListener('mousemove', this.mouseMoveHandlerE);
    document.addEventListener('mouseup', this.mouseUpHandlerE);
  };

  mouseMoveHandlerE = (e) => {
    // How far the mouse has been moved
    const dx = e.clientX - this.x;
    const dy = e.clientY - this.y;
    const draggable = this.draggable.current;
    // Set the position of element
    draggable.style.top = `${draggable.offsetTop + dy}px`;
    draggable.style.left = `${draggable.offsetLeft + dx}px`;
    // Reassign the position of mouse
    this.x = e.clientX;
    this.y = e.clientY;
    //
    disableEvents(document.body);
  };

  mouseUpHandlerE = () => {
    // Remove the handlers of `mousemove` and `mouseup`
    enableEvents(document.body);
    document.removeEventListener('mousemove', this.mouseMoveHandlerE);
    document.removeEventListener('mouseup', this.mouseUpHandlerE);
  };
  winMsgLis = (event) => {
    if (event.data.source) return;
    if (event.data === 'rightclick') {
      if (this.nRClick) return;
      const { notify, msgHolder } = this.props;
      notify(msgHolder, 'e', 'Right Click has been Disabled');
      this.nRClick = true;
      setTimeout(() => {
        this.nRClick = false;
      }, 5000);
      return;
    }
    let cls,
      consoleHTML = [];
    let msgData = '',
      extractMsgData = [];
    const consoleEle = this.consoleEle.current;
    let isCdn = -1,
      isSrcDoc = -1;
    try {
      msgData = JSON.parse(event.data);
      extractMsgData = [];
      // Process and Extract
      msgData.forEach((each) => {
        each = JSON.stringify(each);
        //
        isCdn = -1;
        isCdn = each.search('cdnjs');
        if (isCdn !== -1) each = each.slice(0, isCdn - 11) + '"}';
        //
        isSrcDoc = -1;
        isSrcDoc = each.search('srcdoc');
        if (isSrcDoc !== -1) each = each.slice(0, isSrcDoc - 9) + '"}';
        each = each.replaceAll('\n', '<br>');
        extractMsgData.push(each);
      });
      // Extract Uniques MsgData
      msgData = [];
      extractMsgData.forEach((each) => {
        cls = Object.keys(each)[0];
        if ((cls === 'err' || cls === 'winerr') && msgData.indexOf(each) === -1)
          msgData.push(each);
        else msgData.push(each);
      });
      consoleHTML = [];
      if (msgData) {
        msgData.forEach((each) => {
          each = JSON.parse(each);
          cls = Object.keys(each)[0];
          if (cls === 'clear')
            consoleHTML.splice(
              0,
              0,
              `<p class="clear"><i>Console was cleared</i></p><hr>`
            );
          else {
            each = Object.values(each)[0];
            if (
              cls === 'warn' &&
              typeof each === 'string' &&
              each.indexOf('You are using the in-browser Babel transformer') !==
                -1
            )
              return false;
            if (typeof each === 'object' && each !== null)
              each = JSON.stringify(each);
            consoleHTML.push(`<p class="${cls}">${each}</p><hr>`);
          }
        });
        if (consoleHTML.length)
          consoleEle.innerHTML = consoleHTML.reduce((a, b) => a + b);
        this.setState({ consoleHTML: consoleHTML });
      }
    } catch (error) {
      consoleEle.innerHTML = '<p class="err>Script Error</p><hr>';
    }
  };
  htmlResize = () => {
    const eleRef = this.outputFrame;
    if (eleRef) eleRef.current.srcdoc = '';
    // console.clear();
  };
  resetQ = (userResp) => {
    if (userResp) {
      const { keyCdH, keyCdC, keyCdJ } = this.state;
      this.props.recRes('nAnsQ', null);
      localStorage.removeItem(keyCdH);
      localStorage.removeItem(keyCdC);
      localStorage.removeItem(keyCdJ);
      this.forceUpdate();
    }
    this.props.setExamCompState({
      confirm: false,
      confirmCallback: false,
    });
  };
  componentWillUnmount() {
    window.removeEventListener('message', this.winMsgLis);
    window.removeEventListener('resize', this.htmlResize);
    this.resizerH.current.removeEventListener('mousedown', mouseDownHandlerH);
    this.resizerV.current.removeEventListener('mousedown', mouseDownHandlerV);
  }
  prepareCDN = () => {
    const { ques } = this.props;
    this.toPullCss = '';
    this.toPullJs = '';
    ques[3].forEach((each) => {
      this.toPullCss += this.cssStore[each];
      this.toPullJs += this.jsStore[each];
    });
  };
  constructDefValue = (coll, additionals) => {
    let string = '';
    additionals.forEach((each) => {
      string += coll[each] + '\n';
    });
    return string.slice(0, -1);
  };
  componentDidUpdate() {
    this.prepareCDN();
  }
  componentDidMount() {
    window.addEventListener('error', (e, r) => console.log(e, r));
    //
    window.addEventListener('message', this.winMsgLis);
    window.addEventListener('resize', this.htmlResize);
    //
    // this.executeHTML();
    this.resizerH.current.addEventListener('mousedown', mouseDownHandlerH);
    this.resizerV.current.addEventListener('mousedown', mouseDownHandlerV);
    // Scroll
    this.body = document.querySelector('body');
    //
    this.prepareCDN();
  }
  render() {
    const { keyCdH, keyCdC, keyCdJ, displayEdtr, edtrSetting } = this.state;
    const {
      isPrepare,
      //
      crntQIndex,
      testInfo,
      ques,
      response,
      fontS,
      theme,
      setExamCompState,
    } = this.props;
    let qText =
      `<u><strong>Question No.${
        crntQIndex + 1
      }</strong></u><span>(Max Score - ${ques[6]})</span><br>` + ques[1];
    return (
      <>
        {edtrSetting ? (
          <EditorControl
            fontS={fontS}
            theme={theme}
            setExamCompState={setExamCompState}
            setParentCompState={this.setParentCompState}
          />
        ) : null}
        <div id={isPrepare ? 'prepHTML' : 'containerH'}>
          <div id="qNDImg">
            <div id="ques">
              <p
                dangerouslySetInnerHTML={{
                  __html: qText,
                }}
              ></p>
              {ques[2] ? (
                <>
                  <h4>Explanation -:</h4>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: ques[2],
                    }}
                  ></p>
                </>
              ) : null}
            </div>
            {ques[4] !== '' ? (
              <div ref={this.draggable} className="dragOff" id="draggable">
                <div ref={this.dragger} id="dragMe2">
                  <p style={{ float: 'left' }} onDoubleClick={this.dragToggle}>
                    &nbsp;&#1421;&nbsp;
                    <span>Expected Output</span>
                  </p>
                  {ques[4] === 'I' ? (
                    <div id="zoom">
                      <button type="button" onClick={() => this.zoomImage(1)}>
                        &#43;
                      </button>
                      <button type="button" onClick={() => this.zoomImage(2)}>
                        &#8722;
                      </button>
                      <button type="button" onClick={() => this.zoomImage(3)}>
                        R
                      </button>
                    </div>
                  ) : ques[4] === 'F' ? (
                    <div id="zoom">
                      <button type="button" onClick={this.resetQFrame}>
                        R
                      </button>
                    </div>
                  ) : null}
                </div>
                {ques[4] === 'I' ? (
                  <img
                    src={ques[5]}
                    alt=""
                    srcSet=""
                    style={{ transform: `scale(${this.state.imgScale})` }}
                  ></img>
                ) : ques[4] === 'F' ? (
                  <iframe
                    ref={this.qFrame}
                    title="expFrame"
                    src={ques[5]}
                    frameBorder="0"
                  ></iframe>
                ) : null}
              </div>
            ) : null}
          </div>
          <div id="htmlEditorWin">
            <div id="edtrDiv">
              <div id="mainControl">
                <div id="toggleEdtr">
                  <button
                    type="button"
                    className={displayEdtr === 1 ? 'active' : null}
                    onClick={() => {
                      this.htmlEdtr.focus();
                      this.setState({ displayEdtr: 1 });
                    }}
                  >
                    index.html
                  </button>
                  <button
                    type="button"
                    className={displayEdtr === 2 ? 'active' : null}
                    onClick={() => {
                      this.cssEdtr.focus();
                      this.setState({ displayEdtr: 2 });
                    }}
                  >
                    style.css
                  </button>
                  <button
                    type="button"
                    className={displayEdtr === 3 ? 'active' : null}
                    onClick={() => {
                      this.jsEdtr.focus();
                      this.setState({ displayEdtr: 3 });
                    }}
                  >
                    {this.jsEdtrBtn[ques[3][0]]}
                  </button>
                </div>
                <div>
                  <i
                    className="fa fa-refresh"
                    aria-hidden="true"
                    title="Reset all codes & response for this Question"
                    onClick={() => {
                      this.props.setExamCompState({
                        confirm: 'resetConf',
                        confirmCallback: this.resetQ,
                      });
                    }}
                  ></i>
                  <i
                    className="fa fa-cog"
                    aria-hidden="true"
                    onClick={() => {
                      this.setState({ edtrSetting: !edtrSetting });
                    }}
                  ></i>
                  <button
                    type="button"
                    id="executeBtn"
                    onClick={this.executeHTML}
                  >
                    Execute
                  </button>
                </div>
              </div>
              <AceEditor
                key={crntQIndex + 'H'}
                name="htmlEdtr"
                mode="html"
                value={
                  response
                    ? response[0]
                    : isPrepare
                      ? ''
                      : localStorage.getItem([keyCdH]) !== null
                        ? localStorage.getItem([keyCdH])
                        : this.htmlDefU +
                          this.constructDefValue(this.htmlDefM, ques[3]) +
                          this.htmlDefD
                }
                placeholder={
                  !isPrepare ? 'Put HTML Codes Here' : 'No HTML Codes'
                }
                fontSize={fontS}
                theme={theme}
                height="100%"
                width="100%"
                style={
                  displayEdtr === 1 ? { display: 'block' } : { display: 'none' }
                }
                setOptions={this.edtrOption}
                commands={
                  !isPrepare && testInfo.disEdtrCmnd
                    ? [this.restrictCmnd, this.saveCmnd, this.beautifyCmnd]
                    : [this.saveCmnd, this.beautifyCmnd]
                }
                onChange={
                  isPrepare
                    ? null
                    : (code) => localStorage.setItem([keyCdH], code)
                }
                onLoad={(editor) => {
                  edtrColl.push(editor);
                  editor.focus();
                  this.htmlEdtr = editor;
                }}
              />
              <AceEditor
                key={crntQIndex + 'C'}
                name="cssEdtr"
                mode="css"
                value={
                  response
                    ? response[1]
                    : isPrepare
                      ? ''
                      : localStorage.getItem([keyCdC]) !== null
                        ? localStorage.getItem([keyCdC])
                        : this.cssDef
                }
                placeholder={!isPrepare ? 'Put CSS Codes Here' : 'No CSS'}
                fontSize={fontS}
                theme={theme}
                height="100%"
                width="100%"
                style={
                  displayEdtr === 2 ? { display: 'block' } : { display: 'none' }
                }
                setOptions={this.edtrOption}
                commands={
                  !isPrepare && testInfo.disEdtrCmnd
                    ? [this.restrictCmnd, this.saveCmnd, this.beautifyCmnd]
                    : [this.saveCmnd, this.beautifyCmnd]
                }
                onChange={
                  isPrepare
                    ? null
                    : (code) => localStorage.setItem([keyCdC], code)
                }
                onLoad={(editor) => {
                  edtrColl.push(editor);
                  editor.focus();
                  this.cssEdtr = editor;
                }}
              />
              <AceEditor
                key={crntQIndex + 'J'}
                name="jsEdtr"
                mode={ques[3].indexOf(0) !== -1 ? 'jsx' : 'javascript'}
                value={
                  response
                    ? response[2]
                    : isPrepare
                      ? ''
                      : localStorage.getItem([keyCdJ]) !== null
                        ? localStorage.getItem([keyCdJ])
                        : this.constructDefValue(this.jsDef, ques[3])
                }
                placeholder={!isPrepare ? 'Javascript Code Here' : 'No JS Code'}
                fontSize={fontS}
                theme={theme}
                height="100%"
                width="100%"
                style={
                  displayEdtr === 3 ? { display: 'block' } : { display: 'none' }
                }
                setOptions={this.edtrOption}
                commands={
                  !isPrepare && testInfo.disEdtrCmnd
                    ? [this.restrictCmnd, this.saveCmnd, this.beautifyCmnd]
                    : [this.saveCmnd, this.beautifyCmnd]
                }
                onChange={
                  isPrepare
                    ? null
                    : (code) => localStorage.setItem([keyCdJ], code)
                }
                onLoad={(editor) => {
                  edtrColl.push(editor);
                  editor.focus();
                  this.jsEdtr = editor;
                }}
              />
            </div>
            <div ref={this.resizerH} className="dragMeH"></div>
            <div id="frameDiv">
              <iframe
                key={[crntQIndex] + 'F'}
                ref={this.outputFrame}
                title="outFrame"
                style={{ height: '70%' }}
                src="about:blank"
                frameBorder="0"
              ></iframe>
              <div ref={this.resizerV} id="dragMeV"></div>
              <div
                key={[crntQIndex] + 'C'}
                ref={this.consoleEle}
                id="console"
              ></div>
            </div>
          </div>
          {isPrepare ? null : (
            <button
              type="submit"
              id="submitBtn"
              className="btnPrimary"
              style={{ marginRight: '14px' }}
              onClick={this.submitCode}
            >
              Submit
            </button>
          )}
        </div>
      </>
    );
  }
}
export default HTMLComponent;
