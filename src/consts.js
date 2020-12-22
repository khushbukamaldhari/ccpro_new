
const ccproWpData = window.ccproWpData || {}
const ccpro_meet_and_booking = window.ccpro_meet_and_booking || {}
const { mode, ccpro_group_id, wp_user_role, ccpro_user_id,enable_room, wp_ccpro_api_url, wp_ccpro_prefix, wp_ccpro_user_name,wp_user_id } = ccproWpData;
const { table_id, table_name, table_user } = ccpro_meet_and_booking;

export const COMETCHAT_CONSTANTS = {
    APP_ID: '241877f844c2f4d',
    REGION: 'us',
    AUTH_KEY: '41db61f5d49de0347f52d5b63a45c8b9b3c95f11',
    CCPRO_GROUP_ID: ccpro_group_id,
    MODE: mode,
}

export const COMETCHAT_VARS = {
    CHAT_MODE_NBR: 'nbr',
    CHAT_MODE_SCHEDULAR: 'schedular',
}

export const WP_API_CONSTANTS = {
    WP_USER_ID: wp_user_id,
    CCPRO_USER_ID: ccpro_user_id,
    WP_API_URL: wp_ccpro_api_url,
    WP_PREFIX: wp_ccpro_prefix,
    WP_USER_NAME: wp_ccpro_user_name,
    WP_TABLE_ID: table_id,
    WP_TABLE_NAME: table_name,
    WP_TABLE_USERS: table_user,
    ENABLE_ROOM: enable_room,
    WP_USER_ROLE: wp_user_role
}

export const WP_API_ENDPOINTS_CONSTANTS = {
    GET_USERS: 'users',
    GET_CHATROOMTABLES: 'chatroomtables',
    GET_CHATROOM: 'chatrooms',
    POST_JOINTABLE: 'jointable',
    LEAVE_JOINTABLE: 'leavetable',
    POST_STARTCALL: 'startcall',
    POST_CHECKCALL: 'checkcall',
    POST_CHECKSTATUSCALL: 'checkcall_status',
    COMETCHAT_ADD_USER: 'cometchat_user_create',
    POST_ENDCALL: 'endcall',
    CHECK_USERJOIN_STATUS: 'check_userjoin_status',
    SEARCH_USERS: 'search_users'
}