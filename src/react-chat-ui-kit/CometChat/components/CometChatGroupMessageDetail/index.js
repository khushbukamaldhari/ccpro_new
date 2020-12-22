import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import { SvgAvatar } from '../../util/svgavatar';

import * as enums from '../../util/enums.js';

import { GroupDetailManager } from "./controller";
import GroupDetailContext from './context';

import MessageHeader from "../MessageHeader";
import MessageList from "../MessageList";
import MessageComposer from "../MessageComposer";
import CometChatViewMembers from "../CometChatViewMembers";
import CometChatAddMembers from "../CometChatAddMembers";
import CometChatBanMembers from "../CometChatBanMembers";

import SharedMediaView from "../SharedMediaView";

import { incomingMessageAlert } from "../../resources/audio/";
import { theme } from "../../resources/theme";
import {
    detailStyle,
    headerStyle,
    headerCloseStyle,
    headerTitleStyle,
    detailPaneStyle,
    sectionStyle,
    sectionHeaderStyle,
    sectionContentStyle,
    contentItemStyle,
    itemLinkStyle,
    chatWrapperStyle
} from "./style";

import navigateIcon from "./resources/navigate_before.svg";
import axios from 'axios';
import { WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';

class CometChatGroupMessageDetail extends React.Component {

    constructor(props) {

        super(props);
    
        this.state = {
          messageList: [],
          roomTableList: [],
          scrollToBottom: true
        }
    
        this.theme = Object.assign({}, theme, this.props.theme);
      }
    
      componentDidMount() {
        if (this.props.type === 'rooms' ){
          this.getGrouptable();
        }
        this.audio = new Audio(incomingMessageAlert);
      }
    
      getGrouptable = () => {
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOMTABLES}/${this.props.item.ID}`;
        
        axios.get( api_url ).then(roomListTable => {
          roomListTable['group'] = this.props.item;
          if(roomListTable.data.length === 0) {
            this.decoratorMessage = "No rooms found";
          }
          roomListTable.data.map((group, key) => {
            group.guid = group.table_id;
            group.icon = group.table_image;
            group.name = group.table_name;
            group.membersCount = group.table_users.length;
          });
          
          this.setState({ roomTableList: roomListTable });
    
        }).catch(error => {
    
          this.decoratorMessage = "Error";
          console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
        });
      }
    
      componentDidUpdate(prevProps, prevState) {
        if (this.props.type === 'user' && prevProps.item.uid !== this.props.item.uid) {
          
          this.setState({ messageList: [], scrollToBottom: true});
    
        } else if (this.props.type === 'group' && prevProps.item.guid !== this.props.item.guid) {
          
          this.setState({ messageList: [], scrollToBottom: true });
    
        }else if (this.props.type === 'rooms' && prevProps.item.ID !== this.props.item.ID) {
    
          if (Object.keys(this.props.item).length === 0) {
    
            this.groupListRef.scrollTop = 0;
            // this.setState({ selectedGroup: {} });
    
          } else {
            this.getGrouptable();
            
          }
        }else if(prevProps.type !== this.props.type) {
          
          this.setState({ messageList: [], scrollToBottom: true });
    
        } else if(prevProps.composedthreadmessage !== this.props.composedthreadmessage) {
    
          this.updateReplyCount(this.props.composedthreadmessage);
    
        } else if(prevProps.callmessage !== this.props.callmessage) {
    
          this.actionHandler("callUpdated", this.props.callmessage);
        }
        
      }
    
      playAudio = () => {
    
        this.audio.currentTime = 0;
        this.audio.play();
      }
    
      actionHandler = (action, messages, key, group, options) => {
        console.log(action);
        switch(action) {
          case "customMessageReceived":
          case "messageReceived": {
    
            const message = messages[0];
            if(message.parentMessageId) {
              this.updateReplyCount(messages);
            } else {
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
          case "groupUpdated":
            this.groupUpdated(messages, key, group, options);
          break;
          case "roomGroupUpdated":
            this.roomGroupUpdated(messages, key, group, options);
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
          default:
          break;
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
    
        const deletedMessage = messages[0]; console.log("deletedMessage", deletedMessage);
        const messagelist = [...this.state.messageList];
    
        let messageKey = messagelist.findIndex(message => message.id === deletedMessage.id);
        if (messageKey > -1) {
    
          let messageObj = { ...messagelist[messageKey] }; console.log("messageObj", messageObj);
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
        this.appendMessage([message]);
        this.props.actionGenerated("groupUpdated", message, key, group, options);
      }
    
      roomGroupUpdated = (message, key, group, options) => {
        this.updateMemberJoined(group, options);
      }
    
      updateMemberJoined = (group, options) => {
    
        let groupType = 'public';
        let password = "";
        if(groupType === CometChat.GROUP_TYPE.PASSWORD) {
          password = prompt("Enter your password");
        } 
        console.log(group.table_size);
        console.log(group.total_users);
        if( group.table_size > group.total_users ){
          console.log(group.group_id);
          CometChat.joinGroup(group.group_id, groupType, password).then(response => {
    
            console.log("Group joining success with response", response, "group", group);
            const user = {
              user_id: WP_API_CONSTANTS.WP_USER_ID,
              guid: group.group_id
            };
            let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_JOINTABLE}`;
          
            axios.post( api_url , { user })
              .then(res => {
              console.log(res);
              console.log(res.data);
            })
            let groupObj = { ...group };
            const newGroupObj = Object.assign({}, groupObj, response, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
            let item = newGroupObj;
            let type = 'group';
            this.props.actionGenerated("itemClicked", item, '',type)
              
          }).catch(error => {
            console.log("Group joining failed with exception:", error);
          });
          
        }else{
          let groupObj = { ...group };
          const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
          let item = newGroupObj;
          let type = 'group';
          this.props.actionGenerated("itemClicked", item, '',type)
        }
        
      } 
    
      callUpdated = (message) => {
        this.appendMessage([message]);
      }
    
      updateReplyCount = (messages) => {
    
        const receivedMessage = messages[0];
    
        const messageList = [...this.state.messageList];
    
        let messageIndex = -1, messageFound = {};
        messageList.forEach((message, index) => {
    
          if(message.id === receivedMessage.parentMessageId) {
    
            messageIndex = index;
            let replyCount = (message.replyCount) ? message.replyCount : 0;
            messageFound = Object.assign({}, message, {"replyCount": ++replyCount});
          }
    
        });
        
        messageList.splice(messageIndex, 1, messageFound);
        this.setState({messageList: [...messageList], scrollToBottom: false});
      }

    render() {

       

        console.log("asfdsadf");
        let messageComposer = (
            <MessageComposer 
            theme={this.theme}
            item={this.props.item} 
            type={this.props.type}
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
      console.log(this.state.messageList);
          return (
            <div css={detailStyle(this.props)}>
                    
                    <div css={headerStyle(this.props)}>
                        <div css={headerCloseStyle(navigateIcon)} onClick={() => this.props.actionGenerated("closeDetailClicked")}></div>
                        <h4 css={headerTitleStyle()}>
                        <MessageHeader 
                        sidebar={this.props.sidebar}
                        theme={this.theme}
                        item={this.props.item} 
                        type={this.props.type} 
                        viewdetail={this.props.viewdetail === false ? false : true}
                        audiocall={this.props.audiocall === false ? false : true}
                        videocall={this.props.videocall === false ? false : true}
                        widgetsettings={this.props.widgetsettings}
                        loggedInUser={this.props.loggedInUser}
                        actionGenerated={this.props.actionGenerated} /></h4>
                    </div>
                    <div css={detailPaneStyle()}>
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
                    </div>
                    {messageComposer}             
            </div>
            // <div css={chatWrapperStyle(this.theme)}>
             
            //   
            // </div>
          )
        }
}

export default CometChatGroupMessageDetail;