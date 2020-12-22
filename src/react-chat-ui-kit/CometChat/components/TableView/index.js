import React from "react";
/** @jsx jsx */
import { jsx } from '@emotion/core';

import Avatar from "../Avatar";

import {
  listItem,
  listItemIcon,
  itemThumbnailStyle,
  itemDetailStyle,
  itemNameStyle,
  itemDescStyle

} from "./style";

import shieldIcon from "./resources/shield.svg";
import lockIcon from "./resources/lock.svg";

const groupview = (props) => {

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

  return (
    <div css={listItem(props)} onClick={() => props.clickHandler(props.group)}>
      
      <div css={itemDetailStyle()}>
        <div css={itemNameStyle()}
        onMouseEnter={event => toggleTooltip(event, true)} 
        onMouseLeave={event => toggleTooltip(event, false)}>Test</div>
        <div css={itemDescStyle(props)}></div>
      </div>
      {/* {groupTypeIcon} */}
    </div>
  )
}

export default groupview;