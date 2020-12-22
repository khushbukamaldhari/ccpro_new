import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import App from './defaultPages/App';

//import * as serviceWorker from './serviceWorker';
import { CometChat } from "@cometchat-pro/chat"
import { COMETCHAT_CONSTANTS, WP_API_CONSTANTS } from './consts';

import reducer from './store/reducer';

import './index.scss';

import {
    CometChatConversationList,
    CometChatUserList,
    CometChatUnified,
    CometChatNotLogin,
    CometChatGroupList,
    CometChatUserListScreen,
    CometChatConversationListScreen,
    CometChatGroupListScreen
} from './react-chat-ui-kit/CometChat';
// import firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";
// import './style.css';
// import ScriptTag from 'react-script-tag';
const store = createStore(reducer, compose(
  applyMiddleware(thunk)
));

var appID = COMETCHAT_CONSTANTS.APP_ID;
var region = COMETCHAT_CONSTANTS.REGION;
var AUTH_KEY = COMETCHAT_CONSTANTS.AUTH_KEY;
var ccpro_user_id = WP_API_CONSTANTS.CCPRO_USER_ID;
var wp_api_url = WP_API_CONSTANTS.WP_API_URL;
var wp_ccpro_prefix = WP_API_CONSTANTS.WP_PREFIX;
var wp_user_name = WP_API_CONSTANTS.WP_USER_NAME;

var appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();

CometChat.init(appID, appSetting).then(() => {
    
    //var listenerID = "superhero1";
    var UID = ccpro_user_id;
    var apiKey = AUTH_KEY;
    var name = wp_user_name;

    if( ccpro_user_id != '' ){
      const script1 = document.createElement("script");
      script1.src = "https://www.gstatic.com/firebasejs/7.21.0/firebase-app.js";
      script1.async = false;
      document.body.appendChild(script1);

      const script2 = document.createElement("script");
      script2.src = "https://www.gstatic.com/firebasejs/7.21.0/firebase-messaging.js";
      script2.async = false;
      document.body.appendChild(script2);

      const init_firebase = document.createElement("script");
      init_firebase.type = 'text/javascript';
      // s.async = true;
      // init_firebase.innerHTML = `
      init_firebase.innerHTML = `

      const FIREBASE_CONFIG = {
          apiKey: "AIzaSyDo1D3L0lhfTz7lV_Bl6EYUAY1nmiXYZFo",
          authDomain: "cometchat-de1d8.firebaseapp.com",
          databaseURL: "https://cometchat-de1d8.firebaseio.com",
          projectId: "cometchat-de1d8",
          storageBucket: "cometchat-de1d8.appspot.com",
          messagingSenderId: "278204562091",
          appId: "1:278204562091:web:aa9401d0b2e553b78895ee",
          measurementId: "G-BGC7S8JW2N"
      };
      // Initialize Firebase
      firebase.initializeApp(FIREBASE_CONFIG);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
        .register('./public/firebase-messaging-sw.js')
        .then(function(registration) {
          console.log("Registration successful, scope is:", registration.scope);
        })
        .catch(error => console.log('Registration error', error));
       }
       
      `;
      // document.body.appendChild(init_firebase);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/@cometchat-pro/chat@2.1.0/CometChat.js?time=" + new Date().getTime();
      script.async = false;
      document.body.appendChild(script);
{/* <script type="text/javascript" src=""></script> */}
      const external_script = document.createElement("script");
      external_script.src = "/wp-content/plugins/nb-chat-react/comechat/public/PushNotification.js?time=" + new Date().getTime();
      external_script.async = false;
      document.body.appendChild(external_script);
      CometChat.login(UID, apiKey).then(
        User => {
          console.log("Login Successful:", { User });
          console.log("Initialization completed successfully");
            ReactDOM.render(
              <CometChatUnified />
              
            , document.getElementById('ccpro_unified_window')
            
            );
          // User loged in successfully.
        },
        error => {

          var user = new CometChat.User(UID);

          user.setName(name);

          
          if( error.code == "ERR_UID_NOT_FOUND" ){
            console.log( error );
            
            CometChat.createUser(user, apiKey).then(
                user => {
                    console.log("user created", user);
                    CometChat.login(UID, apiKey);
                    console.log("Login Successful:", { user });
                    console.log("Initialization completed successfully");
                      ReactDOM.render(
                        <CometChatUnified />
                      , document.getElementById('ccpro_unified_window')
                      );
                },error => {
                    console.log("error", error);
                }
            )
            
          }
          console.log("Login failed with exception:", { error });
          // User login failed, check error and take appropriate action.
        }
      );
    }else{
      // ReactDOM.render(
      //   <CometChatNotLogin />
      // , document.getElementById('ccpro_unified_window')
      // );
    }

    
    if(CometChat.setSource) {
      CometChat.setSource("ui-kit", "web", "reactjs");
    }
    
  },
  error => {
    console.log("Initialization failed with error:", error);
    // Check the reason for error and take appropriate action.
  }
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//   .register('/wp-content/plugins/nb-chat-react/comechat/public/firebase-messaging-sw.js')
//   .then(function(registration) {
//     console.log("Registration successful, scope is:", registration.scope);
//   })
//   .catch(error => console.log('Registration error', error));
//  }

