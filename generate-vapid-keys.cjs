const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public VAPID Key:', vapidKeys.publicKey);
console.log('Private VAPID Key:', vapidKeys.privateKey);

// IMPORTANT: Save these keys securely!
// The public key goes into your frontend's .env file (VITE_APP_VAPID_PUBLIC_KEY)
// The private key goes into your backend server that sends notifications.
