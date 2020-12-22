import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import { SvgAvatar } from '../../util/svgavatar';

import * as enums from '../../util/enums.js';

import { GroupListManager } from "./controller";

import CometChatCreateGroup from "../CometChatCreateGroup";
import RoomView from "../RoomView";

import { theme } from "../../resources/theme";

import {
  groupWrapperStyle,
  groupHeaderStyle,
  groupHeaderCloseStyle,
  groupHeaderTitleStyle,
  groupAddStyle,
  groupSearchStyle,
  groupSearchInputStyle,
  groupMsgStyle,
  groupMsgTxtStyle,
  groupListStyle
} from "./style";

import searchIcon from './resources/search-grey-icon.svg';
import navigateIcon from './resources/navigate_before.svg';
import addIcon from './resources/edit-blue-icon.svg';
import axios from 'axios';
import { WP_API_CONSTANTS, WP_API_ENDPOINTS_CONSTANTS } from '../../../../consts';
import { addLoader, removeLoader } from '../../../../loader';

class CometChatRoomList extends React.Component {
  timeout;
  loggedInUser = null;
  decoratorMessage = "Loading...";

  constructor(props) {

    super(props);

    this.state = {
      roomlist: [],
      roomupdated: false,
      createGroup: false,
      selectedGroup: null
    }
    this.groupListRef = React.createRef();
    this.theme = Object.assign({}, theme, this.props.theme);
  }

  componentDidMount() {
    this.GroupListManager = new GroupListManager();
    addLoader();
    this.getRooms();
    if( this.props.roomUpdate == true ){
      this.getRooms();
    }
    console.log(this.props.roomUpdate);
    console.log(this.state.roomupdated);
    this.setState({ roomupdated: false });
    this.GroupListManager.attachListeners(this.groupUpdated);
  }

