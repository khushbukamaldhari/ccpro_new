import React from "react";

/** @jsx jsx */
import { jsx, keyframes } from "@emotion/core";

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import * as enums from '../../util/enums.js';
import { SvgAvatar } from '../../util/svgavatar';
import { validateWidgetSettings } from "../../util/common";

import { CallScreenManager } from "./controller";

import Avatar from "../Avatar";

import {
  callScreenWrapperStyle,
  callScreenContainerStyle,
  headerStyle,
  headerDurationStyle,
  headerNameStyle,
  thumbnailWrapperStyle,
  thumbnailStyle,
  headerIconStyle,
  iconWrapperStyle,
  iconStyle,
  errorContainerStyle,
  chatOptionStyle,
  callScreenIcon,
  callScreenIconRemove
} from "./style";

import callIcon from "./resources/call-end-white-icon.svg";
import { outgoingCallAlert } from "../../resources/audio/";
import MinimizePaneIcon from './resources/MinimizeNew.svg';
import MaximizePaneIcon from './resources/MaximizeNew.svg';
import './style.css';
import axios from 'axios';
import { COMETCHAT_CONSTANTS, WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS  } from '../../../../consts';


class CallScreen extends React.PureComponent {

  constructor(props) {

    super(props);

    this.callScreenFrame = React.createRef();
    this.state = {
      errorScreen: false,
      clicked:false,
      errorMessage: null,
      outgoingCallScreen: false,
      callInProgress: null
    }

    this.outgoingAlert = new Audio(outgoingCallAlert);
  }

