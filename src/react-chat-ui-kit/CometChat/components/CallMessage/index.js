import React from "react";
import { useCallback } from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core'

import { CometChat } from "@cometchat-pro/chat";

import { callMessageStyle, callMessageTxtStyle } from "./style";

const CallMessage = (props) => {

    const getMessage = useCallback(() => {

        const call = props.message;
        const loggedInUser = props.loggedInUser;

        const messageSentFullDate = new Date(props.message.sentAt * 1000).toLocaleString();
        console.log(messageSentFullDate);
        let message = null;
        switch (call.status) {
    
            case CometChat.CALL_STATUS.INITIATED: {

                message = "Call initiated";
                if (call.type === "audio") {

                    if (call.receiverType === "user") {
                        message = (call.callInitiator.uid === loggedInUser.uid) ? "Outgoing audio call " + messageSentFullDate  : "Incoming audio call " + messageSentFullDate ;
                    } else if (call.receiverType === "group") {

                        if (call.action === CometChat.CALL_STATUS.INITIATED) {
                            message = (call.callInitiator.uid === loggedInUser.uid) ? "Outgoing audio call " + messageSentFullDate  : "Incoming audio call " + messageSentFullDate ;
                        } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
                            message = (call.sender.uid === loggedInUser.uid) ? "Call rejected" : `${call.sender.name} rejected call ${ messageSentFullDate }`;
                        }
                    }
                    
                } else if (call.type === "video") {

                    if (call.receiverType === "user") {
                        message = (call.callInitiator.uid === loggedInUser.uid) ? "Outgoing video call " + messageSentFullDate : "Incoming video call " + messageSentFullDate ;
                    } else if (call.receiverType === "group") {

                        if (call.action === CometChat.CALL_STATUS.INITIATED) {
                            message = (call.callInitiator.uid === loggedInUser.uid) ? "Outgoing video call " + messageSentFullDate  : "Incoming video call " + messageSentFullDate ;
                        } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
                            message = (call.sender.uid === loggedInUser.uid) ? "Call rejected" : `${call.sender.name} rejected call ${ messageSentFullDate }`;
                        }
                    }
                }
                break;
            }
            case CometChat.CALL_STATUS.ONGOING: {

                if (call.receiverType === "user") {
                    message = "Call accepted";
                } else if (call.receiverType === "group") {

                    if (call.action === CometChat.CALL_STATUS.ONGOING) {
                        message = (call.sender.uid === loggedInUser.uid) ? "Call accepted" : `${call.sender.name} joined ${ messageSentFullDate }`;
                    } else if (call.action === CometChat.CALL_STATUS.REJECTED) {
                        message = (call.sender.uid === loggedInUser.uid) ? "Call rejected" : `${call.sender.name} rejected call ${ messageSentFullDate }`;
                    } else if(call.action === "left") {
                        message = (call.sender.uid === loggedInUser.uid) ? "You left the call" : `${call.sender.name} left the call ${ messageSentFullDate }`;
                    }
                }

                break;
            }
            case CometChat.CALL_STATUS.UNANSWERED: {

                message = "Call unanswered";
                if (call.type === "audio" && (call.receiverType === "user" || call.receiverType === "group")) {
                    message = (call.callInitiator.uid === loggedInUser.uid) ? "Unanswered audio call" : "Missed audio call " + messageSentFullDate;
                } else if (call.type === "video" && (call.receiverType === "user" || call.receiverType === "group")) {
                    message = (call.callInitiator.uid === loggedInUser.uid) ? "Unanswered video call" : "Missed video call " + messageSentFullDate;
                }
                break;
            }
            case CometChat.CALL_STATUS.REJECTED: {
                message = "Call rejected " + messageSentFullDate;
                break;
            }
            case CometChat.CALL_STATUS.ENDED:
                message = "Call ended " + messageSentFullDate;
                break;
            case CometChat.CALL_STATUS.CANCELLED:
                message = "Call cancelled " + messageSentFullDate;
                break;
            case CometChat.CALL_STATUS.BUSY:
                message = "Call busy " + messageSentFullDate;
                break;
            default:
                break;
        }

        return <p css={callMessageTxtStyle}>{message}</p>
    }, [props]);

    return (
        <div css={callMessageStyle()} className="call__message">{getMessage()}</div>
    )
}

export default CallMessage;