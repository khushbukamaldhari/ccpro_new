
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
  .register('/wp-content/plugins/nb-chat-react/comechat/public/firebase-messaging-sw.js')
  .then(function(registration) {
    console.log("Registration successful, scope is:", registration.scope);
  })
  .catch(error => console.log('Registration error', error));
}



const CCPRO_APP_ID = "241877f844c2f4d";
const CCPRO_REGION = "us";
const CCPRO_AUTH_KEY = "41db61f5d49de0347f52d5b63a45c8b9b3c95f11";
const UID = ccproWpData.ccpro_user_id;

console.log(UID);
const SUBSCRIBE_MANY_URL = `https://push-notification-${CCPRO_REGION}.cometchat.io/v1/subscribetomany?appToken=`;
const SUBSCRIBE_URL = `https://push-notification-${CCPRO_REGION}.cometchat.io/v1/subscribe?appToken=`;

const UNSUBSCRIBE_MANY_URL = `https://push-notification-${CCPRO_REGION}.cometchat.io/v1/unsubscribealltopic?appToken=`;
const UNSUBSCRIBE_URL = `https://push-notification-${CCPRO_REGION}.cometchat.io/v1/unsubscribe?appToken=`;

const APP_SETTING = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(CCPRO_REGION).build();
let APP_TOKEN = '';
let FCM_TOKEN = '';

let loginButton;
let logoutButton;

const loginAndSetup = async () => {
console.log('Login Button clicked');
try {
await CometChat.init(CCPRO_APP_ID, APP_SETTING);
await CometChat.login(UID, CCPRO_AUTH_KEY);
console.log('1. User login complete');

const settings = await CometChat.getAppSettings();
console.log('2. Fetch Settings', settings);
const extension = settings.extensions.filter(ext => ext.id == 'push-notification');
const pnExtension = extension[0];

if (pnExtension) {
console.log('3. Extension is enabled.');

APP_TOKEN = pnExtension.appToken;
//   const groups = await CometChat.getJoinedGroups();

console.log(APP_TOKEN);
//   console.log('4. Got user joined groups', groups);

// Fetch the FCM Token
const messaging = firebase.messaging();
FCM_TOKEN = messaging.getToken();
var userType = "user";
console.log('5. Received FCM Token', FCM_TOKEN);

var topic = CCPRO_APP_ID + "_" + userType + "_" + UID;

// Subscribe to many
console.log('6. Subscribing to many');
const response = await fetch(SUBSCRIBE_MANY_URL + APP_TOKEN, {
  method: 'POST',
  headers: new Headers({
    'Content-Type': 'application/json'
  }),
  body: JSON.stringify({
    appId: CCPRO_APP_ID,
    fcmToken: FCM_TOKEN,
    topic: topic,
  }) .then(response => {
    if (response.status < 200 || response.status >= 400) {
      console.log(
        "7. Error subscribing to topppic: " +
          response.status +
          " - " +
          response.text()
      );
    }else {
      console.log("7. Subscribed");
    }
    console.log('Subscribed to "' + topic + '"');
  }).catch(error => {
    console.error(error);
  })
});

// if (response.status < 200 || response.status >= 400) {
// console.log("7. Error subscribing to topics: " + response.status + " - " + JSON.stringify(response.text()));
// } else {
// console.log("7. Subscribed");
// const notification = new Notification("test", {
//   body: "testing",
//   icon: ''
// });
// notification.onclick = () => notification.close();
// }


// logoutButton.disabled = false;
// loginButton.disabled = true;
// Receiving notifications when the app is in foreground
// Optional
console.log(messaging);
let listenerID = "ccpro_onMessageReceived";
let groupListenerId = "chatlist_group_" + new Date().getTime();
CometChat.addMessageListener(
  listenerID,
  new CometChat.MessageListener( {
    
    onTextMessageReceived: textMessage => {
      console.log("Text message received successfully", textMessage);
      const notification = new Notification(textMessage.sender.name, {
        body: "New message: " + textMessage.text,
        icon: ''
      });
      notification.onclick = () => notification.close();
    },
    onMediaMessageReceived: mediaMessage => {
      console.log("Media message received successfully", mediaMessage);
      const notification = new Notification(mediaMessage.sender.name, {
        body: "New message: " + mediaMessage.text,
        icon: ''
      });
      notification.onclick = () => notification.close();
    },
    onCustomMessageReceived: customMessage => {
      console.log("Custom message received successfully", customMessage);
      const notification = new Notification(customMessage.sender.name, {
        body: "New message: " + customMessage.text,
        icon: ''
      });
      notification.onclick = () => notification.close();
    }
  })
);
CometChat.addCallListener(
  groupListenerId,
  new CometChat.CallListener({
      // onIncomingCallReceived: call => {
      //   console.log( call );
      //   const notification = new Notification(textMessage.sender.name, {
      //     body: textMessage.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onIncomingCallCancelled: call => {
      //   console.log( call );
      //   const notification = new Notification(textMessage.sender.name, {
      //     body: textMessage.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onOutgoingCallAccepted: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onOutgoingCallRejected: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onIncomingCallCancelled: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      onIncomingCallReceived: call => {
        console.log( call );
        const notification = new Notification(call.receiver.name, {
          body: " Incoming " + call.type + " Call from " + call.sender.name,
          icon: ''
        });
        notification.onclick = () => notification.close();
      },
      // onIncomingCallCancelled: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onOutgoingCallAccepted: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // },
      // onOutgoingCallRejected: call => {
      //   console.log( call );
      //   const notification = new Notification(call.sender.name, {
      //     body: call.text,
      //     icon: ''
      //   });
      //   notification.onclick = () => notification.close();
      // }
  })
);

messaging.onMessage(payload => {
console.info(`%c${payload.data.title} \n%c${payload.data.alert}`, 'font-size: 15px', 'font-size: 12px');
const notification = new Notification(payload.data.title, {
  body: payload.data.alert,
  icon: ''
});
notification.onclick = () => notification.close();
});
} else {
console.error('Please enable Push Notifications extension from Dashboard');
}
} catch (error) {
console.error(error);
}
}

const logout = async () => {
console.log('Logout button clicked');
try {
  console.log('8. Unsubscribing from all topics');
  const response = await fetch(UNSUBSCRIBE_MANY_URL + APP_TOKEN, {
    method: 'DELETE',
    headers: new Headers({
    'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ appId: CCPRO_APP_ID, fcmToken: FCM_TOKEN })
  });

  const json = await response.json();

  console.log('Unsub response:', json);

  if ('serviceWorker' in navigator) {
    // Unregister the service worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
    registration.unregister();
    }
    console.log('9. Service worker unregistered');
  }

  await CometChat.logout();
  console.log('10. Logged out');
  // loginButton.disabled = false;
  // logoutButton.disabled = true;
  // Just to register a new service worker.
  // Check the index.html page.
  window.location.reload();
} catch (error) {
console.error(error);
}
}

const init = () => {
loginButton = document.getElementById('loginButton');
logoutButton = document.getElementById('logoutButton');

// loginButton.addEventListener('click', loginAndSetup);
// logoutButton.addEventListener('click', logout);

// logoutButton.disabled = true;
}

window.onload = () => {
//   setTimeout(init, 300);
setTimeout( loginAndSetup, 1000 );
};