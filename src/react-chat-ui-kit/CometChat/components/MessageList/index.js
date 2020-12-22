import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import { MessageListManager } from "./controller";

import * as enums from "../../util/enums.js";
import { validateWidgetSettings } from "../../util/common";

import SenderMessageBubble from "../SenderMessageBubble";
import ReceiverMessageBubble from "../ReceiverMessageBubble";
import SenderImageBubble from "../SenderImageBubble";
import ReceiverImageBubble from "../ReceiverImageBubble";
import SenderFileBubble from "../SenderFileBubble";
import ReceiverFileBubble from "../ReceiverFileBubble";
import SenderAudioBubble from "../SenderAudioBubble";
import ReceiverAudioBubble from "../ReceiverAudioBubble";
import SenderVideoBubble from "../SenderVideoBubble";
import ReceiverVideoBubble from "../ReceiverVideoBubble";
import DeletedMessageBubble from "../DeletedMessageBubble";
import SenderPollBubble from "../SenderPollBubble";
import ReceiverPollBubble from "../ReceiverPollBubble";
import SenderStickerBubble from "../SenderStickerBubble";
import ReceiverStickerBubble from "../ReceiverStickerBubble";

import CallMessage from "../CallMessage";
import { SvgAvatar } from '../../util/svgavatar';
import Avatar from "../Avatar";
import axios from 'axios';
import { WP_API_CONSTANTS, COMETCHAT_CONSTANTS, COMETCHAT_VARS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';
import { addLoader, removeLoader } from '../../../../loader';
import './style.css';
import { GroupListManager } from "../CometChatGroupList/controller";

import { 
  chatListStyle,
  roomTableStyle,
  listWrapperStyle,
  actionMessageStyle,
  actionMessageTxtStyle,
  messageDateContainerStyle,
  roomTableDivStyle,
  messageDateStyle,
  decoratorMessageStyle,
  decoratorMessageTxtStyle
} from "./style";
import TableView from "../TableView";

class MessageList extends React.PureComponent {
  loggedInUser = null;
  lastScrollTop = 0;
  times = 0;
  decoratorMessage = "Loading...";

  constructor(props) {

    super(props);
    this.state = {
      onItemClick: null,
      loading: false,
      checkUserJoinRoom: false
    }
    this.loggedInUser = this.props.loggedInUser;
    this.messagesEnd = React.createRef();
  }

  componentDidMount() {
    // if( COMETCHAT_CONSTANTS.MODE == COMETCHAT_VARS.CHAT_MODE_NBR ) {
    //   new CometChatManager().getLoggedInUser().then((user) => {
    //     console.log(user);
        
    //     this.loggedInUser = user;
    //     console.log(this.loggedInUser);
    //   }).catch((error) => {
    //     console.log("[CometChatUnified] getLoggedInUser error", error);
    //   });
    // }else{
      
      new CometChatManager().getLoggedInUser().then((user) => {
        
        this.loggedInUser = user;
      }).catch((error) => {
        console.log("[CometChatUnified] getLoggedInUser error", error);
      });
    // }
    if(this.props.parentMessageId) {
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type,this.props.parentMessageId);
    } else {
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type);
    }
    
    if( this.props.type === 'rooms' ){
      
      this.MessageListManager.attachListeners(this.messageUpdated);
    }else{
      // console.log(script1);
      this.getMessages();
      this.MessageListManager.attachListeners(this.messageUpdated);
    }
    if( COMETCHAT_CONSTANTS.MODE == COMETCHAT_VARS.CHAT_MODE_NBR ) {
      this.checkUserRoom();
    }else{
      
    }
    
    this.MessageListManager.attachListeners(this.messageUpdated);
  }

  componentDidUpdate(prevProps, prevState) {
   
    const previousMessageStr = JSON.stringify(prevProps.messages);
    const currentMessageStr = JSON.stringify(this.props.messages);

    if (this.props.type === 'user' && prevProps.item.uid !== this.props.item.uid) {
      // this.MessageListManager.removeListeners();

      // if (this.props.parentMessageId) {
      //   this.MessageListManager = new MessageListManager(this.props.widgetsettings, this.props.item, this.props.type, this.props.parentMessageId);
      // } else {
      //   this.MessageListManager = new MessageListManager(this.props.widgetsettings, this.props.item, this.props.type);
      // }

      // this.getMessages();
      // this.MessageListManager.attachListeners(this.messageUpdated);


      this.MessageListManager.removeListeners();
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type);
      this.getMessages();
      this.MessageListManager.attachListeners(this.messageUpdated);

    } else if (this.props.type === 'wpgroup' || this.props.type === 'rooms' ){
      
      this.MessageListManager.removeListeners();
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type);
      // this.getMessages();
      this.checkUserRoom();
      this.MessageListManager.attachListeners(this.messageUpdated);
    } else if (this.props.type === 'group' && prevProps.item.guid !== this.props.item.guid){

      this.MessageListManager.removeListeners();
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type);
      this.getMessages();
      this.MessageListManager.attachListeners(this.messageUpdated);
      
    } else if(prevProps.parentMessageId !== this.props.parentMessageId) {
        
      this.MessageListManager.removeListeners();
      this.MessageListManager = new MessageListManager(this.props.item, this.props.type, this.props.parentMessageId);
      this.getMessages();
      this.MessageListManager.attachListeners(this.messageUpdated);

    } else if (previousMessageStr !== currentMessageStr) {
      
      if(this.props.scrollToBottom) {
        this.scrollToBottom();
      } else {
        this.scrollToBottom(this.lastScrollTop);
      }
      
    }
  }

  scrollToBottom = (scrollHeight = 0) => {
    
    if (this.messagesEnd) {
      this.messagesEnd.scrollTop = (this.messagesEnd.scrollHeight - scrollHeight);
    }
  }

  getMessages = (scrollToBottom = false) => {

    const actionMessages = [];
    
    new CometChatManager().getLoggedInUser().then((user) => {
      console.log(user);
      //this.loggedInUser = user;
      this.MessageListManager.fetchPreviousMessages().then(messageList => {
        console.log("szfsf",messageList);
        if (messageList.length === 0) {
          this.decoratorMessage = "No messages found";
        }

        messageList.forEach((message) => {
          
          if (message.category === "action" && message.sender.uid === "app_system") {
            actionMessages.push(message);
          }

          //if the sender of the message is not the loggedin user, mark it as read.
          if (message.getSender().getUid() !== user.getUid() && !message.getReadAt()) {
            
            if(message.getReceiverType() === "user") {

              CometChat.markAsRead(message.getId().toString(), message.getSender().getUid(), message.getReceiverType());

            } else if(message.getReceiverType() === "group") {

              CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
            }
          }
          this.props.actionGenerated("messageRead", message);
        });

        let actionGenerated = "messageFetched";
        if (scrollToBottom === true) {
          actionGenerated = "messageFetchedAgain";
        }
      
        ++this.times;

          if ((this.times === 1 && actionMessages.length > 5)
            || (this.times > 1 && actionMessages.length === 30)) {

            this.props.actionGenerated("messageFetched", messageList);
            this.getMessages(true);

          } else {

            this.lastScrollTop = this.messagesEnd.scrollHeight;
            this.props.actionGenerated(actionGenerated, messageList);
          }
          
      }).catch((error) => {
        //TODO Handle the erros in contact list.
        console.error("[MessageList] getMessages fetchPrevious error", error);
        this.decoratorMessage = "Error";
      });

    }).catch((error) => {
      console.log("[MessageList] getMessages getLoggedInUser error", error);
      this.decoratorMessage = "Error";
    });

  }
  
  checkUserRoom = () => {

    let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.CHECK_USERJOIN_STATUS}`;
    axios.get( api_url, { params: {
      user_id: WP_API_CONSTANTS.WP_USER_ID
    } } ).then(userRoom => {
      if( userRoom.data.success == false ){
        this.setState({ checkUserJoinRoom: null });
      }else{
        this.setState({ checkUserJoinRoom: userRoom.data.data.table_id });
      }
      
    }).catch(error => {

      this.decoratorMessage = "Error";
      console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
    });

  }
  //callback for listener functions
  messageUpdated = (key, message, group, options) => {
    switch(key) {

      case enums.MESSAGE_DELETED:
        this.messageDeleted(message);
        break;
      case enums.MESSAGE_EDITED:
        this.messageEdited(message);
        break;
      case enums.MESSAGE_DELIVERED:
      case enums.MESSAGE_READ:
        this.messageReadAndDelivered(message);
        break;
      case enums.TEXT_MESSAGE_RECEIVED:
      case enums.MEDIA_MESSAGE_RECEIVED:
        this.messageReceived(message);
        break;
      case enums.CUSTOM_MESSAGE_RECEIVED:
        this.customMessageReceived(message);
        break;
      case enums.GROUP_MEMBER_SCOPE_CHANGED:
      case enums.GROUP_MEMBER_JOINED:
      case enums.GROUP_MEMBER_LEFT:
      case enums.GROUP_MEMBER_ADDED:
      case enums.GROUP_MEMBER_KICKED:
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_UNBANNED:
        this.groupUpdated(key, message, group, options);
        break;
      case enums.INCOMING_CALL_RECEIVED:
      case enums.INCOMING_CALL_CANCELLED:
      case enums.OUTGOING_CALL_ACCEPTED:
      case enums.OUTGOING_CALL_REJECTED:
        this.callUpdated(message);
        break;
      default:
        break;
    }
  }

  messageDeleted = (message) => {

    if (this.props.type === 'group' 
    && message.getReceiverType() === 'group'
    && message.getReceiver().guid === this.props.item.guid) {

      this.props.actionGenerated("messageDeleted", [message]);
        
    } else if (this.props.type === 'user' 
    && message.getReceiverType() === 'user'
      && message.getSender().uid === this.props.item.uid) {

      this.props.actionGenerated("messageDeleted", [message]);
    }
  }

  messageEdited = (message) => {

    if ((this.props.type === 'group' && message.getReceiverType() === 'group' && message.getReceiver().guid === this.props.item.guid) 
      || (this.props.type === 'user' && message.getReceiverType() === 'user' && message.getReceiverId() === this.props.item.uid)) {

      const messageList = [...this.props.messages];
      let messageKey = messageList.findIndex((m, k) => m.id === message.id);

      if (messageKey > -1) {

        const messageObj = messageList[messageKey];
        const newMessageObj = Object.assign({}, messageObj, message);

        messageList.splice(messageKey, 1, newMessageObj);
        this.props.actionGenerated("messageUpdated", messageList);
      }

    }

    if (message.category === enums.CATEGORY_CUSTOM && message.type === enums.CUSTOM_TYPE_POLL) {

      if ((this.props.type === 'group' && message.getReceiverType() === 'group' && message.getReceiver().guid === this.props.item.guid)
        || (this.props.type === 'user' && message.getReceiverType() === 'user' && message.getReceiver().uid === this.props.item.uid)) {

        this.updateEditedMessage(message);
      } 

    } else {

      if ((this.props.type === 'group' && message.getReceiverType() === 'group' && message.getReceiver().guid === this.props.item.guid) 
        || (this.props.type === 'user' && message.getReceiverType() === 'user' && message.getSender().uid === this.props.item.uid)) {

        this.updateEditedMessage(message);
      } 
    }
  }

  updateEditedMessage = (message) => {

    const messageList = [...this.props.messages];
    let messageKey = messageList.findIndex((m, k) => m.id === message.id);

    if (messageKey > -1) {

      const messageObj = messageList[messageKey];
      const newMessageObj = Object.assign({}, messageObj, message);

      messageList.splice(messageKey, 1, newMessageObj);
      this.props.actionGenerated("messageUpdated", messageList);
    } 

  }

  messageReadAndDelivered = (message) => {

    //read receipts
    if (message.getReceiverType() === 'user'
    && message.getSender().getUid() === this.props.item.uid
    && message.getReceiver() === this.loggedInUser.uid) {

      let messageList = [...this.props.messages];
      
      if (message.getReceiptType() === "delivery") {

        //search for message
        let messageKey = messageList.findIndex(m => m.id === message.messageId);

        if (messageKey > -1) {

          let messageObj = { ...messageList[messageKey] };
          let newMessageObj = Object.assign({}, messageObj, { deliveredAt: message.getDeliveredAt() });
          messageList.splice(messageKey, 1, newMessageObj);

          this.props.actionGenerated("messageUpdated", messageList);
        }

      } else if (message.getReceiptType() === "read") {

        //search for message
        let messageKey = messageList.findIndex(m => m.id === message.messageId);

        if (messageKey > -1) {

          let messageObj = { ...messageList[messageKey] };
          let newMessageObj = Object.assign({}, messageObj, { readAt: message.getReadAt() });
          messageList.splice(messageKey, 1, newMessageObj);

          this.props.actionGenerated("messageUpdated", messageList);
        }

      }

    } else if (message.getReceiverType() === 'group' 
      && message.getReceiver().guid === this.props.item.guid) {
      //not implemented
    }

  }

  messageReceived = (message) => {

    //new messages
    if (this.props.type === 'group' 
      && message.getReceiverType() === 'group'
      && message.getReceiverId() === this.props.item.guid) {

      if(!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      }
      
      this.props.actionGenerated("messageReceived", [message]);
        
    } else if (this.props.type === 'user' 
      && message.getReceiverType() === 'user'
      && message.getSender().uid === this.props.item.uid) {

      if(!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getSender().uid, message.getReceiverType());
      }

      this.props.actionGenerated("messageReceived", [message]);
    }
  }

  customMessageReceived = (message) => {

    //new messages
    if (this.props.type === 'group'
      && message.getReceiverType() === 'group'
      && message.getReceiverId() === this.props.item.guid) {

      if (!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      }
      
      if (message.hasOwnProperty("metadata")) {

        this.props.actionGenerated("customMessageReceived", [message]);

      } else if (message.type === enums.CUSTOM_TYPE_STICKER) {

        this.props.actionGenerated("customMessageReceived", [message]);

      } else if (message.type === enums.CUSTOM_TYPE_POLL) {//customdata (poll extension) does not have metadata

        const newMessage = this.addMetadataToCustomData(message);
        this.props.actionGenerated("customMessageReceived", [newMessage]);
      }

    } else if (this.props.type === 'user'
      && message.getReceiverType() === 'user'
      && message.getSender().uid === this.props.item.uid) {

      if (!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getSender().uid, message.getReceiverType());
      }

      if (message.hasOwnProperty("metadata")) {

        this.props.actionGenerated("customMessageReceived", [message]);

      }else if (message.type === "extension_poll") {//customdata (poll extension) does not have metadata

        const newMessage = this.addMetadataToCustomData(message);
        this.props.actionGenerated("customMessageReceived", [newMessage]);
      } else if (message.type === enums.CUSTOM_TYPE_STICKER) {

        this.props.actionGenerated("customMessageReceived", [message]);

      } else if (message.type === enums.CUSTOM_TYPE_POLL) {//customdata (poll extension) does not have metadata

        const newMessage = this.addMetadataToCustomData(message);
        this.props.actionGenerated("customMessageReceived", [newMessage]);
      }
    }

  }

  addMetadataToCustomData = (message) => {

    const customData = message.data.customData;
    const options = customData.options;

    const resultOptions = {};
    for (const option in options) {

      resultOptions[option] = {
        text: options[option],
        count: 0,
        voters: []
      }
    }

    const polls = {
      "id": message.id,
      "options": options,
      "results": {
        "total": 0,
        "options": resultOptions,
        "question": customData.question
      },
      "question": customData.question
    };

    return { ...message, "metadata": { "@injected": { "extensions": { "polls": polls } } } };
  }

  callUpdated = (message) => {

    if (validateWidgetSettings(this.props.widgetsettings, "show_call_notifications") === false) {
      return false;
    }
    
    if (this.props.type === 'group'
      && message.getReceiverType() === 'group'
      && message.getReceiverId() === this.props.item.guid) {

      if (!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      }
      
      this.props.actionGenerated("callUpdated", message);

    } else if (this.props.type === 'user'
      && message.getReceiverType() === 'user'
      && message.getSender().uid === this.props.item.uid) {

      if (!message.getReadAt()) {
        CometChat.markAsRead(message.getId().toString(), message.getSender().uid, message.getReceiverType());
      }
      
      this.props.actionGenerated("callUpdated", message);
    }

  }

  groupUpdated = (key, message, group, options) => {
    
    if (this.props.type === 'group' 
    && message.getReceiverType() === 'group'
    && message.getReceiver().guid === this.props.item.guid) {

      // if(!message.getReadAt()) {
      //   CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      // }
      
      this.props.actionGenerated("groupUpdated", message, key, group, options);
    }
  }

  AddgroupUpdated = (key, message, group, options) => {
    if (this.props.type === 'rooms' ) {

      // if(!message.getReadAt()) {
      //   CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      // }
      
      this.props.actionGenerated("roomGroupUpdated", message, key, group, options);
    }
  }


  handleScroll = (e) => {

    const scrollTop = e.currentTarget.scrollTop;
    this.lastScrollTop = this.messagesEnd.scrollHeight - scrollTop;
    
    const top = Math.round(scrollTop) === 0;
    if (top && this.props.messages.length) {
      this.getMessages();
    }
  }

  handleClick = (message) => {
    this.props.onItemClick(message, 'message');
  }

  handlewpgroupsClick = (group) => {
      this.setState({selectedGroup: this.state.grouplist});
      this.props.onItemClick(group, 'wpgroup');
  }

  getSenderMessageComponent = (message, key) => {

    let component;

    if(message.hasOwnProperty("deletedAt")) {
      
      component = (<DeletedMessageBubble theme={this.props.theme} key={key} message={message} messageOf="sender" />);

    } else {

      switch (message.type) {
        case CometChat.MESSAGE_TYPE.TEXT:
          component = (message.text ? <SenderMessageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.IMAGE:
          component = (message.data.url ? <SenderImageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.FILE:
          component = (message.data.attachments ? <SenderFileBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.VIDEO:
          component = (message.data.url ? <SenderVideoBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          component = (message.data.url ? <SenderAudioBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        default:
        break;
      }

    }
    
    return component;
  }

  getReceiverMessageComponent = (message, key) => {

    let component;

    if(message.hasOwnProperty("deletedAt")) {

      component = (<DeletedMessageBubble theme={this.props.theme} key={key} message={message} messageOf="receiver" />);

    } else {

      switch (message.type) {
        case "message":
        case CometChat.MESSAGE_TYPE.TEXT:
          component = (message.text ? <ReceiverMessageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.IMAGE:
          component = (message.data.url ? <ReceiverImageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.FILE:
          component = (message.data.attachments ? <ReceiverFileBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          component = (message.data.url ? <ReceiverAudioBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        case CometChat.MESSAGE_TYPE.VIDEO:
          component = (message.data.url ? <ReceiverVideoBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} /> : null);
        break;
        default:
        break;
      }
    }
    return component;
  }

  getSenderCustomMessageComponent = (message, key) => {

    let component;
    if (message.hasOwnProperty("deletedAt")) {
      component = (<DeletedMessageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} messageOf="sender" />);
    } else {

      switch (message.type) {
		 case "extension_poll":
          component = <SenderPollBubble theme={this.props.theme} key={key} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} />;
          break;
        case enums.CUSTOM_TYPE_POLL:
          component = <SenderPollBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} actionGenerated={this.props.actionGenerated} />;
          break;
        case enums.CUSTOM_TYPE_STICKER:
          component = <SenderStickerBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} actionGenerated={this.props.actionGenerated} />;
          break;
        default:
          break;
      }
    }

    return component;
  }

  getReceiverCustomMessageComponent = (message, key) => {

    let component;
    if (message.hasOwnProperty("deletedAt")) {
      component = (<DeletedMessageBubble theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} messageOf="receiver" />);
    } else {

      switch (message.type) {
		case "extension_poll":
          component = <ReceiverPollBubble user={this.loggedInUser} theme={this.props.theme} key={key} message={message} widgetsettings={this.props.widgetsettings} widgetconfig={this.props.widgetconfig} actionGenerated={this.props.actionGenerated} />;
          break;
        case enums.CUSTOM_TYPE_POLL:
          component = <ReceiverPollBubble user={this.loggedInUser} theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} actionGenerated={this.props.actionGenerated} />;
          break;
        case enums.CUSTOM_TYPE_STICKER:
          component = <ReceiverStickerBubble user={this.loggedInUser} theme={this.props.theme} key={key} item={this.props.item} type={this.props.type} message={message} widgetsettings={this.props.widgetsettings} actionGenerated={this.props.actionGenerated} />;
          break;
        default:
          break;
      }
    }

    return component;
  }

  getCallMessageComponent = (message, key) => {
    return (
      <CallMessage  message={message} key={key} theme={this.props.theme} loggedInUser={this.loggedInUser} />
    );
  }

  onAddUserRoomClick = ( group, options ) => {
    addLoader();
    CometChat.getGroup(group.table_id).then(
      ccpro_group => {
        console.log("Group details fetched successfully:", ccpro_group);
        console.log(group.table_size);
        console.log(ccpro_group.membersCount);
        if( group.table_size > ccpro_group.membersCount ){
          group.total_users = ccpro_group.membersCount;
          this.GroupListManager = new GroupListManager();
          this.GroupListManager.attachListeners(this.AddgroupUpdated( enums.GROUP_MEMBER_JOINED, '', group, options ));
        }else{
          group.total_users = ccpro_group.membersCount;
          let groupObj = { ...group };
          const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
          let item = newGroupObj;
          let type = 'group';
          
          this.props.actionGenerated("roomGroupUpdated", '', '', group, options);
        }
      },
      error => {
        console.log("Group details fetching failed with exception:", error);
      }
    );
    console.log(group);
    console.log(group.table_users.length);
    
    
    
  }

  startChat = ( group, options ) => {
    this.GroupListManager = new GroupListManager();
    this.GroupListManager.attachListeners(this.showStartchat( enums.GROUP_MEMBER_JOINED, '', group, options ));
  }

  showStartchat = (key, message, group, options) => {
    if (this.props.type === 'rooms' ) {
      let groupObj = { ...group };
      const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
      let item = newGroupObj;
      let type = 'group';

      this.props.actionGenerated("itemClicked", item, '',type);
    
      // if(!message.getReadAt()) {
      //   CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      // }
      
      this.props.actionGenerated("showStartChat", message, key, group, options);
    }
  }

  getActionMessageComponent = (message, key) => {

    let component = null;
    if(message.message) {

      component = (
        <div css={actionMessageStyle()} key={key}><p css={actionMessageTxtStyle()}>{message.message}</p></div>
      );

      //if action messages are set to hide in config
      if(this.props.messageconfig) {

        const found = this.props.messageconfig.find(cfg => {
          return (cfg.action === message.action && cfg.category === message.category);
        });
  
        if(found && found.enabled === false) {
          component = null;
        }
      }
      
    }

    return component;
  }
  
  getComponent = (message, key) => {

    let component;
    
    switch(message.category) {
      case "action":
        component = this.getActionMessageComponent(message, key);
      break;
      case "call":
        component = this.getCallMessageComponent(message, key);
      break;
      case "message":
        
        if(this.loggedInUser.uid === message.sender.uid) {
          component = this.getSenderMessageComponent(message, key);
        } else {
          component = this.getReceiverMessageComponent(message, key);
        }
      break;
      case "custom":
        if (this.loggedInUser.uid === message.sender.uid) {
          component = this.getSenderCustomMessageComponent(message, key);
        } else {
          component = this.getReceiverCustomMessageComponent(message, key);
        }
      break;
      default:
      break;
    }

    return component;
  }

  render() {
    let loading = null;
    // if(this.state.loading) {
    //   loading = (
    //     <div css={listLoadingStyle(this.props)}>Loading...</div>
    //   );
    // }
	let messageContainer = null;
    if (this.props.messages.length === 0) {
      messageContainer = (
        <div css={decoratorMessageStyle()} className="messages__decorator-message">
          <p css={decoratorMessageTxtStyle(this.props)} className="decorator-message">{this.decoratorMessage}</p>
        </div>
      );
    }

    let cDate = null;
    if( this.props.type === 'wpgroup' ){
      let image = '';
      
      const messages = Object.values(this.props.item).map((group, key) => {
        
        if(!group.icon) {
            const guid = group.guid;
            const char = group.name.charAt(0).toUpperCase();
    
            group.icon = SvgAvatar.getAvatar(guid, char);
          }
          image = group.icon;
          return(
            <div css={chatListStyle(this.props)}>
              <div css={listWrapperStyle()} ref={(el) => { this.messagesEnd = el; }} onScroll={this.handleScroll}>
                <Avatar 
                image={image} 
                cornerRadius="18px" 
                borderColor={this.props.theme.borderColor.primary}
                borderWidth="1px" />
                {/* <TableView 
                theme={this.props.theme}
                group={group}
                selectedGroup={this.state.selectedGroup}
                clickHandler={this.handlewpgroupsClick} /> */}
                <div onClick={() => this.handlewpgroupsClick(group)}>{group.name}</div>
              </div>
            </div>
          );
      });

      return (
        <div css={chatListStyle(this.props)}>
          <div css={listWrapperStyle()} ref={(el) => { this.messagesEnd = el; }} onScroll={this.handleScroll}>
            {loading}
            {messages}
          </div>
        </div>
      );
    }else if( this.props.type === 'rooms' ){
     
      let roomTableData = this.props.rooms.data;
      let groupData = this.props.item;
      let image = '';
      let messages = '';
      let users = '';
      let users_html = '';
      if( roomTableData == undefined || roomTableData == ""){
        messages = '';
      }else{
        messages = Object.values(roomTableData).map((group, key) => {
        
        if(!group.table_image) {
          const guid = group.joined_tableid;
          const char = group.table_name.charAt(0).toUpperCase();
  
          group.table_image = SvgAvatar.getAvatar(guid, char);
        }
        image = group.table_image;
        const imagee = (image);
        if( group.table_users ){
          
        users_html = Object.values(group.table_users).map((user, key) => {
          return(
            <li key={key}>  
              <img className="ccpro_table-user-avatar" src={user.avatar_url} alt="Vimarsh" />
              <span className="ccpro_tooltip">{user.user_name} {user.last_name}</span>
            </li>
          )
        });

        
      }
      users = (
          <div className={`ccpro_table-users ccpro_table-users-${group.table_size}`} key={key}>
            <ul className="ccpro_table-users-list">
              {users_html}
              
            </ul>
          </div>
        );
        let joinTable = null;
        console.log(this.state.checkUserJoinRoom);
        console.log(group);
        console.log(groupData);
        if( this.state.checkUserJoinRoom ){
          if( group.table_size > group.table_users.length ){
            if( !groupData.joined_tableid && groupData.joined_tableid == this.state.checkUserJoinRoom ){
            
              joinTable = (
                <button className="ccpro_btn" onClick={() => this.onAddUserRoomClick(group, this.loggedInUser)}>
                  Join Table
                </button>
              );
            
            }else{
  
            }
            
          }else{
            joinTable = (
              <button className="tableIsFull">
                Table is full
              </button>
            );
          }
          if( this.state.checkUserJoinRoom == groupData.joined_tableid ){
            
            
            if( groupData.joined_tableid && groupData.joined_tableid == group.table_id ){
            
              joinTable = (
                <button className="ccpro_btn" onClick={() => this.startChat(group, this.loggedInUser)}>
                  Start Chat
                </button>
              );
            }else{
              
            }
          }else{
           
          }
        }else if( !groupData.joined_tableid && !this.state.checkUserJoinRoom ){
          if( group.table_size > group.table_users.length ){
            joinTable = (
              <button className="ccpro_btn" onClick={() => this.onAddUserRoomClick(group, this.loggedInUser)}>
                Join Table
              </button>
            );
          }else{
            joinTable = (
              <button className="tableIsFull">
                Table is full
              </button>
            );
          }
          
          // joinTable = (
          //   <button className="ccpro_btn" onClick={() => this.onAddUserRoomClick(group, this.loggedInUser)}>
          //     Join Table
          //   </button>
          // );
        }else{
          joinTable = null;
        }
        
        return(
          
          <div className={`ccpro_group-table-block ccpro_img-block${group.table_size}`} key={group.table_id}>
            <div className="ccpro_img-block"><span className="details" dangerouslySetInnerHTML={{__html: group.table_image}} /></div> 
            <div className="ccpro_table-name">{group.table_name}</div> 
            {joinTable}
            {users}
          </div>
        );
      });
    }

      return (
        <div css={chatListStyle(this.props)}>
          <div className="ccpro_group-content" css={listWrapperStyle()} ref={(el) => { this.messagesEnd = el; }} onScroll={this.handleScroll}>
            {loading}
            {messages}
          </div>
        </div>
      );
    }else{
      let cDate = null;
      const messages = this.props.messages.map((message, key) => {
       
console.log(new Date(message.sentAt * 1000).toLocaleString());
        let dateSeparator = null;
        const messageSentDate = new Date(message.sentAt * 1000).toLocaleDateString();
        console.log(messageSentDate);
        if (cDate !== messageSentDate) {
          dateSeparator = (<div css={messageDateContainerStyle()} className="message__date"><span css={messageDateStyle(this.props)}>{messageSentDate}</span></div>);
        }
        cDate = messageSentDate;

        return (
          <React.Fragment key={key}>
            {dateSeparator}
            {this.getComponent(message, key)}
          </React.Fragment>
        )
      });

      return (
        <div className="chat__list" css={chatListStyle(this.props)}>
          {messageContainer}
          <div className="list__wrapper" css={listWrapperStyle()} ref={(el) => { this.messagesEnd = el; }} onScroll={this.handleScroll}>
            {messages}
          </div>
        </div>
      );
    }
    

  }

  componentWillUnmount() {
    this.MessageListManager.removeListeners();
    this.MessageListManager = null;
  }
}

export default MessageList;