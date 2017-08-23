const firebase = require("firebase/app");
require("firebase/database");
require("firebase/storage");

const config = {
  apiKey: "AIzaSyDEbHf1qtlD8AVG7VyfY1pth7uKIvVlTo4",
  authDomain: "mootmoart.firebaseapp.com",
  databaseURL: "https://mootmoart.firebaseio.com",
  projectId: "mootmoart",
  storageBucket: "mootmoart.appspot.com",
  messagingSenderId: "389015972874"
};

firebase.initializeApp(config);

module.exports = firebase;
