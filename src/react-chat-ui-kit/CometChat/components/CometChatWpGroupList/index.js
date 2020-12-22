import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";
import { SvgAvatar } from '../../util/svgavatar';

import * as enums from '../../util/enums.js';

import { GroupListManager } from "./controller";

import CometChatCreateGroup from "../CometChatCreateGroup";
import TableView from "../TableView";

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

class CometChatWpGroupList extends React.Component {
  timeout;
  loggedInUser = null;
  decoratorMessage = "Loading...";

  constructor(props) {

    super(props);

    this.state = {
      grouplist: [],
      createGroup: false,
      selectedGroup: null
    }
    this.groupListRef = React.createRef();
    this.theme = Object.assign({}, theme, this.props.theme);
  }

  componentDidMount() {
    this.GroupListManager = new GroupListManager();
    this.getGroups();
    this.GroupListManager.attachListeners(this.groupUpdated);
  }

  getGroups = () => {

    new CometChatManager().getLoggedInUser().then(user => {

      this.loggedInUser = user;
      this.GroupListManager.fetchNextGroups().then(groupList => {

        if(groupList.length === 0) {
          this.decoratorMessage = "No groups found";
        }

        groupList.forEach(group => group = this.setAvatar(group));
        this.setState({ grouplist: [...this.state.grouplist, ...groupList] });

      }).catch(error => {

        this.decoratorMessage = "Error";
        console.error("[CometChatGroupList] getGroups fetchNextGroups error", error);
      });

    }).catch(error => {

      this.decoratorMessage = "Error";
      console.log("[CometChatGroupList] getUsers getLoggedInUser error", error);
    });
  }


  setAvatar(group) {

    if(group.hasOwnProperty("icon") === false) {

      const guid = group.guid;
      const char = group.name.charAt(0).toUpperCase();
      group.icon = SvgAvatar.getAvatar(guid, char);

    }
    return group;
  }

  handleClick = () => {
    if(!this.props.onItemClick)
      return;

      new CometChatManager().getLoggedInUser().then(user => {

        this.loggedInUser = user;
        this.GroupListManager.fetchNextGroups().then(groupList => {
  
          if(groupList.length === 0) {
            this.decoratorMessage = "No groups found";
          }
  
          groupList.forEach(group => group = this.setAvatar(group));
          this.setState({ grouplist: [...this.state.grouplist, ...groupList] });
  
        }).catch(error => {
  
          this.decoratorMessage = "Error";
          console.error("[CometChatwpGroupList] getGroups fetchNextGroups error", error);
        });
  
      }).catch(error => {
  
        this.decoratorMessage = "Error";
        console.log("[CometChatwpGroupList] getUsers getLoggedInUser error", error);
      });
      this.setState({selectedGroup: this.state.grouplist});
      
      this.props.onItemClick(this.state.grouplist, 'wpgroup');

      console.log(this.state.grouplist);
    
  }
  render() {

    let messageContainer = null;
    
    if(this.state.grouplist.length === 0) {
      messageContainer = (
        <div css={groupMsgStyle()}>
          <p css={groupMsgTxtStyle(this.theme)}>{this.decoratorMessage}</p>
        </div>
      );
    }

    const groups = () => {
      return (
      <TableView 
      theme={this.theme}
      selectedGroup={this.state.selectedGroup}
      clickHandler={this.handleClick} />);
    };
    
    return (
      <div css={groupWrapperStyle()}>
        <div css={groupHeaderStyle(this.theme)}>
          <h4 css={groupHeaderTitleStyle(this.props)}>Groups</h4>
        </div>
        <div css={groupSearchStyle()}>
          <input 
          type="text" 
          autoComplete="off" 
          css={groupSearchInputStyle(this.theme, searchIcon)}
          placeholder="Search" />
        </div>
        {/* {messageContainer} */}
        <div css={groupListStyle()}>
        <TableView 
        theme={this.theme}
        group={this.state.grouplist}
        selectedGroup={this.state.selectedGroup}
        clickHandler={this.handleClick} />
        </div>
       
      </div>
    );
  }
}

export default CometChatWpGroupList;