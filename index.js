const dev = process.env.NODE_ENV !== "production";

const firebase = require("./client/firebase");
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
app.route("/", require("./views/main"));
app.route("/dumps/:key", require("./views/dump"));
app.mount("body");

function store() {
  const initialState = {
    dumps: null,
    faces: {},
    imgUrls: {}
  };

  return function store(state = initialState, emitter) {
    Object.assign(state, initialState);

    emitter.on("dumps#update", dumps => {
      state.dumps = dumps;
      emitter.emit("render");
    });

    emitter.on("faces#update", ([key, faces]) => {
      state.faces[key] = faces;
      emitter.emit("render");
    });

    emitter.on("imgUrl#add", ([ref, url]) => {
      state.imgUrls[key] = url;
      emitter.emit("render");
    });

    emitter.on("imgUrl#get", ref => {
      storage.refFromURL(ref).getDownloadURL().then(url => {
        state.imgUrls[ref] = url;
        emitter.emit("render");
      });
    });
  };
}

window.app = app;
