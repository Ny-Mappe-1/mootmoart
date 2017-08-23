const dev = process.env.NODE_ENV !== "production";

const storageImage = require("./elements/storageImage");
const firebase = require("./client/firebase");
const reduce = require("lodash.reduce");
const each = require("./lib/each");
const html = require("choo/html");
const map = require("lodash.map");
const log = require("choo-log");
const css = require("sheetify");
const choo = require("choo");

css("tachyons");
css`html { height: 100%; } body { min-height: 100%; }`;

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
  if (!state.dumps) {
    db.child("dumps").once("value").then(snap => {
      emit("dumps#update", snap.val());
    });
  }

  return html`
    <body class='ba bw4 b--yellow pa3 sans-serif flex items-start'>
      ${state.dumps &&
        map(
          state.dumps,
          (dump, key) => html`
          <a href='/dumps/${key}' class='db'>
            ${dump.timeCreated.split('T')[0]}<br>
            ${storageImage(dump, { width: 100, className: 'dib' })}
          </a>
        `
        )}
    </body>
  `;
}

const emojies = {
  anger: "😡",
  contempt: "😒",
  disgust: "🤢",
  fear: "😱",
  happiness: "😄",
  neutral: "😐",
  sadness: "😭",
  surprise: "😳"
};

function dumpView(state, emit) {
  const key = state.params.key;
  const faces = state.faces[key];

  if (!faces) {
    db.child(`faces/${key}`).once("value", snap => {
      emit("faces#update", [key, snap.val()]);
    });
  }

  let emotions;
  if (faces) {
    emotions = reduce(
      faces,
      (stats, face, key) => {
        each(stats, (values, emotion) => {
          values.push(face.faceAttributes.emotion[emotion]);
        });

        return stats;
      },
      {
        anger: [],
        contempt: [],
        disgust: [],
        fear: [],
        happiness: [],
        neutral: [],
        sadness: [],
        surprise: []
      }
    );
    emotions = reduce(
      emotions,
      (obj, values, key) => {
        obj[key] = reduce(values, (sum, val) => sum + val, 0) / values.length;
        return obj;
      },
      {}
    );
  }

  return html`
    <body class='ba bw4 b--yellow pa3 sans-serif'>
      <header class="mb2">
        <a href='/' class='dib link bg-yellow ph3 pv2 br2'>${"<"}</a>
      </header>
      <div class='mb2'>
        ${map(
          state.faces[state.params.key],
          face => html`
              <div class='dib'>${storageImage(face.image, {
                height: 50,
                className: "db"
              })}</div>
          `
        )}
      </div>
      <div>
        ${map(
          emotions,
          (avg, emotion) => html`
          <div class='f3 flex items-center'>
            <div class='mr2'>${emojies[emotion]}</div>
            <div class='dib bg-yellow w1 h1 br1' style='width: ${parseInt(
              avg * 200,
              10
            )}px'></div>
          </div>
        `
        )}
      </div>
    </body>
  `;
}

function store() {
  const initialState = {
    dumps: null,
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
