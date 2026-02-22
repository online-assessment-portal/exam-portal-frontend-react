import React, { Component } from 'react';
import { notifications } from './lib';
class ChatComp extends Component {
  constructor() {
    super();
    this.state = {
      chatWith: -1, // holds username of active Chat ..... -1 to initate creation of first time Data
      adminActive: 0, // index of active Chat
      chatData: [],
    };
    this.isConnAd = false;
    this.with = '';
    this.message = null;
    //
  }
  chatSelHandler = (event) => {
    const value = event.target.value;
    const { myList } = this.props;
    //
    for (let i = 0; i < myList.length; i++) {
      const each = myList[i];
      if (each.email === value) {
        this.props.nMsgCtr[i] = 0;
        break;
      }
    }
    //
    this.setState({
      adminActive: this.markActiveCand(value, myList),
      chatWith: this.seenMessage(true, value, myList),
    });
  };
  sendMessage = (event) => {
    event.preventDefault();
    let storageKey = '';
    //
    const { isAdmin, allDataConn, adminDataConn, email } = this.props;
    const msg = this.message.value;
    if (!msg) return false;
    if (isAdmin) {
      const { adminActive, chatWith } = this.state;
      const conn = allDataConn[adminActive];
      if (conn && conn.open) {
        conn.send({
          type: 'chat',
          from: 'admin',
          msg: msg,
        });
        // Update on Sender's Side
        storageKey = `chat_${chatWith}`;
        event.target.reset();
      } else {
        notifications.errorCustom(
          "This candidate is currently disconnected.\nMessage can't be delivered to disconnected candidates."
        );
        return false;
      }
    } else {
      if (adminDataConn && adminDataConn.open) {
        adminDataConn.send({
          type: 'chat',
          from: email,
          msg: msg,
        });
        storageKey = 'chat_Admin';
        event.target.reset();
      } else {
        notifications.errorCustom(
          'Chat window is currently closed for you.\nWait for your proctor to open it.'
        );
        return false;
      }
    }
    // Common - update localStorage
    const old = localStorage.getItem(storageKey);
    if (old) {
      let newChat = JSON.parse(old);
      newChat.store.push({ out: msg });
      localStorage.setItem(storageKey, JSON.stringify(newChat));
    } else {
      const obj = { nMsg: 0, store: [{ out: msg }] };
      if (isAdmin) {
        const { myList } = this.props;
        const { adminActive } = this.state;
        obj.of = myList[adminActive].email;
      } else obj.of = 'admin';
      localStorage.setItem(storageKey, JSON.stringify(obj));
    }
    this.forceUpdate();
  };
  closeModal = () => {
    const { isAdmin, setMainCompState } = this.props;
    if (isAdmin) setMainCompState({ show: 0 });
    else setMainCompState({ chat: false });
  };
  showMessage = (isAdmin) => {
    const { adminActive } = this.state;
    const { myList } = this.props;
    let activeChat = [];
    if (isAdmin)
      activeChat = localStorage.getItem(`chat_${myList[adminActive].email}`);
    else activeChat = localStorage.getItem('chat_Admin');
    //
    if (activeChat) activeChat = JSON.parse(activeChat).store;
    else activeChat = [];
    //
    const content = [];
    activeChat.forEach((each, index) => {
      content.push(
        <div className={each.in ? 'chatIn' : 'chatOut'} key={index}>
          <p>{each.in ? each.in : each.out}</p>
        </div>
      );
    });
    return content;
  };
  seenMessage = (isAdmin, chatWith, myList) => {
    let storageKey = '',
      chatWith_1 = '';
    if (isAdmin) {
      chatWith_1 = chatWith ? chatWith : myList[0].email;
      storageKey = `chat_${chatWith_1}`;
    } else storageKey = 'chat_Admin';
    // Remove New Message Notification from current chat
    const old = localStorage.getItem(storageKey);
    if (old) {
      let newChat = JSON.parse(old);
      newChat.nMsg = 0;
      localStorage.setItem(storageKey, JSON.stringify(newChat));
    }
    return chatWith_1;
  };
  markActiveCand = (chatWith, myList) => {
    if (typeof chatWith === 'number' && isFinite(chatWith)) return 0;
    for (let i = 0; i < myList.length; i++) {
      const each = myList[i];
      if (each.email === chatWith) return i;
    }
  };
  componentDidMount() {
    const { isAdmin } = this.props;
    // Prepare name & email list in case of admin
    if (isAdmin) {
      const { chatWith, myList } = this.props;
      // Find Index of the Cand in myList and set ctr of nMsgCtr to 0
      for (let i = 0; i < myList.length; i++) {
        const each = myList[i];
        const chatWith_1 = chatWith ? chatWith : myList[0].email;
        if (each.email === chatWith_1) {
          this.props.nMsgCtr[i] = 0;
          break;
        }
      }
      //
      this.setState({
        adminActive: this.markActiveCand(chatWith, myList),
        chatWith: this.seenMessage(true, chatWith, myList),
      });
    } else {
      this.seenMessage(false, '', '');
      this.setState({
        chatWith: 0,
      });
    }
  }
  render() {
    const { chatWith } = this.state;
    if (chatWith === -1) return <></>;
    const { isAdmin, myList, nMsgCtr } = this.props;
    return (
      <div id="responseWin">
        <div className="chatWin" id="responseDiv">
          <div>
            <i className="fa fa-user-circle-o" aria-hidden="true"></i>
            {isAdmin ? (
              <select
                defaultValue={
                  typeof chatWith === 'string' ? chatWith : myList[0].email
                }
                onChange={this.chatSelHandler}
              >
                {myList.map((each, index) => {
                  return (
                    <option value={each.email} key={index}>
                      {each.name}
                      {nMsgCtr[index] ? ' - ' + nMsgCtr[index] : null}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p>my Proctor</p>
            )}
          </div>
          <div
            id="showChat"
            ref={(elem) => {
              if (elem) {
                elem.scrollTop = elem.scrollHeight;
              }
            }}
          >
            {this.showMessage(isAdmin)}
          </div>
          <form method="post" onSubmit={this.sendMessage}>
            <textarea
              ref={(ele) => {
                if (ele) {
                  this.message = ele;
                  ele.focus();
                }
              }}
              rows="3"
              placeholder="Type your message here"
            ></textarea>
            <button type="submit">
              <i className="fa fa-paper-plane" aria-hidden="true"></i>
            </button>
          </form>
          <i
            className="fa fa-times"
            aria-hidden="true"
            onClick={this.closeModal}
          ></i>
        </div>
      </div>
    );
  }
}
export default ChatComp;
