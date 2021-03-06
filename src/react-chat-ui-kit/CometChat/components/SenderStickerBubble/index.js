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
    messageImgWrapper,
    messageInfoWrapperStyle,
    messageReactionsWrapperStyle,
} from "./style";

class SenderStickerBubble extends React.Component {

    messageFrom = "sender";

    constructor(props) {

        super(props);

        const message = Object.assign({}, props.message, { messageFrom: this.messageFrom });
        this.state = {
            message: message,
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

    render() {

        let stickerData = null;
        let stickerImg = null;
        if (this.state.message.hasOwnProperty("data") && this.state.message.data.hasOwnProperty("customData")) {

            stickerData = this.state.message.data.customData;

            if (stickerData.hasOwnProperty("sticker_url")) {
                const stickerName = (stickerData.hasOwnProperty("sticker_name")) ? stickerData.sticker_name : "Sticker";
                stickerImg = (<img src={stickerData.sticker_url} alt={stickerName} />);
            }
        }

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

        return (
            <React.Fragment>
                <div css={messageContainerStyle()} className="sender__message__container message__sticker">
                    
                    <ToolTip {...this.props} message={this.state.message} />

                    <div css={messageWrapperStyle()} className="message__wrapper">
                        <div css={messageImgWrapper(this.props)} className="message__img__wrapper">{stickerImg} </div>
                    </div>

                    {messageReactions}

                    <div css={messageInfoWrapperStyle()} className="message__info__wrapper">
                        <ReplyCount {...this.props} message={this.state.message} />
                        <ReadReciept {...this.props} message={this.state.message} />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default SenderStickerBubble;