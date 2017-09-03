const admin = require("firebase-admin");

admin.initializeApp(
  {
    credential: admin.credential.cert(require("./certs/mootmoart-admin.json")),
    databaseURL: "https://mootmoart.firebaseio.com",
    storageBucket: "mootmoart.appspot.com"
  }
);

module.exports = admin;
