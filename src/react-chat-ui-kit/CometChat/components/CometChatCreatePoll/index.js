import React from "react";

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CometChat } from "@cometchat-pro/chat";

import { CometChatManager } from "../../util/controller";

import Backdrop from '../Backdrop';
import CreatePollView from "../CreatePollView";

import {
    modalWrapperStyle,
    modalCloseStyle,
    modalBodyStyle,
    modalErrorStyle,
    modalTableStyle,
    tableCaptionStyle,
    tableBodyStyle,
    tableFootStyle,
    iconWrapperStyle,
    addOptionIconStyle
} from "./style";

import addIcon from "./resources/add.png";
import clearIcon from "./resources/close.png";

class CometChatCreatePoll extends React.Component {

    loggedInUser = null;

    constructor(props) {

        super(props);
        this.state = {
            error: null,
            options: []
        }
        this.questionRef = React.createRef();
        this.optionOneRef = React.createRef();
        this.optionTwoRef = React.createRef();
        this.optionRef = React.createRef();
    }

    componentDidMount() {
        new CometChatManager().getLoggedInUser().then(user => {
            this.loggedInUser = user;
        }).catch((error) => {
            console.error("[CometChatCreatePoll] getLoggedInUser error", error);
        });
    }

    addPollOption = () => {

        const options = [...this.state.options];
        options.push({ value: "", id: new Date().getTime() });
        this.setState({options: options});
    }

    removePollOption = (option) => {

        const options = [...this.state.options];
        const optionKey = options.findIndex(opt => opt.id === option.id);
        if (optionKey > -1) {

            options.splice(optionKey, 1);
            this.setState({ options: options});
        }
    }

    optionChangeHandler = (event, option) => {

        const options = [...this.state.options];
        const optionKey = options.findIndex(opt => opt.id === option.id); 
        if (optionKey > -1) {

            const newOption = { ...option, value: event.target.value}
            options.splice(optionKey, 1, newOption);
            this.setState({ options: options });
        }
    }

    createPoll = () => {

        const question = this.questionRef.current.value.trim();
        const firstOption = this.optionOneRef.current.value.trim();
        const secondOption = this.optionTwoRef.current.value.trim();
        const optionItems = [firstOption, secondOption];

        if (question.length === 0) {

            this.setState({ error: "Question cannnot be blank." })
            return false;
        }

        if (firstOption.length === 0 || secondOption.length === 0) {

            this.setState({ error: "Option cannnot be blank." })
            return false;
        }

        this.state.options.forEach(function (option) {
            optionItems.push(option.value)
        })

        let receiverId;
        let receiverType = this.props.type;
        if (this.props.type === "user") {
            receiverId = this.props.item.uid;
        } else if (this.props.type === "group") {
            receiverId = this.props.item.guid;
        }

        CometChat.callExtension('polls', 'POST', 'v1/create', {
            "question": question,
            "options": optionItems,
            "receiver": receiverId,
            "receiverType": receiverType
        }).then(response => {

            const data = response.message.data;
            const customData = data.data.customData;
            const options = customData.options;

            const resultOptions = {};
            for (const option in options) {

                resultOptions[option] = {
                    text: options[option],
                    count: 0,
                }
            }

            const polls = {
                "id": data.id,
                "options": options,
                "results": {
                    "total": 0,
                    "options": resultOptions,
                    "question": customData.question
                },
                "question": customData.question
            };

            const message = { ...data, "sender": { "uid": data.sender }, "metadata": { "@injected": { "extensions": { "polls": polls } } } };
            this.props.actionGenerated("pollCreated", message);

        }).catch(error => {

            console.log("error", error);

            if (error.hasOwnProperty("message") && error.message.hasOwnProperty("message")) {
                this.setState({ error: error.message.message });
            } else {
                this.setState({ error: "Error" });
            }
            
        });
    }

    render() {

        const optionList = [...this.state.options];
        const pollOptionView = optionList.map((option, index) => {
            return (
                <CreatePollView 
                key={index} 
                option={option} 
                tabIndex={index+4}
                optionChangeHandler={this.optionChangeHandler}
                removePollOption={this.removePollOption} />
            );
        });

        let errorContainer = null;
        if (this.state.error) {
            errorContainer = (
                <tr className="error">
                    <td colSpan="3"><div css={modalErrorStyle()}>{this.state.error}</div></td>
                </tr>
            );
        }

        return (
            <React.Fragment>
                <Backdrop show={this.props.open} clicked={this.props.close} />
                <div css={modalWrapperStyle(this.props)} className="modal__createpoll">
                    <span css={modalCloseStyle(clearIcon)} className="modal__close" onClick={this.props.close}></span>
                    <div css={modalBodyStyle()} className="modal__body">
                        <table css={modalTableStyle(this.props)}>
                            <caption css={tableCaptionStyle()} className="modal__title">Create Poll</caption>
                            <tbody css={tableBodyStyle()}>
                                {errorContainer}
                                <tr className="poll__question">
                                    <td><label>Question</label></td>
                                    <td colSpan="2">
                                        <input type="text" autoFocus tabIndex="1" placeholder="Enter your question" ref={this.questionRef} />
                                    </td>
                                </tr>
                                <tr className="poll__options">
                                    <td><label>Options</label></td>
                                    <td colSpan="2">
                                        <input type="text" tabIndex="2" placeholder="Enter your option" ref={this.optionOneRef} />
                                    </td>
                                </tr>
                                <tr ref={this.optionRef} className="poll__options">
                                    <td>&nbsp;</td>
                                    <td colSpan="2">
                                        <input type="text" tabIndex="3" placeholder="Enter your option" ref={this.optionTwoRef} />
                                    </td>
                                </tr>
                                {pollOptionView}
                                <tr>
                                    <td>&nbsp;</td>
                                    <td><label>Add new option</label></td>
                                    <td css={iconWrapperStyle()}>
                                        <span tabIndex="100" css={addOptionIconStyle(addIcon)} className="option__add" onClick={this.addPollOption}></span>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot css={tableFootStyle(this.props)}>
                                <tr className="createpoll">
                                    <td colSpan="2"><button onClick={this.createPoll}>Create</button></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default CometChatCreatePoll;