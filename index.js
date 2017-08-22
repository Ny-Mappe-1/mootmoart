const dev = process.env.NODE_ENV !== "production";

const firebase = require("./client/firebase");
const html = require("choo/html");
const map = require("lodash.map");
const log = require("choo-log");
const css = require("sheetify");
const choo = require("choo");

css("tachyons");
css`html, body { min-height: 100%; }`

const db = firebase.database().ref("data");
const storage = firebase.storage();

const app = choo();

if (dev) {
  app.use(require("choo-reload")());
}

app.use(log());
app.use(store());
app.route("/", mainView);
app.route("/dumps/:key", dumpView);
app.mount("body");

function mainView(state, emit) {
  if (!state.dumps_fetched) {
    db.child("dumps").once("value").then(snap => {
      state.dumps_fetched = true
      emit("dumps#update", snap.val());
    });
  }

  return html`
    <body class='ba bw4 b--yellow pa3 sans-serif'>
      ${map(
        state.dumps,
        (dump, key) => html`
          <a href='/dumps/${key}'>
            <img src='${dump.imageURL ||
              "https://placehold.it/100x1000"}' width='80'>
          </a>
        `
      )}
    </body>
  `;
}

function dumpView(state, emit) {
  const key = state.params.key

  if (!state.faces[key]) {
    db.child(`faces/${key}`).once("value", snap => {
      emit("faces#update", [key, snap.val()]);
    });
  }

  return html`
    <body class='ba bw4 b--yellow pa3 sans-serif'>
      ${map(state.faces[state.params.key], face => html`
        <li>${face.image.name}</li>
      `)}
    </body>
  `;
}

function store() {
  const initialState = {
    dumps: {},
    dumps_fetched: false,
    faces: {}
  };

  return function store(state = initialState, emitter) {
    Object.assign(state, initialState);

    emitter.on("dumps#update", dumps => {
      state.dumps = dumps;

      for (const key in dumps) {
        const dump = dumps[key];
        const ref = `gs://${dump.bucket}/${dump.name}`;

        storage.refFromURL(ref).getDownloadURL().then(url => {
          state.dumps[key].imageURL = url;
          emitter.emit("render");
        });
      }

      emitter.emit("render");
    });

    emitter.on("faces#update", ([key, faces]) => {
      state.faces[key] = faces;
      emitter.emit("render");
    });
  };
}

window.app = app;
