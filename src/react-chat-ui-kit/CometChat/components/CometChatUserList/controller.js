import { CometChat } from "@cometchat-pro/chat";
import { WP_API_CONSTANTS } from "../../../../consts";

export class UserListManager {

    userRequest = null;
    userListenerId = "userlist_" + new Date().getTime();
    
    constructor(friendsOnly, searchKey) {
        let role = WP_API_CONSTANTS.WP_USER_ROLE;
        if (searchKey) {
            this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(100).setRole(role).friendsOnly(friendsOnly).setSearchKeyword(searchKey).build();
        } else {
            this.usersRequest = new CometChat.UsersRequestBuilder().setLimit(100).setRole(role).friendsOnly(friendsOnly).build();
        }
    }

    fetchNextUsers() {
        return this.usersRequest.fetchNext();
    }

    attachListeners(callback) {
        
        CometChat.addUserListener(
            this.userListenerId,
            new CometChat.UserListener({
                onUserOnline: onlineUser => {
                    /* when someuser/friend comes online, user will be received here */
                    callback(onlineUser);
                },
                onUserOffline: offlineUser => {
                    /* when someuser/friend went offline, user will be received here */
                    callback(offlineUser);
                }
            })
        );
    }

    removeListeners() {

        CometChat.removeUserListener(this.userListenerId);
    }
}