  componentDidUpdate(prevProps) {
    
    const previousItem = JSON.stringify(prevProps.item);
    const currentItem = JSON.stringify(this.props.item);
    //if different group is selected
    if (previousItem !== currentItem) {
      if( this.props.roomUpdate == true  ){
        this.getRooms();
      }
      console.log(this.props.item);
      if (Object.keys(this.props.item).length === 0) {

        this.groupListRef.scrollTop = 0;
        this.setState({ selectedGroup: {} });

      } else {

        let roomlist = [...this.state.roomlist];
        console.log(this.props.item);
        console.log(roomlist);
        //search for user
        let groupKey = roomlist.findIndex(g => g.ID === this.props.item.ID);
        console.log(groupKey);

        if (groupKey > -1) {

          let groupObj = { ...roomlist[groupKey] };
          this.setState({ selectedGroup: groupObj });
        }
        console.log(this.state.selectedGroup);
      }
    }

    if(prevProps.roomToLeave && prevProps.roomToLeave.ID !== this.props.roomToLeave.ID) {
      
      const groups = [...this.state.roomlist];
      const groupKey = groups.findIndex(member => member.ID === this.props.roomToLeave.ID);
      
      if(groupKey > -1) {

        let groupObj = { ...groups[groupKey] };
        let membersCount = parseInt(groupObj.membersCount) - 1;

        let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount, hasJoined: false });

        groups.splice(groupKey, 1, newgroupObj);
        this.setState({roomlist: groups});
      }
    }

    if(prevProps.roomToDelete && prevProps.roomToDelete.ID !== this.props.roomToDelete.ID) {
            
      const groups = [...this.state.roomlist];
      const groupKey = groups.findIndex(member => member.ID === this.props.roomToDelete.ID);
      if(groupKey > -1) {

        groups.splice(groupKey, 1);
        this.setState({roomlist: groups});
        if(groups.length === 0) {
          this.decoratorMessage = "No groups found";
        }
      }
    }

    if(prevProps.roomToUpdate 
    && (prevProps.roomToUpdate.ID !== this.props.roomToUpdate.ID 
    || (prevProps.roomToUpdate.ID === this.props.roomToUpdate.ID ))) {
            
      const groups = [...this.state.roomlist];
      const roomToUpdate = this.props.roomToUpdate;

      const groupKey = groups.findIndex(group => group.ID === roomToUpdate.ID);
      if(groupKey > -1) {
        const groupObj = groups[groupKey];
        const newGroupObj = Object.assign({}, groupObj, roomToUpdate, {scope: roomToUpdate["scope"], membersCount: roomToUpdate["membersCount"]});

        groups.splice(groupKey, 1, newGroupObj);
        this.setState({roomlist: groups});
      }
    }

  }

  componentWillUnmount() {
    this.GroupListManager = null;
  }

  groupUpdated = (key, message, group, options) => {
    
    switch(key) {
      case enums.GROUP_MEMBER_SCOPE_CHANGED:
        this.updateMemberChanged(group, options);
        break;
      case enums.GROUP_MEMBER_KICKED:
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_LEFT:
        this.updateMemberRemoved(group, options);
        break;
      case enums.GROUP_MEMBER_ADDED:
        this.updateMemberAdded(group, options);
        break;
      case enums.GROUP_MEMBER_JOINED:
        this.updateMemberJoined(group, options);
        break;
      default:
        break;
    }
  }

  updateMemberRemoved = (group, options) => {
    
    let roomlist = [...this.state.roomlist];

    //search for group
    let groupKey = roomlist.findIndex((g, k) => g.guid === group.guid);

    if (groupKey > -1) {

      if (options && this.loggedInUser.uid === options.user.uid) {

        let groupObj = { ...roomlist[groupKey] };
        let membersCount = parseInt(groupObj.membersCount) - 1;
        
        let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount, hasJoined: false });
        
        roomlist.splice(groupKey, 1, newgroupObj);
        this.setState({ roomlist: roomlist });

      } else {

        let groupObj = { ...roomlist[groupKey] };
        let membersCount = parseInt(groupObj.membersCount) - 1;

        let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount });

        roomlist.splice(groupKey, 1, newgroupObj);
        this.setState({ roomlist: roomlist });

      }
    }

  }

  updateMemberAdded = (group, options) => {

    let roomlist = [...this.state.roomlist];

    //search for group
    let groupKey = roomlist.findIndex((g, k) => g.guid === group.guid);

    if (groupKey > -1) {

      let groupObj = { ...roomlist[groupKey] };

      let membersCount = parseInt(groupObj.membersCount) + 1;

      let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount });

      roomlist.splice(groupKey, 1, newgroupObj);
      this.setState({ roomlist: roomlist });

    } else {

      let groupObj = { ...group };

      let scope = groupObj.hasOwnProperty("scope") ? groupObj.scope : {};
      let hasJoined = groupObj.hasOwnProperty("hasJoined") ? groupObj.hasJoined : false;
      let membersCount = parseInt(groupObj.membersCount) + 1;
      this.setAvatar(groupObj);
      if (options && this.loggedInUser.uid === options.user.uid) {
        scope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
        hasJoined = true;
      } 

      let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount, scope: scope, hasJoined: hasJoined });

      const roomlist = [newgroupObj, ...this.state.roomlist];
      this.setState({ roomlist: roomlist });
    }
  }

  updateMemberJoined = (group, options) => {

    let roomlist = [...this.state.roomlist];

    //search for group
    let groupKey = roomlist.findIndex((g, k) => g.guid === group.guid);

    if (groupKey > -1) {

      let groupObj = { ...roomlist[groupKey] };

      let scope = groupObj.scope;
      let membersCount = parseInt(groupObj.membersCount) + 1;

      if (options && this.loggedInUser.uid === options.user.uid) {
        scope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
      } 

      let newgroupObj = Object.assign({}, groupObj, { membersCount: membersCount, scope: scope });

      roomlist.splice(groupKey, 1, newgroupObj);
      this.setState({ roomlist: roomlist });
    } 
  }

  updateMemberChanged = (group, options) => {

    let roomlist = [...this.state.roomlist];

    //search for group
    let groupKey = roomlist.findIndex((g, k) => g.guid === group.guid);

    if (groupKey > -1) {

      let groupObj = { ...roomlist[groupKey] };
      if (options && this.loggedInUser.uid === options.user.uid) {

        let newgroupObj = Object.assign({}, groupObj, { scope: options.scope });

        roomlist.splice(groupKey, 1, newgroupObj);
        this.setState({ roomlist: roomlist });
      }
    }
  }
  
  handleScroll = (e) => {
    const bottom =
      Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) === Math.round(e.currentTarget.clientHeight);
    if (bottom) this.getRooms();
  }

  leaveGroup = (group) => {
    addLoader();
    console.log("leave");
    console.log(group);
    console.log(this.props.item);
    // group.group_id = 'supergroup';
    const guid = group.joined_tableid;
    console.log(guid);
    
    CometChat.leaveGroup(guid).then(hasLeft => {
        console.log("Group left successfully:", hasLeft);
        const table_leave = {
          user_id: WP_API_CONSTANTS.WP_USER_ID,
          guid: guid,
          ccpro_id: WP_API_CONSTANTS.CCPRO_USER_ID,  
          roomid: group.ID
        };
        let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.LEAVE_JOINTABLE}`;
        console.log(table_leave);
        
        axios.post( api_url , table_leave).then(hasLeft => {
          console.log("Table left successfully:", hasLeft);
          new CometChatManager().getLoggedInUser().then(user => {
            this.loggedInUser = user;
            let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOM}`;
            addLoader();
            axios.get( api_url, {
              params: {
                user_id: WP_API_CONSTANTS.WP_USER_ID
              }
            }).then(roomList => {
              addLoader();
              if(roomList.data.length === 0) {
                this.decoratorMessage = "No rooms found";
              }
        
              roomList.data.forEach(group => 
                group = this.setAvatar(group)
                );
              let groupKey = roomList.data.findIndex((g, k) => g.ID === group.ID);
              if(groupKey > -1) {
    
                const groupObj = roomList.data[groupKey];
                const newGroupObj = Object.assign({}, groupObj, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});
    
                roomList.data.splice(groupKey, 1, newGroupObj);
                this.setState({roomlist: roomList.data, selectedGroup: newGroupObj});
                console.log(groupObj);

                this.setState({selectedGroup: groupObj});
                let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOMTABLES}/${group.ID}`;
                
                axios.get( api_url).then(roomListTable => {
                  roomListTable.data.map((table, key) => {
                    table.guid = table.table_id;
                    table.icon = table.table_image;
                    table.name = table.table_name;
                    table.membersCount = table.table_users.length;
                  });
                  roomListTable['group'] = group;
                  if(roomListTable.data.length === 0) {
                    this.decoratorMessage = "No rooms found";
                  }
                  
                  console.log(this.state.selectedGroup);
                  console.log(roomListTable);
                  this.props.onItemClick(roomListTable, 'rooms');
                }).catch(error => {
            
                  this.decoratorMessage = "Error";
                  console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
                  
                });
                  
                  
                  
                  
                  
                //   tablelist => {
                //   // tablelist.data.post_title = group.post_title;
                //   tablelist.data['group'] = group;
                //   tablelist.data['data'] = tablelist.data;
                //   console.log(this.state.selectedGroup);
                //   this.props.onItemClick(tablelist.data, 'rooms');
                // });
                
                // this.handleClick(newGroupObj);
                // this.props.onItemClick(newGroupObj, 'rooms');
                // console.log(this.state.roomlist);
              } 
              this.setState({ roomlist: roomList.data });
              // removeLoader();
              console.log(this.props.item);
            }).catch(error => {
        
                this.decoratorMessage = "Error";
                console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
                
              });
             
        
            }).catch(error => {
        
              this.decoratorMessage = "Error";
              console.log("[CometChatGroupList] getUsers getLoggedInUser error", error);
              
            });
          
          
      }).catch(error => {
          console.log("Table leaving failed with exception:", error);
          
      });
        // props.actionGenerated("leftGroup", props.item);
    }).catch(error => {
        console.log("Group leaving failed with exception:", error);
        // removeLoader();
    });
  }

  handleClick = (group) => {
    if(!this.props.onItemClick)
      return;

    if (group.hasJoined === false) {

      if(this.props.hasOwnProperty("widgetsettings")
      && this.props.widgetsettings
      && this.props.widgetsettings.hasOwnProperty("main") 
      && this.props.widgetsettings.main.hasOwnProperty("join_or_leave_groups")
      && this.props.widgetsettings.main["join_or_leave_groups"] === false) {
        
        console.log("Room joining disabled in widget settings");
        return false;
      }

      let password = "";
      if(group.type === CometChat.GROUP_TYPE.PASSWORD) {
        password = prompt("Enter your password");
      } 

      const guid = group.ID;
      const groupType = group.type;
      
      CometChat.joinGroup(guid, groupType, password).then(response => {

        console.log("Group joining success with response", response, "group", group);

        const groups = [...this.state.roomlist];

        let groupKey = groups.findIndex((g, k) => g.guid === guid);
        if(groupKey > -1) {

          const groupObj = groups[groupKey];
          const newGroupObj = Object.assign({}, groupObj, response, {"scope":  CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT});

          groups.splice(groupKey, 1, newGroupObj);
          this.setState({roomlist: groups, selectedGroup: newGroupObj});

          this.props.onItemClick(newGroupObj, 'rooms');
        } 
        
      }).catch(error => {
        console.log("Room joining failed with exception:", error);
      });

    } else {
      console.log(group);
      this.setState({selectedGroup: group});
      console.log(this.state.selectedGroup);
      this.props.onItemClick(group, 'rooms');
    }
  }

  handleMenuClose = () => {

    if(!this.props.actionGenerated) {
      return false;
    }

    this.props.actionGenerated("closeMenuClicked")
  }
  
  searchGroup = (e) => {

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    let val = e.target.value;
    this.timeout = setTimeout(() => {

      this.GroupListManager = new GroupListManager(val);
      this.setState({ roomlist: [] }, () => this.getRooms())
    }, 500)

  }

  markMessagesRead = (message) => {

    if (!(message.getReadAt() || message.getReadByMeAt())) {

      if (message.getReceiverType() === 'user') {
        CometChat.markAsRead(message.getId().toString(), message.getSender().getUid(), message.getReceiverType());
      } else {
        CometChat.markAsRead(message.getId().toString(), message.getReceiverId(), message.getReceiverType());
      }
    }
  }

  getRooms = () => {
    new CometChatManager().getLoggedInUser().then(user => {
    this.loggedInUser = user;
    
    let api_url = `${WP_API_CONSTANTS.WP_API_URL}${WP_API_ENDPOINTS_CONSTANTS.GET_CHATROOM}`;
    
    axios.get( api_url, {
      params: {
        user_id: WP_API_CONSTANTS.WP_USER_ID
      }
    }).then(roomList => {
      if(roomList.data.length === 0) {
        this.decoratorMessage = "No rooms found";
      }

      roomList.data.forEach(group => 
        group = this.setAvatar(group)
        );
      let i = 0;
      if( !this.state.selectedGroup ){
        roomList.data.map((room, key) => {
          if( i == 0 ){
            this.handleClick(room);
            i = 1;
          }  
        });
        removeLoader();
      }
      // if( i == 1){
      //   this.setState({ roomlist: roomList.data });
      // }
      
      this.setState({ roomlist: roomList.data });
      
      console.log(this.props.item);
    }).catch(error => {
      
        this.decoratorMessage = "Error";
        console.error("[CometChatRoomList] getRooms fetchNextRoom error", error);
        removeLoader();
      });
     

    }).catch(error => {

      this.decoratorMessage = "Error";
      console.log("[CometChatGroupList] getUsers getLoggedInUser error", error);
      removeLoader();
    });
  }

  createGroupHandler = (flag) => {
    this.setState({"createGroup": flag});
  }

  setAvatar(group) {
    if(!group.icon) {

      const guid = group.ID;
      const char = group.post_title.charAt(0).toUpperCase();
      group.icon = SvgAvatar.getAvatar(guid, char);

    }
    return group;
  }

  createGroupActionHandler = (action, group) => {

    if(action === "groupCreated") {

      this.setAvatar(group);
      const roomlist = [group, ...this.state.roomlist];

      this.handleClick(group);
      this.setState({ roomlist: roomlist, createGroup: false });
    }
  }

  render() {
    let messageContainer = null;
    if(this.state.roomlist.length === 0) {
      messageContainer = (
        <div css={groupMsgStyle()}>
          <p css={groupMsgTxtStyle(this.theme)}>{this.decoratorMessage}</p>
        </div>
      );
    }
    
    const groups = this.state.roomlist.map((group, key) => {
     console.log(this.state.selectedGroup);
      return (
      <RoomView 
      key={key} 
      theme={this.theme}
      group={group} 
      onleave={this.leaveGroup}
      selectedGroup={this.state.selectedGroup}
      clickHandler={this.handleClick} />);
    });

    let creategroup = (<div css={groupAddStyle(addIcon)} onClick={() => this.createGroupHandler(true)}></div>);
    if(this.props.hasOwnProperty("config") 
    && this.props.config
    && this.props.config.hasOwnProperty("group-create") 
    && this.props.config["group-create"] === false) {
      creategroup = null;
    }

    if(this.props.hasOwnProperty("widgetsettings") 
    && this.props.widgetsettings
    && this.props.widgetsettings.hasOwnProperty("main") 
    && this.props.widgetsettings.main.hasOwnProperty("create_groups")
    && this.props.widgetsettings.main["create_groups"] === false) {
      creategroup = null;
    }

    let closeBtn = (<div css={groupHeaderCloseStyle(navigateIcon)} onClick={this.handleMenuClose}></div>);
    if (!this.props.hasOwnProperty("enableCloseMenu") || (this.props.hasOwnProperty("enableCloseMenu") && this.props.enableCloseMenu === 0)) {
      closeBtn = null;
    }

    return (
      <div css={groupWrapperStyle()}>
        {/* <div css={groupHeaderStyle(this.theme)}>
          {closeBtn}
          <h4 css={groupHeaderTitleStyle(this.props)}>Rooms</h4>
        </div> */}
        {messageContainer}
        <div css={groupListStyle()} onScroll={this.handleScroll} ref={el => this.groupListRef = el}>{groups}</div>
      </div>
    );
  
  }
}

export default CometChatRoomList;