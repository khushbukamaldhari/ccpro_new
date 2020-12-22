import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import CometChatUserList from "../../CometChatUserList";
import CometChatGroupList from "../../CometChatGroupList";
import CometChatWpGroupList from "../../CometChatWpGroupList";
import CometChatRoomList from "../../CometChatRoomList";
import CometChatConversationList from "../../CometChatConversationList";
import CometChatUserInfoScreen from "../../CometChatUserInfoScreen";

import {
  footerStyle,
  navbarStyle,
  itemStyle,
  itemLinkStyle
} from "./style";

import chatGreyIcon from "./resources/chat-grey-icon.svg";
import chatBlueIcon from "./resources/chat-blue-icon.f2b6b911.svg";
import contactGreyIcon from "./resources/people-grey-icon.svg";
import contactWhiteIcon from "./resources/people-white-icon.svg";
import contactBlueIcon from "./resources/people-blue-icon.svg";
import groupGreyIcon from "./resources/group-chat-grey-icon.svg";
import groupWhiteIcon from "./resources/group-chat-white-icon.svg";
import groupBlueIcon from "./resources/group-chat-blue-icon.svg";
import moreGreyIcon from "./resources/more-grey-icon.svg";
import moreBlueIcon from "./resources/more-blue-icon.svg";
import './style.css';

import axios from 'axios';
import {WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS} from "./../../../../../consts"

class Navbar extends React.Component {

  constructor(props) {

    super(props);
    
    this.sidebar = React.createRef();
  }

  getDefaultComponent = () => {
    switch (this.props.tab) {
      
      case "wpcontacts":
        return <CometChatUserList
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          actionGenerated={this.props.actionGenerated}
          enableCloseMenu={this.props.enableCloseMenu}
          onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;

      case "calls":
        return "calls";
      case "conversations":
        return <CometChatConversationList
          ref={this.sidebar}
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          lastMessage={this.props.lastMessage}
          groupToUpdate={this.props.groupToUpdate}
          messageToMarkRead={this.props.messageToMarkRead}
          actionGenerated={this.props.actionGenerated}
          enableCloseMenu={this.props.enableCloseMenu}
          onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
        case "contacts":
          return <CometChatUserList
          ref={this.sidebar}
            theme={this.props.theme}
            item={this.props.item}
            type={this.props.type}
            actionGenerated={this.props.actionGenerated}
            enableCloseMenu={this.props.enableCloseMenu}
            onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
  
      case "groups":
        return <CometChatGroupList
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          groupToLeave={this.props.groupToLeave}
          groupToDelete={this.props.groupToDelete}
          groupToUpdate={this.props.groupToUpdate}
          actionGenerated={this.props.actionGenerated}
          enableCloseMenu={this.props.enableCloseMenu}
          onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
      case "wpgroups":
        return <CometChatWpGroupList
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          groupToLeave={this.props.groupToLeave}
          groupToDelete={this.props.groupToDelete}
          groupToUpdate={this.props.groupToUpdate}
          actionGenerated={this.props.actionGenerated}
          enableCloseMenu={this.props.enableCloseMenu}
          onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
      case "rooms":
        if( WP_API_CONSTANTS.ENABLE_ROOM == "" ){
          // this.setState({ tab: 'contacts', type: 'user', isRoomShow: false });
        }else{
          return <CometChatRoomList
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          roomUpdate={this.props.roomUpdate}
          roomToLeave={this.props.roomToLeave}
          roomToDelete={this.props.roomToDelete}
          roomToUpdate={this.props.roomToUpdate}
          actionGenerated={this.props.actionGenerated}
          enableCloseMenu={this.props.enableCloseMenu}
          onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
        }
        
      case "info":
        // return <CometChatUserInfoScreen
        //   theme={this.props.theme}
        //   onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
      default:
        return null;
    }

  }


  render() {
    const chatsTabActive = (this.props.tab === "conversations") ? true : false;
    const userTabActive = (this.props.tab === "contacts") ? true : false;
    const groupsTabActive = (this.props.tab === "groups") ? true : false;
    const wpGroupsTabActive = (this.props.tab === "wpgroups") ? true : false;
    const roomsTabActive = (this.props.tab === "rooms") ? true : false;
    const moreTabActive = (this.props.tab === "info") ? true : false;
    let chatsActive = ( chatsTabActive == true ) ? 'active' : '' ;
    let roomsActive = ( roomsTabActive == true ) ? 'active' : '' ;
    let userActive = ( userTabActive == true ) ? 'active' : '' ;
    let roomShow = '';
    // if( this.props.tab  == 'rooms'  ){
    //   let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOM}`;
      
    //   axios.get( api_url, {
    //     params: {
    //       user_id: WP_API_CONSTANTS.WP_USER_ID
    //     }
    //   }).then(roomList => {
    //     console.log(roomList.data.length);
    //     if( roomList.data.length == 0 ){

    //       this.props.actionGenerated('tabChanged', 'contacts');
    //       return <CometChatUserList
    //       ref={this.sidebar}
    //         theme={this.props.theme}
    //         item={this.props.item}
    //         type={this.props.type}
    //         actionGenerated={this.props.actionGenerated}
    //         enableCloseMenu={this.props.enableCloseMenu}
    //         onItemClick={(item, type) => this.props.actionGenerated("itemClicked", type, item)} />;
    //     }else{
    //       roomShow = (
    //         <div className={`ccproNav-block ${roomsActive}`} css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'rooms')}>
    //             <span css={itemLinkStyle(groupGreyIcon, groupWhiteIcon, roomsTabActive)}></span><span>Rooms</span>
    //           </div>
    //       );
              
    //     }
    //   });
    // }
    // let roomShow = '';
    if( this.props.isRoomShow === false ){
      
    }else{
      roomShow = (
        <div className={`ccproNav-block ${roomsActive}`} css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'rooms')}>
          <span css={itemLinkStyle(groupGreyIcon, groupWhiteIcon, roomsTabActive)}></span><span>Rooms</span>
        </div>
      );
    }
    return (
      <React.Fragment>
        
        <div className="ccproNav" css={footerStyle()}>
          <div className="ccproNav-inner" css={navbarStyle()}>
            <div  className={`ccproNav-block ${chatsActive}`}  css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'conversations')}>
              <span css={itemLinkStyle(chatGreyIcon, chatBlueIcon, chatsTabActive)}></span>
              <span>Chats</span>
            </div>
            <div  className={`ccproNav-block ${userActive}`} css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'contacts')}>
              <span css={itemLinkStyle(contactGreyIcon, contactWhiteIcon, userTabActive)}></span>
              <span>Attendees</span>
              {/* <span className="ccpro-unread-message">(Scroll to check for new messages)</span> */}
            </div>
           {roomShow}
            {/* <div css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'groups')}>
              <span css={itemLinkStyle(groupGreyIcon, groupBlueIcon, groupsTabActive)}></span>
            </div> */}
            {/* <div css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'wpgroups')}>
              <span css={itemLinkStyle(groupGreyIcon, groupBlueIcon, wpGroupsTabActive)}></span>
            </div> */}
            {/* <div css={itemStyle()} onClick={() => this.props.actionGenerated('tabChanged', 'info')}>
              <span css={itemLinkStyle(moreGreyIcon, moreBlueIcon, moreTabActive)}></span>
            </div> */}
          </div>
        </div>
        {this.getDefaultComponent()}
      </React.Fragment>
    )

  }
}

export default Navbar;