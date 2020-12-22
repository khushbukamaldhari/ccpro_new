import React from "react";
/** @jsx jsx */
import { jsx } from '@emotion/core';

import Avatar from "../Avatar";
import "./style.css";
import {
  listItem,
  listItemIcon,
  itemThumbnailStyle,
  itemDetailStyle,
  itemNameStyle,
  itemDescStyle,
  itemLinkStyle

} from "./style";

import shieldIcon from "./resources/shield.svg";
import lockIcon from "./resources/lock.svg";
import { addLoader } from "../../../../loader";
const RoomView = (props) => {

  const toggleTooltip = (event, flag) => {

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

  const onleave = (group) => {
    addLoader();
    props.onleave( props.group );
  }

  let groupTypeIcon = null;
  if(props.group.type === "private") {

    groupTypeIcon = (<div css={listItemIcon()}><img src={shieldIcon} alt="time" /></div>);

  } else if(props.group.type === "password") {

    groupTypeIcon = (<div css={listItemIcon()}><img src={lockIcon} alt="time" /></div>);
  }
  let groupLeaveIcon = null;
  
  if(props.group.is_user_joined === true) {

    groupLeaveIcon = (<div className="ccpro_leave_btn"  css={itemDetailStyle()}>
          <button className="ccpro_btn" css={itemLinkStyle(props, 0)} onClick={() => onleave(props.group)}>Leave Table</button>
      </div>);

  } 
  return (
    
    <div className="ccpro_room_div" css={listItem(props)} onClick={() => props.clickHandler(props.group)}>
      <div className="ccpro_room_innerDiv" css={itemDetailStyle()}>
        <div css={itemNameStyle()}
        onMouseEnter={event => toggleTooltip(event, true)} 
        onMouseLeave={event => toggleTooltip(event, false)}>{props.group.post_title}</div>
        {groupLeaveIcon}
      </div>
      {groupTypeIcon}
    </div>
  )
}

export default RoomView;