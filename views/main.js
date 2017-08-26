const firebase = require("../client/firebase");
const { map } = require("lodash");
const db = firebase.database().ref("data");
const html = require("choo/html");

const placeholder = "https://placehold.it/200x200";

module.exports = function mainView(state, emit) {
  if (!state.dumps) {
    db.child("dumps").once("value").then(snap => {
      emit("dumps#update", snap.val());
    });
  }

  return Layout(html`
    <div class='flex flex-wrap items-start'>
      ${state.dumps &&
        map(state.dumps, (dump, key) => {
          const ref = `gs://${dump.bucket}/${dump.name}`;

          const imageUrl = state.imgUrls[ref];
          if (!imageUrl) {
            emit("imgUrl#get", ref);
          }

          return html`
            <a href='/dumps/${key}' class='db'>
              ${dump.timeCreated.split("T")[0]}<br>
              <img src=${imageUrl || placeholder} class='w4 dib'>
            </a>
          `;
        })}
    </div>
  `);
};

function Layout(contents) {
  return html`
    <body class='ba bw4 b--yellow pa3 sans-serif'>
      ${contents}
    </body>
  `;
}
