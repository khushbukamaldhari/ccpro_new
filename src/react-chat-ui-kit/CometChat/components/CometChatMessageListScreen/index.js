import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CometChat } from "@cometchat-pro/chat";

import MessageHeader from "../MessageHeader";
import MessageList from "../MessageList";
import MessageComposer from "../MessageComposer";
import LiveReaction from "../LiveReaction";

import { theme } from "../../resources/theme";

import * as enums from '../../util/enums.js';
import { validateWidgetSettings } from "../../util/common";

import { chatWrapperStyle, reactionsWrapperStyle } from "./style";

import { incomingMessageAlert } from "../../resources/audio/";
import axios from 'axios';
import { WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';
import { addLoader, removeLoader } from '../../../../loader';

class CometChatMessageListScreen extends React.PureComponent {

  constructor(props) {

    super(props);

    this.state = {
      messageList: [],
      roomTableList: [],
      scrollToBottom: true,
      messageToBeEdited: null,
      replyPreview: null,
      liveReaction: false
    }

    this.reactionName = props.reaction || "heart";

    this.theme = Object.assign({}, theme, this.props.theme);
    this.audio = new Audio(incomingMessageAlert);
  }

  componentDidMount() {
    if (this.props.type === 'rooms' ){
      this.getGrouptable(this.props.item.ID);
      removeLoader();
    }
    this.audio = new Audio(incomingMessageAlert);
  }

  getGrouptable = ( roomID ) => {
    let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOMTABLES}/${roomID}`;
    // console.log(this.props.item);
    axios.get( api_url ).then(roomListTable => {
      roomListTable.data.map((group, key) => {
        group.guid = group.table_id;
        group.icon = group.table_image;
        group.name = group.table_name;
        group.membersCount = group.table_users.length;
      });
      roomListTable['group'] = this.props.item;
      if(roomListTable.data.length === 0) {
        this.decoratorMessage = "No rooms found";
      }
      
      // removeLoader();
      // console.log(roomListTable);
      this.setState({ roomTableList: roomListTable });
    }).catch(error => {

      // removeLoader();
      this.decoratorMessage = "Error";
      console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.props.type === 'user' && this.props.item.ccpro_uid == null) {
      
    //   this.setState({ messageList: [], scrollToBottom: true});

    // } else 
    if (this.props.type === 'user' && prevProps.item.uid !== this.props.item.uid) {
      
      this.setState({ messageList: [], scrollToBottom: true, messageToBeEdited: null});

    } else if (this.props.type === 'group' && prevProps.item.guid !== this.props.item.guid) {
      
      this.setState({ messageList: [], scrollToBottom: true, messageToBeEdited: null });

    }else if (this.props.type === 'rooms' && prevProps.item.ID !== this.props.item.ID) {
     
      if (!this.props.item.ID && this.state.roomTableList !== this.props.item) {

        // this.groupListRef.scrollTop = 0;
        this.setState({ roomTableList: this.props.item, messageToBeEdited: null });

      } else {
        this.getGrouptable(this.props.item.ID);
      }
    } else if(prevProps.type !== this.props.type) {
      
      this.setState({ messageList: [], scrollToBottom: true , messageToBeEdited: null });


    } else if(prevProps.composedthreadmessage !== this.props.composedthreadmessage) {

      this.updateReplyCount(this.props.composedthreadmessage);

    } else if(prevProps.callmessage !== this.props.callmessage) {

      this.actionHandler("callUpdated", this.props.callmessage);

    } else if (prevProps.groupmessage !== this.props.groupmessage) {

      if (validateWidgetSettings(this.props.widgetsettings, "hide_join_leave_notifications") !== true) {
        this.appendMessage(this.props.groupmessage);
      }
    }
  }

  playAudio = () => {

    //if it is disabled for chat wigdet in dashboard
    if (this.props.hasOwnProperty("widgetsettings")
    && this.props.widgetsettings
    && this.props.widgetsettings.hasOwnProperty("main")
    && (this.props.widgetsettings.main.hasOwnProperty("enable_sound_for_messages") === false
    || (this.props.widgetsettings.main.hasOwnProperty("enable_sound_for_messages")
    && this.props.widgetsettings.main["enable_sound_for_messages"] === false))) {
      return false;
    }

    this.audio.currentTime = 0;
    this.audio.play();
  }

  actionHandler = (action, messages, key, group, options) => {
    
    switch(action) {
      case "customMessageReceived":
      case "messageReceived": {

        const message = messages[0];
        if(message.parentMessageId) {
          this.updateReplyCount(messages);
        } else {

          this.smartReplyPreview(messages);
          this.appendMessage(messages);
        }

        this.playAudio();
      }
      break;
      case "messageRead":
        this.props.actionGenerated(action, messages);
      break;
      case "messageComposed":
        this.appendMessage(messages); 

        this.props.actionGenerated("messageComposed", messages);
      break;
      case "messageUpdated":
        this.updateMessages(messages);
      break;
      case "messageFetched":
        this.prependMessages(messages);
      break;
      case "messageFetchedAgain": 
        this.prependMessagesAndScrollBottom(messages);
      break;
      case "messageDeleted":
        this.removeMessages(messages);
      break;
      case "viewMessageThread":
        this.props.actionGenerated("viewMessageThread", messages);
      break;
      case "deleteMessage":
        this.deleteMessage(messages);
      break;
      case "editMessage":
        this.editMessage(messages);
      break;
      case "messageEdited":
        this.messageEdited(messages);
        break;
      case "clearEditPreview":
        this.clearEditPreview();
        break;
      case "groupUpdated":
        this.groupUpdated(messages, key, group, options);
      break;
      case "roomGroupUpdated":
        this.roomGroupUpdated(messages, key, group, options);
      break;
      case "showStartChat":
        this.showStartChat(messages, key, group, options);
      break;
      case "callUpdated":
        this.callUpdated(messages);
      break;
      case "pollAnswered": 
        this.updatePollMessage(messages)
      break;
      case "pollCreated":
        this.appendPollMessage(messages)
      break;
      case "viewActualImage":
        this.props.actionGenerated("viewActualImage", messages);
      break;
      case "audioCall":
      case "videoCall":
      case "viewDetail":
      case "menuClicked":
        this.props.actionGenerated(action);
        break;
      case "sendReaction":
        this.toggleReaction(true);
      break;
      case "showReaction":
        this.showReaction(messages);
        break;
      case "stopReaction":
        this.toggleReaction(false);
      break;
      default:
      break;
    }
  }

  toggleReaction = (flag) => {
    this.setState({ liveReaction: flag});
  }

  showReaction = (reaction) => {
    console.log(reaction);
    if(!reaction.hasOwnProperty("metadata")) {
      return false;
    }

    if (!reaction.metadata.hasOwnProperty("type") || !reaction.metadata.hasOwnProperty("reaction")) {
      return false;
    }

    if (!enums.LIVE_REACTIONS.hasOwnProperty(reaction.metadata.reaction)) {
      return false;
    }

    if (reaction.metadata.type === enums.LIVE_REACTION_KEY) {

      this.reactionName = reaction.metadata.reaction;
      this.setState({ liveReaction: true });
    }
  }

  deleteMessage = (message) => {

    const messageId = message.id;
    CometChat.deleteMessage(messageId).then(deletedMessage => {

      this.removeMessages([deletedMessage]);

      const messageList = [...this.state.messageList];
      let messageKey = messageList.findIndex(m => m.id === message.id);

      if (messageList.length - messageKey === 1 && !message.replyCount) {
        this.props.actionGenerated("messageDeleted", [deletedMessage]);
      }
      
    }).catch(error => {
      console.log("Message delete failed with error:", error);
    });
  }

  editMessage = (message) => {
    this.setState({ messageToBeEdited: message, replyPreview: null });
  }

  messageEdited = (message) => {
    
    const messageList = [...this.state.messageList];
    let messageKey = messageList.findIndex(m => m.id === message.id);
    if (messageKey > -1) {

      const messageObj = messageList[messageKey];

      const newMessageObj = Object.assign({}, messageObj, message);

      messageList.splice(messageKey, 1, newMessageObj);
      this.updateMessages(messageList);

      if (messageList.length - messageKey === 1 && !message.replyCount) {
        this.props.actionGenerated("messageEdited", [newMessageObj]);
      }
      
    }
  }

  updatePollMessage = (message) => {

    const messageList = [...this.state.messageList];
    const messageId = message.poll.id;
    let messageKey = messageList.findIndex((m, k) => m.id === messageId);
    if (messageKey > -1) {

      const messageObj = messageList[messageKey]; 

      const metadataObj = { "@injected": { "extensions": { "polls": message.poll }}};

      const newMessageObj = { ...messageObj, "metadata": metadataObj };

      messageList.splice(messageKey, 1, newMessageObj);
      this.updateMessages(messageList);
    }
  }

  appendPollMessage = (messages) => {

    this.appendMessage(messages); 
  }

  //messages are deleted
  removeMessages = (messages) => {

    const deletedMessage = messages[0];
    const messagelist = [...this.state.messageList];

    let messageKey = messagelist.findIndex(message => message.id === deletedMessage.id);
    if (messageKey > -1) {

      let messageObj = { ...messagelist[messageKey] };
      let newMessageObj = Object.assign({}, messageObj, deletedMessage);

      messagelist.splice(messageKey, 1, newMessageObj);
      this.setState({ messageList: messagelist, scrollToBottom: false });
    }
  }

  //messages are fetched from backend
  prependMessages = (messages) => {

    const messageList = [...messages, ...this.state.messageList];
    this.setState({ messageList: messageList, scrollToBottom: false });
  }

  prependMessagesAndScrollBottom = (messages) => {
    const messageList = [...messages, ...this.state.messageList];
    this.setState({ messageList: messageList, scrollToBottom: true });
  }

  //message is received or composed & sent
  appendMessage = (message) => {

    let messages = [...this.state.messageList];
    messages = messages.concat(message);
    this.setState({ messageList: messages, scrollToBottom: true });
  }

  //message status is updated
  updateMessages = (messages) => {
    this.setState({ messageList: messages, scrollToBottom: false });
  }

  groupUpdated = (message, key, group, options) => {

    if (validateWidgetSettings(this.props.widgetsettings, "hide_join_leave_notifications") !== true) {
      this.appendMessage([message]);
    }

    this.props.actionGenerated("groupUpdated", message, key, group, options);
  }

  roomGroupUpdated = (message, key, group, options) => {
    this.updateMemberJoined(group, options);
  }

  showStartChat = (message, key, group, options) => {
    this.starChatShow(group, options);
  }


  starChatShow = (group, options) => {
    group.name = group.table_name;
      let groupObj = { ...group };
      const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
      let item = newGroupObj;
      let type = 'group';
      this.props.actionGenerated("itemClicked", item, '',type);
  } 

  updateMemberJoined = (group, options) => {

    let groupType = 'public';
    let password = "";
    if(groupType === CometChat.GROUP_TYPE.PASSWORD) {
      password = prompt("Enter your password");
    } 
    
    let user_count = group.total_users && group.total_users > 0 ? group.total_users : 0;
    console.log(group.table_size);
    console.log(group.total_users);
    console.log(group);
    if( group.table_size > group.total_users ){
      console.log(group.group_id);
      CometChat.joinGroup(group.table_id, groupType, password).then(response => {
        
        console.log("Group joining success with response", response, "group", group);
        const user = {
          user_id: WP_API_CONSTANTS.WP_USER_ID,
          guid: group.table_id,
          ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
          roomid:group.room_id
        };
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_JOINTABLE}`;
      
        axios.post( api_url , user).then(res => {
          console.log("Table join successfully:", res);
          let groupObj = { ...group };
        const newGroupObj = Object.assign({}, groupObj, response, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
        let item = newGroupObj;
        // let type = 'group';
        let roomUpdated = true;
        let type = {
          type: 'group',
          roomUpdated: roomUpdated
        };
        
        this.props.actionGenerated("itemClicked", item, '',type);
          
        })
        
          
      }).catch(error => {
        if( error.code == "ERR_ALREADY_JOINED" ){
          const user = {
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            guid: group.table_id,
            ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
            roomid:group.room_id
          };
          let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_JOINTABLE}`;
        
          axios.post( api_url , user).then(res => {
            console.log("Table join successfully:", res);
            let groupObj = { ...group };
          const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
          let item = newGroupObj;
          // let type = 'group';
          let roomUpdated = true;
          let type = {
            type: 'group',
            roomUpdated: roomUpdated
          };
          this.props.actionGenerated("itemClicked", item, '',type);
          removeLoader();
          })
        }
       
        console.log("Group joining failed with exception:", error);
      });
      
    }else{
      let groupObj = { ...group };
      const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
      let item = newGroupObj;
      // let type = 'group';
      
      let roomUpdated = true;
      let type = {
        type: 'group',
        roomUpdated: roomUpdated,
        roomNotUpdated: true
      };
      this.getGrouptable(group.room_id);
      removeLoader();
      // this.props.actionGenerated("itemClicked", item, '',type)
    }
    
  } 

  callUpdated = (message) => {

    //if call actions messages are disabled in chat widget
    if (validateWidgetSettings(this.props.widgetsettings, "show_call_notifications") === false) {
      return false;
    }

    this.appendMessage([message]);
  }

  updateReplyCount = (messages) => {

    const receivedMessage = messages[0];
  
    let messageList = [...this.state.messageList];
    let messageKey = messageList.findIndex(m => m.id === receivedMessage.parentMessageId);
    if (messageKey > -1) {

      const messageObj = messageList[messageKey];
      let replyCount = (messageObj.replyCount) ? messageObj.replyCount : 0;
      replyCount = replyCount + 1;
      const newMessageObj = Object.assign({}, messageObj, { "replyCount": replyCount });
      
      messageList.splice(messageKey, 1, newMessageObj);
      this.setState({ messageList: messageList, scrollToBottom: false });
    }
  }

  smartReplyPreview = (messages) => {

    const message = messages[0];
    
    if (message.hasOwnProperty("metadata")) {

      const metadata = message.metadata;
      if (metadata.hasOwnProperty("@injected")) {

        const injectedObject = metadata["@injected"];
        if (injectedObject.hasOwnProperty("extensions")) {

          const extensionsObject = injectedObject["extensions"];
          if (extensionsObject.hasOwnProperty("smart-reply")) {

            const smartReply = extensionsObject["smart-reply"];
            if (smartReply.hasOwnProperty("error") === false) {
              this.setState({ replyPreview: message });
            } else {
              this.setState({ replyPreview: null });
            }
            
          }
        }
      }
    }
  }

  clearEditPreview = () => {
    this.setState({ "messageToBeEdited":  "" });
  }

  render() {

    let messageComposer = (
      <MessageComposer 
      theme={this.theme}
      item={this.props.item} 
      type={this.props.type}
      messageToBeEdited={this.state.messageToBeEdited}
      replyPreview={this.state.replyPreview}
      reaction={this.reactionName}
      widgetsettings={this.props.widgetsettings}
      enableCreatePoll={this.props.enableCreatePoll}
      actionGenerated={this.actionHandler} />
    );
    if(this.props.hasOwnProperty("widgetsettings")
    && this.props.widgetsettings
    && this.props.widgetsettings.hasOwnProperty("main") 
    && this.props.widgetsettings.main.hasOwnProperty("enable_sending_messages")
    && this.props.widgetsettings.main["enable_sending_messages"] === false) {
      messageComposer = null;
    }
if (validateWidgetSettings(this.props.widgetsettings, "enable_sending_messages") === false) {
      messageComposer = null;
    }

let liveReactionView = null;
    if (this.state.liveReaction) {
      liveReactionView = (
        <div css={reactionsWrapperStyle()}>
          <LiveReaction reaction={this.reactionName} theme={this.theme} />
        </div>
      );
    }

    if( this.props.type == "rooms" ){
      messageComposer = null;
    }
  
    // let joinVideocall = false;
    // if( this.props.callStatus == false ){
    //   this.props.videocall = true;
    // }
    return (
      <div css={chatWrapperStyle(this.theme)}>
        <MessageHeader 
        sidebar={this.props.sidebar}
        theme={this.theme}
        item={this.props.item} 
        type={this.props.type} 
        callStatus={this.props.callStatus}
        viewdetail={this.props.viewdetail === false ? false : true}
        audiocall={this.props.audiocall === false ? false : true}
        videocall={this.props.videocall === false ? false : true}
        widgetsettings={this.props.widgetsettings}
        loggedInUser={this.props.loggedInUser}
        actionGenerated={this.props.actionGenerated} />
        
        <MessageList 
        theme={this.theme}
        messages={this.state.messageList} 
        rooms={this.state.roomTableList}
        item={this.props.item} 
        type={this.props.type}
        scrollToBottom={this.state.scrollToBottom}
        messageconfig={this.props.messageconfig}
        widgetsettings={this.props.widgetsettings}
        widgetconfig={this.props.widgetconfig}
        loggedInUser={this.props.loggedInUser}
        actionGenerated={this.actionHandler} />
        {liveReactionView}
        {messageComposer}
      </div>
    )
  }
}

export default CometChatMessageListScreen;