  playOutgoingAlert = () => {

    //if audio sound is disabled in chat widget
    if (validateWidgetSettings(this.props.widgetsettings, "enable_sound_for_calls") === false) {
      return false;
    }

    this.outgoingAlert.currentTime = 0;
    if (typeof this.outgoingAlert.loop == 'boolean') {
      this.outgoingAlert.loop = true;
    } else {
      this.outgoingAlert.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
      }, false);
    }
    this.outgoingAlert.play();
  }

  pauseOutgoingAlert = () => {

    //if audio sound is disabled in chat widget
    if (validateWidgetSettings(this.props.widgetsettings, "enable_sound_for_calls") === false) {
      return false;
    }
    
    this.outgoingAlert.pause();
  }

  componentDidMount() {

    this.outgoingAlert = new Audio(outgoingCallAlert);
    this.state.clicked = false;
    this.CallScreenManager = new CallScreenManager();
    this.CallScreenManager.attachListeners(this.callScreenUpdated);
  }

  componentDidUpdate(prevProps, prevState) {
    // this.state.clicked = false;
    if (prevProps.outgoingCall !== this.props.outgoingCall && this.props.outgoingCall) {
      this.state.clicked = false;
      this.playOutgoingAlert(); 

      let call = this.props.outgoingCall;

      if (call.receiverType === "group" && call.receiver.hasOwnProperty("icon") === false) {

        const uid = call.receiver.guid;
        const char = call.receiver.name.charAt(0).toUpperCase();
        call.receiver.icon = SvgAvatar.getAvatar(uid, char);

      } else if (call.receiverType === "user" && call.receiver.hasOwnProperty("avatar") === false) {

        const uid = call.receiver.uid;
        const char = call.receiver.name.charAt(0).toUpperCase();
        call.receiver.avatar = SvgAvatar.getAvatar(uid, char);
      }
      
      this.setState({ outgoingCallScreen: true, callInProgress: call, errorScreen: false, errorMessage: null });
    }

    if (prevProps.incomingCall !== this.props.incomingCall && this.props.incomingCall) {
      this.acceptCall();
    }
  }

  componentWillUnmount() {
    // this.state.clicked = false;
    this.CallScreenManager.removeListeners();
    this.CallScreenManager = null;
  }

  callScreenUpdated = (key, call) => {

    switch(key) {

      case enums.INCOMING_CALL_CANCELLED:
        this.incomingCallCancelled(call);
      break;
      case enums.OUTGOING_CALL_ACCEPTED://occurs at the caller end
        this.outgoingCallAccepted(call);
      break;
      case enums.OUTGOING_CALL_REJECTED://occurs at the caller end, callee rejects the call
        this.outgoingCallRejected(call);
      break;
      default:
      break;
    }
  }

  incomingCallCancelled = (call) => {
    
    this.setState({ outgoingCallScreen: false, callInProgress: null });
  }

  outgoingCallAccepted = (call) => {
    
    if (this.state.outgoingCallScreen === true) {
      this.pauseOutgoingAlert();
      this.setState({ outgoingCallScreen: false, callInProgress: call });
      this.startCall(call);
    }
  }

  outgoingCallRejected = (call) => {
    
    if (call.hasOwnProperty("status") && call.status === CometChat.CALL_STATUS.BUSY) {

      //show busy message.
      const errorMessage = `${call.sender.name} is on another call.`;
      this.setState({ errorScreen: true, errorMessage: errorMessage});

    } else {

      this.pauseOutgoingAlert();
      this.props.actionGenerated("outgoingCallRejected", call);
      this.setState({ outgoingCallScreen: false, callInProgress: null });
    }

  }

  //accepting incoming call, occurs at the callee end
  acceptCall = () => {

    CometChatManager.acceptCall(this.props.incomingCall.sessionId).then(call => {

      if (call.receiver.hasOwnProperty("uid") && call.receiver.hasOwnProperty("avatar") === false) {

        const uid = call.receiver.uid;
        const char = call.receiver.name.charAt(0).toUpperCase();

        call.receiver.avatar = SvgAvatar.getAvatar(uid, char);

      } else if (call.receiver.hasOwnProperty("guid") && call.receiver.hasOwnProperty("icon") === false) {

        const guid = call.receiver.guid;
        const char = call.receiver.name.charAt(0).toUpperCase();

        call.receiver.icon = SvgAvatar.getAvatar(guid, char);
      }
      
      this.props.actionGenerated("acceptedIncomingCall", call);
      this.setState({ outgoingCallScreen: false, callInProgress: call, errorScreen: false, errorMessage: null });
      
      this.startCall(call);

    }).catch(error => {
      console.log(this.props.item);
      console.log(this.props.type);

      if ( error.code == "ERR_CALL_GROUP_ALREADY_JOINED" || error.code == "CALL_IN_PROGRESS" ){
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
        let guid;
        if( this.props.type == "user" ){
          guid = this.props.item.uid;
        }else{
          guid = this.props.item.guid;
        }
        axios.post( api_url , {
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            guid: guid,
            ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID
        }).then(res => {
          console.log(res);
          
          const call = res.data.data;
          console.log(call);
          const guid = call.receiver.guid;
          const char = call.receiver.name.charAt(0).toUpperCase();

          this.props.actionGenerated("acceptedIncomingCall", call);
          this.setState({ outgoingCallScreen: false, callInProgress: call, errorScreen: false, errorMessage: null });
          
          this.startCall(call);
        });
        
      }
      console.log("[CallScreen] acceptCall -- error", error);
      this.props.actionGenerated("callError", error);

    });
  }

  startCall = (call) => {

    const sessionId = call.getSessionId();
    const callType = call.type;
    const mode = (call.receiverType === "user") ? CometChat.CALL_MODE.SINGLE : CometChat.CALL_MODE.DEFAULT;

    const callSettings = new CometChat.CallSettingsBuilder()
                        .setSessionID(sessionId)
                        .enableDefaultLayout(true)
                        .setMode(mode)
                        .setIsAudioOnlyCall(callType === "audio" ? true : false)
                        .build();

    const el = this.callScreenFrame;
    CometChat.startCall(
      callSettings,
      el,
      new CometChat.OngoingCallListener({
        onUserJoined: user => {
          /* Notification received here if another user joins the call. */
          //console.log("User joined call:", enums.USER_JOINED, user);
          /* this method can be use to display message or perform any actions if someone joining the call */

          //call initiator gets the same info in outgoingcallaccpeted event
          if (call.callInitiator.uid !== this.props.loggedInUser.uid && call.callInitiator.uid !== user.uid) {

            this.markMessageAsRead(call);

            const callMessage = { 
              "category": call.category, 
              "type": call.type, 
              "action": call.action, 
              "status": call.status, 
              "callInitiator": call.callInitiator,
              "callReceiver": call.callReceiver,
              "receiverId": call.receiverId,
              "receiverType": call.receiverType,
              "sentAt": call.sentAt,
              "sender": { ...user }
            };
            this.props.actionGenerated("userJoinedCall", callMessage);
          }
        },
        onUserLeft: user => {
          /* Notification received here if another user left the call. */
          //console.log("User left call:", enums.USER_LEFT, user);
          /* this method can be use to display message or perform any actions if someone leaving the call */


          //this.markMessageAsRead(call);
          this.markMessageAsRead(call);

            const callMessage = {
              "category": call.category,
              "type": call.type,
              "action": "left",
              "status": call.status,
              "callInitiator": call.callInitiator,
              "callReceiver": call.callReceiver,
              "receiverId": call.receiverId,
              "receiverType": call.receiverType,
              "sentAt": call.sentAt,
              "sender": { ...user }
            };

            this.props.actionGenerated("userLeftCall", callMessage);
          },
        
        onCallEnded: call => {
          
          /* Notification received here if current ongoing call is ended. */
          //console.log("call ended:", enums.CALL_ENDED, call);
          
          let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKCALL}`;
          axios.post( api_url , {
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            guid: this.props.item.guid,
            ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID
          }).then(res => {
            console.log(res);
            const call = res.data;
            // if( !call ){
            //   this.setState({ showOutgoingScreen: false, callInProgress: null });
            //   console.log("end");
            //   this.state.clicked = false;
              
            //   this.markMessageAsRead(res.data);
            //   this.props.actionGenerated("callEnded", res.data, '', true);
            // }else{
              let api_status_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.POST_CHECKSTATUSCALL}`;
              axios.post( api_status_url , {
                  user_id: WP_API_CONSTANTS.WP_USER_ID,
                  guid: this.props.item.guid,
                  ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,
                  session_call_id: call.sessionId
              }).then(status_res => {
                console.log(status_res);
                const status_call = status_res.data;
                if( status_res.data.success == false ){
                  this.setState({ showOutgoingScreen: false, callInProgress: null });
                  console.log("end");
                  this.state.clicked = false;
                  
                  this.markMessageAsRead(res.data);
                  console.log(res.success);
                  this.props.actionGenerated("callEnded", res.data,'', false);
                }else{
                  this.setState({ showOutgoingScreen: false, callInProgress: null });
                console.log("end");
                this.state.clicked = false;
                
                this.markMessageAsRead(res.data);
                this.props.actionGenerated("callEnded", res.data, '', true);
                }
                
              });
            // }

            // console.log(res.data.success);
            // if( res.data.success  == false ){
            //   this.setState({ showOutgoingScreen: false, callInProgress: null });
            //   console.log("end");
            //   this.state.clicked = false;
              
            //   this.markMessageAsRead(res.data);
            //   console.log(res.success);
            //   this.props.actionGenerated("callEnded", res.data,'', res.data.success);
            // }else{
            //   this.setState({ showOutgoingScreen: false, callInProgress: null });
            //   console.log("end");
            //   this.state.clicked = false;
              
            //   this.markMessageAsRead(res.data);
            //   this.props.actionGenerated("callEnded", res.data, '', true);
            // }
          });
          // this.setState({ showOutgoingScreen: false, callInProgress: null });
          // console.log("end");
          // this.markMessageAsRead(call);
          // this.props.actionGenerated("callEnded", call);
          

          /* hiding/closing the call screen can be done here. */
        }
      })
    );
  }

  markMessageAsRead = (message) => {

    const type = message.receiverType;
    const id = (type === "user") ? message.sender.uid : message.receiverId;

    if (message.hasOwnProperty("readAt") === false) {
      CometChat.markAsRead(message.id, id, type);
    }

  }

  //cancelling an outgoing call
  cancelCall = () => {

    this.pauseOutgoingAlert();
    CometChatManager.rejectCall(this.state.callInProgress.sessionId, CometChat.CALL_STATUS.CANCELLED).then(call => {

      this.props.actionGenerated("outgoingCallCancelled", call);
      this.setState({ outgoingCallScreen: false, callInProgress: null });
      this.state.clicked = false;
    }).catch(error => {

      this.props.actionGenerated("callError", error);
      this.setState({ outgoingCallScreen: false, callInProgress: null });
    });
  }

  handleClick = () => {
    console.log(this.state.clicked);
    this.setState({clicked: !this.state.clicked});

    console.log(this.state.clicked);
  }

  render() {
    console.log("SDFSDfds");
    
    let callScreen = null, outgoingCallScreen = null, errorScreen = null;
    if (this.state.callInProgress) {

      let avatar;
      if(this.props.type === "user") {

        avatar = (
          <Avatar 
          image={this.state.callInProgress.receiver.avatar}
          cornerRadius="50%"
          borderColor={this.props.theme.color.secondary}
          borderWidth="1px" />
        );

      } else if(this.props.type === "group") {

        avatar = (
          <Avatar 
          image={this.state.callInProgress.receiver.icon}
          cornerRadius="50%" 
          borderColor={this.props.theme.color.secondary}
          borderWidth="1px" />
        );

      }

      if (this.state.errorScreen) {
        errorScreen = (
          <div css={errorContainerStyle()} className="callscreen__error__wrapper"><div>{this.state.errorMessage}</div></div>
        );
      }

      if (this.state.outgoingCallScreen) {
        outgoingCallScreen = (
          <div css={callScreenContainerStyle()} className="callscreen__container">
            <div css={headerStyle()} className="callscreen__header">
              <span css={headerDurationStyle()} className="header__calling">Calling...</span>
              <h6 css={headerNameStyle()} className="header__name">{this.state.callInProgress.receiver.name}</h6>
            </div>
            <div css={thumbnailWrapperStyle()} className="callscreen__thumbnail__wrapper">
              <div css={thumbnailStyle()} className="callscreen__thumbnail">{avatar}</div>
            </div>
            {errorScreen}
            <div css={headerIconStyle()} className="callscreen__icons">
              <div css={iconWrapperStyle()} className="icon__block" onClick={this.cancelCall}>
                <div css={iconStyle(callIcon, 0)} className="icon icon__end"></div>
              </div>
            </div>
          </div>
        );
      }
    }

    
    console.log(this.state.outgoingCallScreen);

    console.log( this.state.clicked);
    if (this.state.callInProgress) {
      var className = this.state.clicked ? 'ccpro-video-window-minimized' : 'ccpro-video-window-maximize';
      let viewDetailBtn = null;
      if( this.state.clicked ){
        viewDetailBtn = (<span onClick={() => this.handleClick()} css={callScreenIcon(MaximizePaneIcon)}></span>);
      }else{
        viewDetailBtn = (<span onClick={() => this.handleClick()} css={callScreenIconRemove(MinimizePaneIcon)}></span>);
      }
      // let viewDetailBtn = (<span onClick={() => this.props.actionGenerated("viewMessageDetail")} css={chatOptionStyle(MessagePaneIcon)}></span>);
      
      callScreen = (
        <div className={`ccpro-video-window ${className}`}>
          {viewDetailBtn}
          <div css={callScreenWrapperStyle(this.props, keyframes)} ref={(el) => { this.callScreenFrame = el; }}>
          {outgoingCallScreen}
        </div>
        </div>
        
      );
    }

    return callScreen;
  }
}

export default CallScreen;
