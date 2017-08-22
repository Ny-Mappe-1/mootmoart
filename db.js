const firebase = require("firebase-admin");
const serviceAccount = require("./certs/mootmoart-admin");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://mootmoart.firebaseio.com",
  storageBucket: "mootmoart.appspot.com"
});

module.exports = firebase
