import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { checkMessageForExtensionsData } from "../../util/common";

import ToolTip from "../ToolTip";
import ReplyCount from "../ReplyCount";
import ReadReciept from "../ReadReciept";
import RegularReactionView from "../RegularReactionView";

import {
    messageContainerStyle,
    messageWrapperStyle,
    messageTxtWrapperStyle,
    messageTxtContainerStyle,
    messageTxtStyle,
    messageBtnStyle,
    messageInfoWrapperStyle,
    messageReactionsWrapperStyle,
} from "./style";

import whiteboardIcon from "./resources/senderwhiteboard.png";

class SenderWhiteboardBubble extends React.PureComponent {

    messageFrom = "sender";

    constructor(props) {

        super(props);
        const message = Object.assign({}, props.message, { messageFrom: this.messageFrom });

        this.state = {
            message: message
        }
    }

    componentDidUpdate(prevProps) {

        const previousMessageStr = JSON.stringify(prevProps.message);
        const currentMessageStr = JSON.stringify(this.props.message);

        if (previousMessageStr !== currentMessageStr) {

            const message = Object.assign({}, this.props.message, { messageFrom: this.messageFrom });
            this.setState({ message: message })
        }
    }

    launchCollaborativeWhiteboard = () => {

        let whiteboardUrl = null;
        let whiteboardData = checkMessageForExtensionsData(this.state.message, "whiteboard");
        if (whiteboardData
        && whiteboardData.hasOwnProperty("board_url")
        && whiteboardData.board_url.length) {

            let username = this.props.loggedInUser.name.split(' ').join('_');
            // Appending the username to the board_url
            whiteboardUrl = whiteboardData.board_url + '&username=' + username;
            window.open(whiteboardUrl, '', 'fullscreen=yes, scrollbars=auto');
        }
    }

    render() {

        let messageReactions = null;
        const reactionsData = checkMessageForExtensionsData(this.state.message, "reactions");
        if (reactionsData) {

            if (Object.keys(reactionsData).length) {
                messageReactions = (
                    <div css={messageReactionsWrapperStyle()} className="message__reaction__wrapper">
                        <RegularReactionView
                        theme={this.props.theme}
                        message={this.state.message}
                        reaction={reactionsData}
                        loggedInUser={this.props.loggedInUser}
                        widgetsettings={this.props.widgetsettings}
                        actionGenerated={this.props.actionGenerated} />
                    </div>
                );
            }
        }

        const documentTitle = "You’ve created a new collaborative whiteboard";
        return (
            <div css={messageContainerStyle()} className="sender__message__container message__document">

                <ToolTip {...this.props} message={this.state.message} />
                    
                <div css={messageWrapperStyle()} className="message__wrapper">
                    <div css={messageTxtWrapperStyle(this.props)} className="message__whiteboard__wrapper">
                        <div css={messageTxtContainerStyle()} className="message__whiteboard__container">
                            <img src={whiteboardIcon} alt="Collaborative Whiteboard" />
                            <p css={messageTxtStyle()} className="document__title">{documentTitle}</p>
                        </div>
                        <ul css={messageBtnStyle(this.props)} className="document__button">
                            <li onClick={this.launchCollaborativeWhiteboard}>
                                <p>Launch</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {messageReactions}

                <div css={messageInfoWrapperStyle()} className="message__info__wrapper">
                    <ReplyCount {...this.props} message={this.state.message} />
                    <ReadReciept {...this.props} message={this.state.message} />
                </div>

            </div>
        )
    }
}

export default SenderWhiteboardBubble;