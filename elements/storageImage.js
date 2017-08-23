const firebase = require("../client/firebase");
const each = require("../lib/each");
const storage = firebase.storage();
const html = require("bel");

module.exports = function storageImage(metadata, props = {}) {
  const img = html`<img src='https://placehold.it/100x100'>`;

  img.className = props.className;
  delete props.className;

  each(props, (val, key) => {
    img.setAttribute(key, val);
  });

  const ref = `gs://${metadata.bucket}/${metadata.name}`;
  storage.refFromURL(ref).getDownloadURL().then(url => {
    img.src = url;
  });

  return img;
};
