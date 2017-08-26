const storageImage = require("../elements/storageImage");
const firebase = require("../client/firebase");
const db = firebase.database().ref("data");
const { map, reduce } = require("lodash");
const each = require("../lib/each");
const html = require("choo/html");

const placeholder = "https://placehold.it/200x200";

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

module.exports = function dumpView(state, emit) {
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
        ${map(state.faces[state.params.key], face => {
          const ref = `gs://${face.image.bucket}/${face.image.name}`;

          const imageUrl = state.imgUrls[ref];
          if (!imageUrl) {
            emit("imgUrl#get", ref);
          }

          return html`
            <div class='dib'>
              <img src=${imageUrl || placeholder} height=50 className='db'>
            </div>
          `;
        })}
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
};
