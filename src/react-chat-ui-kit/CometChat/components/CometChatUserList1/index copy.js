import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { CometChatManager } from "../../util/controller";
import { SvgAvatar } from '../../util/svgavatar';
import { UserListManager } from "./controller";
import { ConversationListManager } from "../CometChatConversationList/controller";

import UserView from "../UserView";

import { theme } from "../../resources/theme";

import { 
  contactWrapperStyle, 
  contactHeaderStyle, 
  contactHeaderCloseStyle, 
  contactHeaderTitleStyle,
  contactSearchStyle,
  contactSearchInputStyle,
  contactMsgStyle,
  contactMsgTxtStyle,
  contactListStyle,
  contactAlphabetStyle
} from "./style";
import * as enums from '../../util/enums.js';

import searchIcon from './resources/search-grey-icon.svg';
import navigateIcon from './resources/navigate_before.svg';
import axios from 'axios';
import { CometChat } from "@cometchat-pro/chat";
import { WP_API_CONSTANTS, COMETCHAT_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';
import './style.css';

class CometChatUserList extends React.Component {
  timeout;
  friendsOnly = false;
  decoratorMessage = "Loading...";

  constructor(props) {

    super(props);

    this.i = 0;
    this.state = {
      userlist: [],
      onlineUserList: [],
      unreadMessageList: [],
      onlineList: [],
      selectedUser: null
    }

    this.cacheTimeout = 60;

    this.getUsers();
    // this.getConversations();
    this.userListRef = React.createRef();
    this.theme = Object.assign({}, theme, this.props.theme);
  }

  async componentDidMount() {

    if(this.props.hasOwnProperty("friendsOnly")) {
      this.friendsOnly = this.props.friendsOnly;
    }

    if(this.props.hasOwnProperty("widgetsettings") 
    && this.props.widgetsettings
    && this.props.widgetsettings.hasOwnProperty("sidebar") 
    && this.props.widgetsettings.sidebar.hasOwnProperty("user_listing")) {

      switch(this.props.widgetsettings.sidebar["user_listing"]) {
        case "fr+iends":
          this.friendsOnly = true;
        break;
        default:
        break;
      }
    }

    this.UserListManager = new UserListManager(this.friendsOnly);
    this.ConversationListManager = new ConversationListManager();
    // this.getUsers();
    this.UserListManager.attachListeners(this.userUpdated);
    // this.UserListManager.attachMessageListeners(this.userMessageUpdated);
  }

  componentDidUpdate(prevProps) {

    const previousItem = JSON.stringify(prevProps.item);
    const currentItem = JSON.stringify(this.props.item);

    if (previousItem !== currentItem) {

      if (Object.keys(this.props.item).length === 0) {
 
        this.userListRef.scrollTop = 0;
        this.setState({ selectedUser: {} });

      } else {
        
        let userlist = [...this.state.userlist];

        //search for user
        let userKey = userlist.findIndex(u => u.ID === this.props.item.ID);
        if (userKey > -1) {

          let userObj = { ...userlist[userKey] };
          this.setState({ selectedUser: userObj });
          // console.log(userObj);
        }
      }
    }

    //if user is blocked/unblocked, update userlist in state
    if(prevProps.item 
    && Object.keys(prevProps.item).length 
    && prevProps.item.uid === this.props.item.uid 
    && prevProps.item.blockedByMe !== this.props.item.blockedByMe) {

      let userlist = [...this.state.userlist];

      //search for user
      let userKey = userlist.findIndex((u, k) => u.uid === this.props.item.uid);
      if(userKey > -1) {

        let userObj = {...userlist[userKey]};
        let newUserObj = Object.assign({}, userObj, {blockedByMe: this.props.item.blockedByMe});
        userlist.splice(userKey, 1, newUserObj);

        this.setState({ userlist: userlist });
      }
    }

  }

  // componentWillMount(){
  //   console.log('First this called');
  // }
  componentWillUnmount() {
    this.UserListManager.removeListeners();
    this.UserListManager = null;
  }

  // userUpdated = (key, item, message, options) => {

  //   switch(key) {
  //     case enums.USER_ONLINE:
  //     case enums.USER_OFFLINE:
  //       this.updateUser(item);
  //       break;
  //     case enums.TEXT_MESSAGE_RECEIVED:
  //     case enums.MEDIA_MESSAGE_RECEIVED:
  //     case enums.CUSTOM_MESSAGE_RECEIVED:
  //       this.updateConversation(message);
  //       break;
  //     case enums.INCOMING_CALL_RECEIVED:
  //     case enums.INCOMING_CALL_CANCELLED:
  //       this.updateConversation(message, false);
  //       break;
  //     case enums.GROUP_MEMBER_ADDED:
  //       this.updateGroupMemberAdded(message, options);
  //       break;
  //     case enums.GROUP_MEMBER_KICKED:
  //     case enums.GROUP_MEMBER_BANNED:
  //     case enums.GROUP_MEMBER_LEFT:
  //       this.updateGroupMemberRemoved(message, options);
  //       break;
  //     case enums.GROUP_MEMBER_SCOPE_CHANGED:
  //       this.updateGroupMemberScopeChanged(message, options);
  //       break;
  //     case enums.GROUP_MEMBER_JOINED:
  //       this.updateGroupMemberChanged(message, options, "increment");
  //       break;
  //     case enums.GROUP_MEMBER_UNBANNED:
  //       this.updateGroupMemberChanged(message, options, "");
  //       break;
  //     default:
  //       break;
  //   }

  // }

  updateUser = (user) => {
    console.log(user);
    
    let onlineUserlist, offlineUserlist;
    onlineUserlist = this.state.onlineList;
    offlineUserlist = this.state.userlist;

    // if( user.status == "offline" ){
    //   userlist = this.state.userlist;
    // }else{
    //   userlist = this.state.onlineList;
    // }
   
    console.log(onlineUserlist);
   
    user.display_name = user.name;
    user.ccpro_uid = user.uid;

    let userExist = false;    
    onlineUserlist.map( ( mappedUser, key ) => {
      if( user.uid == mappedUser.uid ){
        console.log( "Status: ", user.status );
        if( user.status == "offline" ){
          // userExist = true;
          delete onlineUserlist.key;
        } else {
          onlineUserlist.splice(0, 0, user);
        }
      }
    });

    this.setState({userlist: offlineUserlist});
    this.setState({onlineList: onlineUserlist});

    // if( !userExist ){
    //   userlist.splice(0, 0, user);
    //   if( user.status == "offline" ){
    //     this.setState({userlist: userlist});
    //   }else{
    //     this.setState({onlineList: userlist});
    //   }
    // }

    console.log(this.state.onlineList);
  }

  updateConversation = (message, notification = true) => {

    this.makeConversation(message).then(response => {

      const { conversationKey, conversationObj, conversationList } = response;

      if (conversationKey > -1) {

        let unreadMessageCount = this.makeUnreadMessageCount(conversationObj);
        let lastMessageObj = this.makeLastMessage(message, conversationObj);

        let newConversationObj = { ...conversationObj, lastMessage: lastMessageObj, unreadMessageCount: unreadMessageCount };
        conversationList.splice(conversationKey, 1);
        conversationList.unshift(newConversationObj);
        this.setState({ conversationlist: conversationList });

        if (notification) {
          this.playAudio();
        }

      } else {

        let unreadMessageCount = this.makeUnreadMessageCount();
        let lastMessageObj = this.makeLastMessage(message);

        let newConversationObj = { ...conversationObj, lastMessage: lastMessageObj, unreadMessageCount: unreadMessageCount };
        conversationList.unshift(newConversationObj);
        this.setState({ conversationlist: conversationList });

        if (notification) {
          this.playAudio();
        }
      }

    }).catch(error => {
      console.log('This is an error in converting message to conversation', error);
    });

  }


  makeConversation = (message) => {

    const promise = new Promise((resolve, reject) => {

      CometChat.CometChatHelper.getConversationFromMessage(message).then(conversation => {

        let conversationList = [...this.state.conversationlist];
        let conversationKey = conversationList.findIndex(c => c.conversationId === conversation.conversationId);
        
        let conversationObj = { ...conversation };
        if (conversationKey > -1) {
          conversationObj = { ...conversationList[conversationKey] };
        }

        resolve({ "conversationKey": conversationKey, "conversationObj": conversationObj, "conversationList": conversationList });
      
      }).catch(error => reject(error));

    });
    
    return promise;
  }


  userUpdated = (key, item, message, options) => {
    console.log(key);
    if( key == enums.MESSAGE_READ
      || key == enums.TEXT_MESSAGE_RECEIVED
      || key == enums.MEDIA_MESSAGE_RECEIVED
      || key == enums.CUSTOM_MESSAGE_RECEIVED
      || key == enums.MESSAGE_DELIVERED ){
      let unread_message_count = this.setUserUnreadMessage( item.sender );
    } 
    // else if( key == enums.USER_ONLINE || key == enums.USER_OFFLINE ){
    //   let user_status_update = this.setUserStatus( item );
    // } 
    else {
      let userlist = [...this.state.userlist];
      this.UserListManager = new UserListManager(this.friendsOnly);
      this.getUsers();
    }
    
  }

  userMessageUpdated = (user) => {
    
    this.UserListManager = new UserListManager(this.friendsOnly);
    //this.getUnreadMessage();
    
  }

  handleScroll = (e) => {

    const bottom =
      Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) === Math.round(e.currentTarget.clientHeight);
    // if (bottom) this.getUsers();
  }

  handleClick = (user) => {

    if(!this.props.onItemClick)
      return;

      var name = user.display_name;
      if( user.ccpro_uid ){
        
        CometChat.getUser(user.ccpro_uid).then(
          userlist => {
            user.status = userlist.status;
            this.setUserUnreadMessage( user );
            console.log("User details fetched for user:", userlist);
            
          },
          error => {
          });
        this.setState({selectedUser: {...user}});
        this.props.onItemClick(user, 'user');
      }else{
        let UID = WP_API_CONSTANTS.WP_PREFIX + '-' + user.ID;
        CometChat.getUser(UID).then(
          user => {
            this.setUserUnreadMessage( user );
            console.log("User details fetched for user:", user);
          },
          error => {
          
            var apiKey = COMETCHAT_CONSTANTS.AUTH_KEY;
            var ccpro_user = new CometChat.User(UID);
            ccpro_user.setName(name);
            if( error.code = "ERR_UID_NOT_FOUND" ){
              CometChat.createUser(ccpro_user, apiKey).then(
                ccpro_user => {
                  console.log("user created", ccpro_user);
                  this.setUserUnreadMessage( ccpro_user );
                  let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.COMETCHAT_ADD_USER}`;
                  
                  axios.post( api_url , {
                    user_id: user.ID,
                    ccpro_id: UID
                  }).then(res => {
            
                  });
                },error => {
                  console.log("error", error);
                }
              )
            }
            console.log("User details fetching failed with error:", error);
          }
        );
        this.setState({selectedUser: {...user}});
        this.props.onItemClick(user, 'user');
      }
  }

  handleMenuClose = () => {

    if(!this.props.actionGenerated) {
      return false;
    }

    this.props.actionGenerated("closeMenuClicked")
  }
  
  searchUsers = (e) => {

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    let val = e.target.value;
    this.timeout = setTimeout(() => {
      new CometChatManager().getLoggedInUser().then(user => {
        this.loggedInUser = user;
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.SEARCH_USERS}`;
        
        axios.get( api_url, {
          params:{
            user_id: WP_API_CONSTANTS.WP_USER_ID,
            search_name: val
          }
        }).then(userList => {
          if(userList.data.message == "No Users Found") {
            this.decoratorMessage = "";

            
            let ccpro_userlist = [];
            let ccpro_onlineuserlist = [];
            this.getUnreadMessage();
            this.UserListManager = new UserListManager(this.friendsOnly, val);
            this.UserListManager.fetchNextUsers().then((ccproUserList) => {
    
              let arrrUserlist = [];
              if(ccproUserList.length === 0) {
                this.decoratorMessage = "No users found";
              }
              // userList.forEach(user => user = this.setAvatar(user));
              // ccpro_userlist = [...ccproUserList];
              ccproUserList.map((user, key) => {
                if( user.uid.startsWith( WP_API_CONSTANTS.WP_PREFIX ) ){
                  ccpro_userlist[user.uid] = user;
                  ccproUserList[key]['ID'] = user.uid;
                  ccproUserList[key]['ccpro_uid'] = user.uid;
                  ccproUserList[key]['display_name'] = user.name;
                  user.ID = user.uid;
                  user.ccpro_uid = user.uid;
                  user.type = "user";
                  user.display_name =  user.name;
                  if( this.state.unreadMessageList.hasOwnProperty(user.uid) && this.state.unreadMessageList[user.uid] != undefined ){
                    ccpro_onlineuserlist[key] = user;
                    ccpro_onlineuserlist[key]['unreadMessageCount'] = this.state.unreadMessageList[user.uid];
                    let tmp_user = ccpro_onlineuserlist[key];
                    ccpro_onlineuserlist.unshift( tmp_user );
                    
                  }else{
                      ccpro_onlineuserlist[key] = user;
                  }
                  
                  
                  let id = user.uid.replace("aad-","");
                  arrrUserlist[id] = user;
                  arrrUserlist[id]['status'] = user.status;
                  ccpro_onlineuserlist = ccpro_onlineuserlist.filter((v, i, a) => a.indexOf(v) === i);
                
                  if( this.i == 0 ){
                    this.handleClick(user);
                    this.i = 1;
                  }  
                }
              });
              
              
              this.setState({ onlineList: ccpro_onlineuserlist});
              this.setState({ onlineUserList: ccpro_userlist}); 
              });

            this.setState({ userlist: '' });
          }else{
            userList.data.forEach(user => {
              
              user = this.setAvatar(user)
              
            });
            this.getUnreadMessage();
            let ccpro_userlist = [];
            let ccpro_onlineuserlist = [];
            this.UserListManager = new UserListManager(this.friendsOnly, val);
            this.UserListManager.fetchNextUsers().then((ccproUserList) => {
    
              let arrrUserlist = [];
              if(ccproUserList.length === 0) {
                this.decoratorMessage = "No users found";
              }
              
              ccproUserList.map((user, key) => {
                console.log(this.state.unreadMessageList[user.uid]);
                if(  this.state.unreadMessageList.hasOwnProperty(user.uid) && this.state.unreadMessageList[user.uid] != undefined ){
                  ccproUserList[key]['unreadMessageCount'] = this.state.unreadMessageList[user.uid];
                  ccpro_onlineuserlist[key] = user;
                  // ccpro_onlineuserlist[key]['unreadMessageCount'] = this.state.unreadMessageList[user.uid];
                  // let tmp_user = ccpro_onlineuserlist[key];
                  // ccpro_onlineuserlist.unshift( tmp_user );
                }else{
                    ccpro_onlineuserlist[key] = user;
                }
                ccpro_userlist[user.uid] = user;
                ccproUserList[key]['ID'] = user.uid;
                ccproUserList[key]['type'] = 'user';
                ccproUserList[key]['ccpro_uid'] = user.uid;
                ccproUserList[key]['display_name'] = user.name;
                user.ID = user.uid;
                user.type = "user";
                user.ccpro_uid = user.uid;
                user.display_name =  user.name;
                let id = user.uid.replace("aad-","");
                arrrUserlist[id] = user;
                arrrUserlist[id]['status'] = user.status;
                ccproUserList = ccproUserList.filter((v, i, a) => a.indexOf(v) === i);
                if( this.i == 0 ){
                  this.handleClick(user);
                  this.i = 1;
                }  
                
              });
              userList.data.map((user, key) => {
                console.log(this.state.unreadMessageList[user.ccpro_uid]);
                if( this.state.unreadMessageList.hasOwnProperty(user.ccpro_uid) && this.state.unreadMessageList[user.uid] != undefined ){
                  userList.data[key]['unreadMessageCount'] = this.state.unreadMessageList[user.ccpro_uid];
                  let tmp_user = userList.data[key];
                  // move()
                  // delete userList.data.key;
                  userList.data.unshift( tmp_user );
                  userList.data = userList.data.filter((v, i, a) => a.indexOf(v) === i);
                }
                if( this.i == 0 ){
                  this.handleClick(user);
                  this.i = 1;
                }  
                userList.data[key]['type'] = 'user';
                userList.data[key]['uid'] = user.ccpro_uid;
                this.setAvatar(user);
              });
              this.setState({ userlist: userList.data });
              this.setState({ onlineList: ccpro_onlineuserlist});
              this.setState({ onlineUserList: ccpro_userlist});
              console.log(userList.data);
            }).catch((error) => {
              this.decoratorMessage = "Error";
              console.error("[CometChatUserList] getUsers fetchNext error", error);
            });
         
          this.setState({ userlist: userList.data });
          localStorage.setItem("usertime", Date.now());
        }
         
        // if( i == 1){
          
        // }
          
        }).catch((error) => {
  
          this.decoratorMessage = "Error";
          console.error("[CometChatUserList] getUsers fetchNext error", error);
        });
  
      }).catch((error) => {
  
        this.decoratorMessage = "Error";
        console.log("[CometChatUserList] getUsers getLoggedInUser error", error);
      });
      // this.UserListManager = new UserListManager(this.friendsOnly, val);
      // this.setState({ userlist: [] }, () => this.getUsers())
    }, 500)

  }

  getCurrentTime(){
    let d = new Date();
    return( d.getTime() );
  }

  canUseCache( time, refreshTime ){
    let curr_time = this.getCurrentTime();
    let diff = ( curr_time - time ) / 1000;
    if( diff > refreshTime ){
      return false;
    } else {
      return true;
    }
  }

  getUnreadMessage = () => {
    CometChat.getUnreadMessageCountForAllUsers().then(
      unreadMessage => {
        console.log("Message count fetched", unreadMessage);
        this.setState({ unreadMessageList: unreadMessage })
      },
      error => {
        console.log("Error in getting message count", error);
      }
    );
  }


  setUserStatus = ( item ) => {
    console.log( item );
    let user_uid = item.uid;
    let user_status = item.status;
    console.log( user_status );
    
    let onlineUserlist, offlineUserlist;
    onlineUserlist = this.state.onlineList;
    offlineUserlist = this.state.userlist;
    
    item.display_name = item.name;
    item.ccpro_uid = user_uid;
    
    console.log( onlineUserlist );

    let availableInOnline = false;
    let availableInOffline = false;

    let availableOnlineKey = 0;
    let availableOfflineKey = 0;

    /*

    onlineUserlist.map( ( mappedUser, key ) => {
      if( user_uid == mappedUser.uid && user_status == "offline" ){
        console.log( key );
        // onlineUserlist.splice( 0, 0, item );

        delete onlineUserlist.key;
        console.log( onlineUserlist );
        
        // availableInOnline = true;
        // availableOnlineKey = key;
        // this.setState({ userlist: offlineUserlist });
        // this.setState({ onlineList: onlineUserlist});
        // this.setState({ onlineUserList: ccpro_userlist});
      }
    });
    

    offlineUserlist.map( ( mappedUser, key ) => {
      if( user_uid == mappedUser.uid && user_status == "online" ){
        console.log( `UID: ${user_uid} --- MUID: ${mappedUser.uid}` );
        // availableInOffline = true;
        // availableOfflineKey = key;
        // offlineUserlist[key].unreadMessageCount = unreadMessage[user_uid];

        onlineUserlist.splice( 0, 0, item );
        offlineUserlist[key].status = "online";

        // this.setState({ userlist: offlineUserlist });
        // this.setState({ onlineList: onlineUserlist});
        // this.setState({ onlineUserList: ccpro_userlist});
      }
    });

    console.log( `availableInOnline: ${availableInOnline} --- availableInOffline: ${availableInOffline}` );

    // if( user_status == "online" ){
    //   if( !availableInOnline ){
    //     console.log( "User comes online: ", onlineUserlist );
    //     onlineUserlist.splice( 0, 0, item );
    //     if( availableOfflineKey ){
    //       offlineUserlist.availableOfflineKey.status = "offline";
    //     }
    //   }
    // }


    // if( user_status == "offline" ){
    //   if( !availableInOffline ){
    //     console.log( "User goes offline: ", offlineUserlist );
    //     offlineUserlist.splice( 0, 0, item );
    //     if( availableOnlineKey ){
    //       delete onlineUserlist.availableOnlineKey;
    //     }
    //   }
    // }
*/
    this.setState({userlist: offlineUserlist});
    this.setState({onlineList: onlineUserlist});

  }

  setUserUnreadMessage = ( item ) => {
    let uid = item.uid;
    CometChat.getUnreadMessageCountForUser( uid ).then(
      unreadMessage => {
        console.log("Message count fetched", unreadMessage);
        let onlineUserlist, offlineUserlist;
        onlineUserlist = this.state.onlineList;
        offlineUserlist = this.state.userlist;

        // if( user.status == "offline" ){
        //   userlist = this.state.userlist;
        // }else{
        //   userlist = this.state.onlineList;
        // }
      
        console.log(onlineUserlist);
      
        item.display_name = item.name;
        item.ccpro_uid = uid;

        let userExist = false;   
        if( uid.startsWith( WP_API_CONSTANTS.WP_PREFIX ) ){ 
        onlineUserlist.map( ( mappedUser, key ) => {
          if( uid == mappedUser.uid ){
            console.log( uid );

            console.log( unreadMessage[uid] );

           
            if( onlineUserlist[key].hasOwnProperty('unreadMessageCount') && onlineUserlist[key].unreadMessageCount != undefined ){
              onlineUserlist[key].unreadMessageCount = unreadMessage[uid];
              // let tmp_user = onlineUserlist[key];
              // onlineUserlist.splice(key, 1);
              // onlineUserlist.unshift(tmp_user);
              // let tmp_user = onlineUserlist[key];
              // onlineUserlist = onlineUserlist.filter((v, i, a) => a.indexOf(v) === i);
            
              // onlineUserlist.unshift( tmp_user );
             }
            
            
          }
        });
        

        offlineUserlist.map( ( mappedUser, key ) => {
          if( uid == mappedUser.uid ){
            console.log( uid );

            console.log( unreadMessage[uid] );

            if( offlineUserlist[key].hasOwnProperty('unreadMessageCount') && offlineUserlist[key].unreadMessageCount != undefined ){
              offlineUserlist[key].unreadMessageCount = unreadMessage[uid];
          
                // let tmp_user = offlineUserlist[key];
                // offlineUserlist.splice(key, 1);
                // offlineUserlist.unshift(tmp_user);
             
              // offlineUserlist = offlineUserlist.filter((v, i, a) => a.indexOf(v) === i);
          
              // offlineUserlist.unshift( tmp_user );
              
            }
            
          }
        });
      }

        
        this.setState({userlist: offlineUserlist});
        this.setState({onlineList: onlineUserlist});
      },
      error => {
        console.log("Error in getting message count", error);
        // return false;
      }
    );
  }


  setAttendees = ( userList ) => {
    if(userList.data.length === 0) {
      this.decoratorMessage = "No users found";
      this.setState({ userlist: '' });
    }
    userList.data.forEach(user => {
      
      user = this.setAvatar(user)
      
    });

    this.getUnreadMessage();
    let ccpro_userlist = [];
    let ccpro_onlineuserlist = [];
    this.UserListManager.fetchNextUsers().then((ccproUserList) => {
      
      let arrrUserlist = [];
      if(ccproUserList.length === 0) {
        this.decoratorMessage = "No users found";
      }
      
      ccproUserList.map((user, key) => {
        if( user.uid.startsWith( WP_API_CONSTANTS.WP_PREFIX ) ){
          if( this.state.unreadMessageList.hasOwnProperty(user.uid) && this.state.unreadMessageList[user.uid] != undefined ){
            ccproUserList[key]['unreadMessageCount'] = this.state.unreadMessageList[user.uid];
            
            ccpro_onlineuserlist[key] = user;
            // ccpro_onlineuserlist[key]['unreadMessageCount'] = this.state.unreadMessageList[user.uid];
            // let tmp_user = ccpro_onlineuserlist[key];
            // ccpro_onlineuserlist.unshift( tmp_user );
            
          }else{
              ccpro_onlineuserlist[key] = user;
          }
          ccpro_userlist[user.uid] = user;
          ccproUserList[key]['ID'] = user.uid;
          ccproUserList[key]['type'] = 'user';
          ccproUserList[key]['ccpro_uid'] = user.uid;
          ccproUserList[key]['display_name'] = user.name;
          user.ID = user.uid;
          user.ccpro_uid = user.uid;
          user.type = 'user';
          user.display_name =  user.name;
          let id = user.uid.replace("aad-","");
          arrrUserlist[id] = user;
          arrrUserlist[id]['status'] = user.status;
          ccpro_onlineuserlist = ccpro_onlineuserlist.filter((v, i, a) => a.indexOf(v) === i);
         if( this.i == 0 ){
            this.handleClick(user);
            this.i = 1;
          }  
        }
        
      });
      userList.data.map((user, key) => {
        if( this.state.unreadMessageList.hasOwnProperty(user.ccpro_uid) ){
          userList.data[key]['unreadMessageCount'] = this.state.unreadMessageList[user.ccpro_uid];
          let tmp_user = userList.data[key];
          // move()
          // delete userList.data.key;
          userList.data.unshift( tmp_user );
          userList.data = userList.data.filter((v, i, a) => a.indexOf(v) === i);;
        }
        if( this.i == 0 ){
          this.handleClick(user);
          this.i = 1;
        }  
        userList.data[key]['type'] = 'user';
        userList.data[key]['uid'] = user.ccpro_uid;
        this.setAvatar(user);
      });
      this.setState({ userlist: userList.data });
      this.setState({ onlineList: ccpro_onlineuserlist});
      this.setState({ onlineUserList: ccpro_userlist});
    }).catch((error) => {

      this.decoratorMessage = "Error";
      console.error("[CometChatUserList] getUsers fetchNext error", error);
    });
    
  }

  getUsers = () => {
    let last_users_udpated = localStorage.getItem( "last_users_udpated" );

      if( !last_users_udpated || !this.canUseCache( last_users_udpated, 3 ) ){

      new CometChatManager().getLoggedInUser().then(user => {
        this.loggedInUser = user;
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_USERS}`;
        // let api_url = 'https://aad-demo.myconferencenow.com/wp-content/plugins/nb-chat-react/users.json';
        
        // let cachedUserList = localStorage.getItem( "all_attendees" );
        // let cachedUserListTimeout = localStorage.getItem( "all_attendees_timeout" );
        
        // if( !this.canUseCache( cachedUserListTimeout, this.cacheTimeout ) ){
        //   localStorage.setItem( "all_attendees", "" );
        // }
      
        // if( cachedUserList ){
        //   let userData = JSON.parse( cachedUserList );
        //   this.setAttendees( userData );
        // } else {
          axios.get( api_url, {
            params:{
              user_id: WP_API_CONSTANTS.WP_USER_ID
            }
          }).then(userList => {
            localStorage.setItem( "all_attendees", JSON.stringify( userList ) );
            localStorage.setItem( "all_attendees_timeout", this.getCurrentTime() );
            this.setAttendees( userList );
            localStorage.setItem( "last_users_udpated", this.getCurrentTime() );
          }).catch((error) => {
            this.decoratorMessage = "Error";
            console.error("[CometChatUserList] getUsers fetchNext error", error);
          });
        // }

      }).catch((error) => {
        this.decoratorMessage = "Error";
        console.log("[CometChatUserList] getUsers getLoggedInUser error", error);
      });
    }
  }

  setAvatar(user) {

    user.name = user.display_name;
    user.avatar = '';
    if(!user.avatar) {

      const uid = user.ID;
      const char = user.display_name.charAt(0).toUpperCase();
      user.avatar = SvgAvatar.getAvatar(uid, char)
    }

  }

  render() {
    let messageContainer = null;
    
    if(this.state.userlist.length === 0) {
      messageContainer = (
        <div css={contactMsgStyle()}>
          <p css={contactMsgTxtStyle(this.theme)}>{this.decoratorMessage}</p>
        </div>
      );
    }
    let users = '';
    let onlineUsers = '';
    if( this.state.onlineList != ''){
      const userList = [...this.state.userlist];
      const onlineUserList = this.state.onlineUserList;
      let currentLetter = "";
        onlineUsers = this.state.onlineList.map((user, key) => {
        user.ccpro_uid = user.uid;
        user.ID = user.uid;
        user.display_name = user.name;
        const uid = user.ccpro_uid;
        const char = user.display_name.charAt(0).toUpperCase();
        user.avatar = SvgAvatar.getAvatar(uid, char)
        const chr = user.display_name[0].toUpperCase();
        let firstChar = null;
        if (chr !== currentLetter) {
          currentLetter = chr;
          firstChar = (<div css={contactAlphabetStyle()}>{currentLetter}</div>);
        } else {
          firstChar = null;
        }
        if( user.ccpro_uid == WP_API_CONSTANTS.CCPRO_USER_ID ){

        }else{
          return (
            <React.Fragment key={user.ccpro_uid}>
              {/* {firstChar} */}
              <UserView 
              theme={this.theme}
              user={user} 
              selectedUser={this.state.selectedUser}
              widgetsettings={this.props.widgetsettings} 
              clickeHandler={this.handleClick}  />
            </React.Fragment>
          );
        }
        
      });
    }
    if( this.state.userlist != ''){
       
      const userList = [...this.state.userlist];
      const onlineUserList = this.state.onlineUserList;
      let currentLetter = "";
       users = userList.map((user, key) => {
        
        // if(  ){
          // let ccproId = user.ccpro_uid;
          // console.log(user.ccpro_uid);
          // console.log(onlineUserList[ccproId]);
          if( user.ccpro_uid && onlineUserList[user.ccpro_uid] && onlineUserList[user.ccpro_uid]['uid'] == user.ccpro_uid ){
            user['status'] = onlineUserList[user.ccpro_uid]['status'];
          }else{
            user['status'] = '';
            const chr = user.display_name[0].toUpperCase();
            let firstChar = null;
            if (chr !== currentLetter) {
              currentLetter = chr;
              firstChar = (<div css={contactAlphabetStyle()}>{currentLetter}</div>);
            } else {
              firstChar = null;
            }

            return (
              <React.Fragment key={key}>
                {firstChar}
                <UserView 
                theme={this.theme}
                user={user} 
                // conversation={conversation}
                selectedUser={this.state.selectedUser}
                widgetsettings={this.props.widgetsettings} 
                clickeHandler={this.handleClick}  />
              </React.Fragment>
            );
          }

      });
    }
    let onlineLabel;
    let offlineLabel;
    if( onlineUsers != '' ){
      onlineLabel = (
        <h4>Online</h4>
      );
    }else{
      onlineLabel = (
       ''
      );
    }
    if( users != '' ){
      offlineLabel = (
        <h4>Offline</h4>
      );
    }else{
      offlineLabel = (
       ''
      );
    }
    let closeBtn = (<div css={contactHeaderCloseStyle(navigateIcon)} onClick={this.handleMenuClose}></div>);
    if (!this.props.hasOwnProperty("enableCloseMenu") || (this.props.hasOwnProperty("enableCloseMenu") && this.props.enableCloseMenu === 0)) {
      closeBtn = null;
    }

    return (
      <div className="ccpro_user_list" css={contactWrapperStyle()}>
     
        <div css={contactSearchStyle()}>
          <input
          type="text" 
          autoComplete="off" 
          css={contactSearchInputStyle(this.theme, searchIcon)}
          placeholder="Search"
          onChange={this.searchUsers} />
        </div>
        {messageContainer}
        {onlineLabel}
        <div className="ccpro_online_user" css={contactListStyle()} onScroll={this.handleScroll} ref={el => this.userListRef = el}>{onlineUsers}</div>
        {offlineLabel}
        <div className="ccpro_offline_user" css={contactListStyle()} onScroll={this.handleScroll} ref={el => this.userListRef = el}>{users}</div>
      </div>
    );
  }
}

export default CometChatUserList;