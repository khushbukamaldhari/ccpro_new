import { CometChat } from "@cometchat-pro/chat";
import * as enums from '../../util/enums.js';
export class UserListManager {
    userRequest = null;
    // userListenerId = "userlist_" + new Date().getTime();
    conversationListenerId = "chatlist_" + new Date().getTime();
    userListenerId = "chatlist_user_" + new Date().getTime();
    groupListenerId = "chatlist_group_" + new Date().getTime();
    callListenerId = "chatlist_call_" + new Date().getTime();

    constructor(friendsOnly, searchKey) {
        const limit = '100';

        if (searchKey) {
            this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(limit).setStatus(CometChat.USER_STATUS.ONLINE).setSearchKeyword(searchKey).build();
        } else {
            this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(limit).setStatus(CometChat.USER_STATUS.ONLINE).build();
        }
    }

    fetchNextUsers(status) {
        if( status == 'online' ){
            return this.usersRequest.fetchNext();
            // return this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(30).setStatus(CometChat.USER_STATUS.ONLINE).build();
        } else if( status == 'serch' ){
            return this.usersRequest.fetchNext();
            // return this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(30).setStatus(CometChat.USER_STATUS.ONLINE).build();
        }else{
            return this.usersRequest.fetchNext();
        }
    }

    attachListeners(callback) {
        
        // CometChat.addUserListener(
        //     this.userListenerId,
        //     new CometChat.UserListener({
        //         onUserOnline: onlineUser => {
        //             /* when someuser/friend comes online, user will be received here */
        //             callback(onlineUser);
        //         },
        //         onUserOffline: offlineUser => {
        //             /* when someuser/friend went offline, user will be received here */
        //             callback(offlineUser);
        //         }
        //     })
        // );

        CometChat.addUserListener(
            this.userListenerId,
            new CometChat.UserListener({
                onUserOnline: onlineUser => {
                    /* when someuser/friend comes online, user will be received here */
                    callback(enums.USER_ONLINE, onlineUser);
                },
                onUserOffline: offlineUser => {
                    /* when someuser/friend went offline, user will be received here */
                    callback(enums.USER_OFFLINE, offlineUser);
                }
            })
        );

        CometChat.addGroupListener(
            /*
            this.groupListenerId,
            new CometChat.GroupListener({
                onGroupMemberScopeChanged: (message, changedUser, newScope, oldScope, changedGroup) => {
                    callback(enums.GROUP_MEMBER_SCOPE_CHANGED, changedGroup, message, {"user": changedUser, "scope": newScope});
                }, 
                onGroupMemberKicked: (message, kickedUser, kickedBy, kickedFrom) => {
                    callback(enums.GROUP_MEMBER_KICKED, kickedFrom, message, {"user": kickedUser, "hasJoined": false});
                }, 
                onGroupMemberBanned: (message, bannedUser, bannedBy, bannedFrom) => {
                    callback(enums.GROUP_MEMBER_BANNED, bannedFrom, message, {"user": bannedUser});
                }, 
                onGroupMemberUnbanned: (message, unbannedUser, unbannedBy, unbannedFrom) => {
                    callback(enums.GROUP_MEMBER_UNBANNED, unbannedFrom, message, {"user": unbannedUser});
                }, 
                onMemberAddedToGroup: (message, userAdded, userAddedBy, userAddedIn) => {
                    callback(enums.GROUP_MEMBER_ADDED, userAddedIn, message, {"user": userAdded, "hasJoined": true});
                }, 
                onGroupMemberLeft: (message, leavingUser, group) => {
                    callback(enums.GROUP_MEMBER_LEFT, group, message, {"user": leavingUser});
                }, 
                onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
                    callback(enums.GROUP_MEMBER_JOINED, joinedGroup, message, {"user": joinedUser});
                }
            })
            */
        );

        // CometChat.addMessageListener(
        //     this.conversationListenerId,
        //     new CometChat.MessageListener({
        //         onTextMessageReceived: textMessage => {
        //             callback(enums.TEXT_MESSAGE_RECEIVED, null, textMessage);
        //         },
        //         onMediaMessageReceived: mediaMessage => {
        //             callback(enums.MEDIA_MESSAGE_RECEIVED, null, mediaMessage);
        //         },
        //         onCustomMessageReceived: customMessage => {
        //             callback(enums.CUSTOM_MESSAGE_RECEIVED, null, customMessage);
        //         },
        //     })
        // );

            
        CometChat.addMessageListener(
            this.conversationListenerId,
            new CometChat.MessageListener({
                onTextMessageReceived: textMessage => {
                    callback(enums.TEXT_MESSAGE_RECEIVED, textMessage);
                },
                onMediaMessageReceived: mediaMessage => {
                    callback(enums.MEDIA_MESSAGE_RECEIVED, mediaMessage);
                },
                onCustomMessageReceived: customMessage => {
                    callback(enums.CUSTOM_MESSAGE_RECEIVED, customMessage);
                },
                onMessagesDelivered: messageReceipt => {
                    callback(enums.MESSAGE_DELIVERED, messageReceipt);
                },
                onMessagesRead: messageReceipt => {
                    callback(enums.MESSAGE_READ, messageReceipt);
                },
                onMessageDeleted: deletedMessage => {
                    // callback(enums.MESSAGE_DELETED, deletedMessage);
                },
                onMessageEdited: editedMessage => {
                    // callback(enums.MESSAGE_EDITED, editedMessage);
                }
            })
        );
        CometChat.addCallListener(
            this.callListenerId,
            new CometChat.CallListener({
                onIncomingCallReceived: call => {
                  callback(enums.INCOMING_CALL_RECEIVED, null, call);
                },
                onIncomingCallCancelled: call => {
                    callback(enums.INCOMING_CALL_CANCELLED, null, call);
                }
            })
        );
    }



    removeListeners() {

        CometChat.removeUserListener(this.userListenerId);
    }
}