import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { MessageHeaderManager } from "./controller";

import StatusIndicator from "../StatusIndicator";
import Avatar from "../Avatar";
import { SvgAvatar } from '../../util/svgavatar';

import * as enums from '../../util/enums.js';

import { 
  chatHeaderStyle, 
  chatDetailStyle, 
  chatSideBarBtnStyle, 
  chatThumbnailStyle,
  chatUserStyle,
  chatNameStyle,
  chatStatusStyle,
  chatOptionWrapStyle,
  chatOptionStyle
 } from "./style";

import menuIcon from './resources/menu-icon.svg';
import audioCallIcon from './resources/call-blue-icon.368958cc.svg';
import joinAudioCallIcon from './resources/join-call-blue-icon.svg';
import videoCallIcon from './resources/video-call-blue-icon.6935c8e5.svg';
import joinVideoCallIcon from './resources/join-video-call-blue-icon.svg';
import detailPaneIcon from './resources/details-pane-blue-icon.64e3a549.svg';
import axios from 'axios';
import { COMETCHAT_CONSTANTS, WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS  } from '../../../../consts';
import './style.css';
class MessageHeader extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      status: null,
      incomingCall: null,
      presence: "offline",
    }
  }

  componentDidMount() {
    console.log(this.props.item);
    this.MessageHeaderManager = new MessageHeaderManager();
    this.MessageHeaderManager.attachListeners(this.updateHeader);
    if(this.props.type === "user") {
      this.setStatusForUser();
    } else {
      this.setStatusForGroup();
    }
    if( this.props.type === "group" && this.props.item.guid ){
      let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
      axios.post( api_url , {
          user_id: WP_API_CONSTANTS.WP_USER_ID,
          guid: this.props.item.guid,
          ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
      }).then(res => {
        console.log(res);
        const call = res.data.data;
        if( !call ){
          this.setState({ incomingCall: call });
        }else{
          let api_status_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKSTATUSCALL}`;
          axios.post( api_status_url , {
              user_id: WP_API_CONSTANTS.WP_USER_ID,
              guid: this.props.item.guid,
              ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              session_call_id: call.sessionId
          }).then(status_res => {
            console.log(status_res);
            const status_call = status_res.data;
            if( status_res.data.status == false ){
              let api_endcall_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_ENDCALL}`;
              axios.post( api_endcall_url , {
                  user_id: WP_API_CONSTANTS.WP_USER_ID,
                  guid: this.props.item.guid,
                  ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              }).then(end_res => {
                console.log(end_res);
              });
            }else{
              this.setState({ incomingCall: call });
            }
            
          });
        }
        
        
      });
      // axios.get(`/wp-content/plugins/nb-chat-react/callingobject.json`)
      // axios.get(`http://localhost/cometchatphpapi/callingobject.json?1=1`)
      // .then(res => {
      //   const call = res.data;
      //   this.setState({ incomingCall: call });
      // });
    }
    
    
  }

  componentDidUpdate(prevProps, prevState) {

    this.MessageHeaderManager.removeListeners();
    this.MessageHeaderManager = new MessageHeaderManager();
    this.MessageHeaderManager.attachListeners(this.updateHeader);

    if (this.props.type === 'user' && prevProps.item.uid !== this.props.item.uid) {
      this.setStatusForUser();
    } else if (this.props.type === 'group' 
    && (prevProps.item !== this.props.item 
      || (prevProps.item === this.props.item && prevProps.item.membersCount !== this.props.item.membersCount)) ) {
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
        axios.post( api_url , {
          user_id: WP_API_CONSTANTS.WP_USER_ID,
          guid: this.props.item.guid,
          ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
      }).then(res => {
        console.log(res);
        const call = res.data.data;
        if( !call ){
          this.setState({ incomingCall: call });
        }else{
          let api_status_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKSTATUSCALL}`;
          axios.post( api_status_url , {
              user_id: WP_API_CONSTANTS.WP_USER_ID,
              guid: this.props.item.guid,
              ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              session_call_id: call.sessionId
          }).then(status_res => {
            console.log(status_res);
            const status_call = status_res.data;
            if( status_res.data.status == false ){
              let api_endcall_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_ENDCALL}`;
              axios.post( api_endcall_url , {
                  user_id: WP_API_CONSTANTS.WP_USER_ID,
                  guid: this.props.item.guid,
                  ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
              }).then(end_res => {
                console.log(end_res);
              });
            }else{
              this.setState({ incomingCall: call });
            }
            
          });
        }
      });
        // axios.get(`/wp-content/plugins/nb-chat-react/callingobject.json`)
        // axios.get(`http://localhost/cometchatphpapi/callingobject.json?1=1`)
        // .then(res => {
        //   const call = res.data;
        //   this.setState({ incomingCall: call });
        // });
        this.setStatusForGroup();
    }
  }

  setStatusForUser = () => {

    let status = this.props.item.status;
    const presence = (this.props.item.status === "online" || this.props.item.status === "available") ? "online" : "offline";

    if(this.props.item.status === "offline" && this.props.item.lastActiveAt) {
      status = "Last active at: " + new Date(this.props.item.lastActiveAt * 1000).toLocaleTimeString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    } else if(this.props.item.status === "offline") {
      status = "offline";
    }

    this.setState({status: status, presence: presence});
  }

  setStatusForGroup = () => {
    const status = `${this.props.item.membersCount} members`;
    this.setState({status: status});
  }

  componentWillUnmount() {

    this.MessageHeaderManager.removeListeners();
    this.MessageHeaderManager = null;
  }

  updateHeader = (key, item, groupUser) => {
    
    switch(key) {

      case enums.USER_ONLINE:
      case enums.USER_OFFLINE: {
        if(this.props.type === "user" && this.props.item.uid === item.uid) {

          if(this.props.widgetsettings 
          && this.props.widgetsettings.hasOwnProperty("main")
          && this.props.widgetsettings.main.hasOwnProperty("show_user_presence")
          && this.props.widgetsettings.main["show_user_presence"] === false) {
            return false;
          }
          this.setState({ status: item.status, presence: item.status });
        }
        break;
      }
      case enums.GROUP_MEMBER_KICKED:
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_LEFT:
        if(this.props.type === "group" 
        && this.props.item.guid === item.guid
        && this.props.loggedInUser.uid !== groupUser.uid) {

          let membersCount = parseInt(item.membersCount);
          const status = `${membersCount} members`;
          this.setState({status: status});
        }
      break;
      case enums.GROUP_MEMBER_JOINED:
        if(this.props.type === "group" && this.props.item.guid === item.guid) {

          let membersCount = parseInt(item.membersCount);
          const status = `${membersCount} members`;
          this.setState({status: status});
        }
      break;
      case enums.GROUP_MEMBER_ADDED:
        if(this.props.type === "group" && this.props.item.guid === item.guid) {

          let membersCount = parseInt(item.membersCount);
          const status = `${membersCount} members`;
          this.setState({status: status});
        }
      break;
      case enums.TYPING_STARTED: {
        console.log(this.props.type);
        console.log(this.props.item);
        console.log(item);
        if (this.props.type === "group" && this.props.type === item.receiverType && this.props.item.guid === item.receiverId) {

          this.setState({ status: `${item.sender.name} is typing...` });
          this.props.actionGenerated("showReaction", item);

        } else if (this.props.type === "user" && this.props.type === item.receiverType && this.props.item.uid === item.sender.uid) {

          this.setState({ status: "typing..." });
          this.props.actionGenerated("showReaction", item);
          
        }
        break;
      }
      case enums.TYPING_ENDED: {

        if (this.props.type === "group" && this.props.type === item.receiverType && this.props.item.guid === item.receiverId) {

          this.setStatusForGroup();
          this.props.actionGenerated("stopReaction", item);

        } else if (this.props.type === "user" && this.props.type === item.receiverType && this.props.item.uid === item.sender.uid) {
          
          this.props.actionGenerated("stopReaction", item);

          if(this.state.presence === "online") {
            this.setState({ status: "online", presence: "online" });
          } else {
            this.setStatusForUser();
          }
        }
        break;
      }
      default:
      break;
    }
  }
    
  toggleTooltip = (event, flag) => {

    const elem = event.target;
    const scrollWidth = elem.scrollWidth;
    const clientWidth = elem.clientWidth;

    if(scrollWidth <= clientWidth) {
      return false;
    }

    if(flag) {
      elem.setAttribute("title", elem.textContent);
    } else {
      elem.removeAttribute("title");
    }
    
  }

  render() {

    let image, presence;
    if(this.props.type === "user") {

      if(!this.props.item.avatar) {

        const uid = this.props.item.uid;
        const char = this.props.item.name.charAt(0).toUpperCase();

        this.props.item.avatar = SvgAvatar.getAvatar(uid, char);
      }

      image = this.props.item.avatar;
      presence = (
        <StatusIndicator
        widgetsettings={this.props.widgetsettings}
        status={this.state.presence}
        cornerRadius="50%" 
        borderColor={this.props.theme.borderColor.primary}
        borderWidth="1px" />
      );

    } else if( this.props.type === "wpgroup" ){
      let group_list = this.props.item;
      Object.values(group_list).map((group, key) => {
        if(!group.icon) {
            const guid = group.guid;
            const char = group.name.charAt(0).toUpperCase();
    
            group.icon = SvgAvatar.getAvatar(guid, char);
          }
          image = group.icon;
      });
    }else if( this.props.type === "rooms" ){
      if(!this.props.item.icon) {

       
      }
    }else if( this.props.type === "group" ){
     
        const guid = this.props.item.guid;
        const char = this.props.item.name.charAt(0).toUpperCase();

        this.props.item.icon = SvgAvatar.getAvatar(guid, char);
      image = this.props.item.icon;
    }else{
      if(!this.props.item.icon) {
        const guid = this.props.item.guid;
        const char = this.props.item.name.charAt(0).toUpperCase();

        this.props.item.icon = SvgAvatar.getAvatar(guid, char);
      }
      image = this.props.item.icon;
      
    }
    let status = (
      <span css={chatStatusStyle(this.props, this.state)}
      onMouseEnter={event => this.toggleTooltip(event, true)}
      onMouseLeave={event => this.toggleTooltip(event, false)}>{this.state.status}</span>
    );
    if( this.props.callStatus == false ){
      if( this.state.incomingCall && this.state.incomingCall.receiverId ){
        this.setState({ incomingCall: null });
      }
      //
    }

    let joinVideoCallBtn = null;
    let joinAudioCallBtn = null;
    let audioCallBtn = null;
    let videoCallBtn =  null;
    let viewDetailBtn = null;
    viewDetailBtn = (<span onClick={() => this.props.actionGenerated("viewDetail")} css={chatOptionStyle(detailPaneIcon)}></span>);
    if( this.props.type === "group" ){
      if( this.state.incomingCall && this.props.item.guid === this.state.incomingCall.receiverId && this.state.incomingCall.receiverId != "" && this.state.incomingCall.type == "video" ){
        let call_active = COMETCHAT_CONSTANTS.API_URL + '/calls/' + this.state.incomingCall.sessionId;
        videoCallBtn = null;
        audioCallBtn = null;
        joinAudioCallBtn = null;
       
        if( this.props.callStatus == true ){
          joinVideoCallBtn = (<button className="ccpro_btn" onClick={() => this.props.actionGenerated("joinVideoCall")}>Join Call</button>);
        }else{
          
        }

      }else if( this.state.incomingCall  && this.props.item.guid === this.state.incomingCall.receiverId && this.state.incomingCall.receiverId != "" && this.state.incomingCall.type == "audio" ){
        let call_active = COMETCHAT_CONSTANTS.API_URL + 'calls/' + this.state.incomingCall.sessionId;
        videoCallBtn = null;
        audioCallBtn = null;
        joinAudioCallBtn = null;
        joinAudioCallBtn = (<button className="ccpro_btn" onClick={() => this.props.actionGenerated("joinAudioCall")}>Join Call</button>);  

      }else{
        audioCallBtn = (<span onClick={() => this.props.actionGenerated("audioCall")} css={chatOptionStyle(audioCallIcon)}></span>);
        videoCallBtn = (<span onClick={() => this.props.actionGenerated("videoCall")} css={chatOptionStyle(videoCallIcon)}></span>);
      }

    } else if( this.props.type === "rooms" ){
      viewDetailBtn = null;
      videoCallBtn = null;
      audioCallBtn = null;
      joinAudioCallBtn = null;
      joinVideoCallBtn = null;
      status = null;
    }else{
      audioCallBtn = (<span onClick={() => this.props.actionGenerated("audioCall")} css={chatOptionStyle(audioCallIcon)}></span>);
      videoCallBtn = (<span onClick={() => this.props.actionGenerated("videoCall")} css={chatOptionStyle(videoCallIcon)}></span>);
    }
    
    
    if(this.props.viewdetail === false) {
      viewDetailBtn = null;
    }

    if(this.props.item.blockedByMe === true || this.props.audiocall === false) {
      audioCallBtn = null;
    }

    // if(this.props.item.blockedByMe === true || this.props.joinAudiocall === false) {
    //   joinAudioCallBtn = null;
    // }

    if(this.props.item.blockedByMe === true || this.props.videocall === false) {
      videoCallBtn = null;
    }

    // if(this.props.item.blockedByMe === true || this.props.joinVideoCall === false) {
    //   joinVideoCallBtn = null;
    // }

    if(this.props.widgetsettings && this.props.widgetsettings.hasOwnProperty("main")) {

      if(this.props.widgetsettings.main.hasOwnProperty("enable_voice_calling")
      && this.props.widgetsettings.main["enable_voice_calling"] === false) {
        audioCallBtn = null;
      }

      if(this.props.widgetsettings.main.hasOwnProperty("enable_video_calling")
      && this.props.widgetsettings.main["enable_video_calling"] === false) {
        videoCallBtn = null;
      }

      if(this.props.widgetsettings.main.hasOwnProperty("show_user_presence")
      && this.props.widgetsettings.main["show_user_presence"] === false
      && this.props.type === "user") {
        status = null;
      }
      
    }
    let headerHtml = '';
    if( this.props.type === "rooms") { 
      headerHtml = (
      <div className="ccproHeadTop" css={chatDetailStyle()}>
          <div css={chatSideBarBtnStyle(menuIcon, this.props)} onClick={() => this.props.actionGenerated("menuClicked")}></div>

          <h2 className="ccpro_Heading" css={chatNameStyle()} 
          onMouseEnter={event => this.toggleTooltip(event, true)} 
          onMouseLeave={event => this.toggleTooltip(event, false)}>Please choose any table below with an empty chair and click on "Join Table"</h2>
      </div>
      );
     
          return (
            <div  className="ccproGroupTop" css={chatHeaderStyle(this.props)}>
              {headerHtml}
              <div css={chatOptionWrapStyle()}>
                {audioCallBtn}
                {joinAudioCallBtn}
                {videoCallBtn}
                {joinVideoCallBtn}
                {viewDetailBtn}
              </div>
            </div>
          );
    }else{
      headerHtml = (
        <div css={chatDetailStyle()}>
          <div css={chatSideBarBtnStyle(menuIcon, this.props)} onClick={() => this.props.actionGenerated("menuClicked")}></div>
          <div css={chatThumbnailStyle()}>
            <Avatar 
            image={image} 
            cornerRadius="18px" 
            borderColor={this.props.theme.borderColor.primary}
            borderWidth="1px" />
            {presence}
          </div>
          <div css={chatUserStyle()}>
            <h6 css={chatNameStyle()} 
            onMouseEnter={event => this.toggleTooltip(event, true)} 
            onMouseLeave={event => this.toggleTooltip(event, false)}>{this.props.item.name}</h6>
            {status}
          </div>
        </div>
      );
          return (
            <div css={chatHeaderStyle(this.props)}>
              {headerHtml}
              <div css={chatOptionWrapStyle()}>
                {audioCallBtn}
                {joinAudioCallBtn}
                {videoCallBtn}
                {joinVideoCallBtn}
                {viewDetailBtn}
              </div>
            </div>
          );
    }
    

  }
}

export default MessageHeader;