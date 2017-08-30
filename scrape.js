const dev = process.env.NODE_ENV !== "production";
if (dev) {
  require("dotenv").load();
}

const Pageres = require("pageres");
const db = require("./server/db");
const sharp = require("sharp");
const path = require("path");
const got = require("got");
const fs = require("fs");

const dumpFilenameTmpl = "<%= date %> <%= time %> <%= url %>";
const dest = path.join("/", "tmp");

const bucket = db.storage().bucket();
const dataRef = db.database().ref("data");

async function main() {
  console.log("scraping");
  const [filename] = await scrape("eb.dk");
  console.log(filename)

  const converted = await convert(filename);

  console.log("Uploading dump");
  const [file] = await bucket.upload(converted, {
    destination: `dumps/${path.basename(converted)}`
  });

  console.log("Adding dump row");
  const rowRef = await dataRef.child("dumps").push(file.metadata);
  console.log(`  * ${rowRef.key}`);

  console.log("Detecting faces");
  const detectedFaces = await detectFaces(converted);

  console.log("Extracting faces");
  const faceImages = await Promise.all(detectedFaces.map(extract(converted)));

  console.log("Uploading images");
  const results = await Promise.all(
    faceImages.map(uploadAndCreateFace(rowRef.key))
  );

  console.log("check");
};

function uploadAndCreateFace(dumpKey) {
  return face => {
    console.log(`  - Uploading ${face.filename}`);

    return bucket
      .upload(face.filename, {
        destination: `faces/${dumpKey}/${path.basename(face.filename)}`
      })
      .then(([file]) => {
        console.log(`  - Creating row ${file.name}`);
        const data = Object.assign({}, face, { image: file.metadata });
        return dataRef.child(`faces/${dumpKey}`).push(data);
      });
  };
}

function extract(origFilename) {
  return face => {
    const filename = origFilename.replace(/\.jpg$/, `__${face.faceId}.jpg`);

    return sharp(origFilename)
      .extract(face.faceRectangle)
      .toFile(filename)
      .then(() => Object.assign({}, face, { filename }));
  };
}

function scrape(url) {
  return new Pageres({ delay: 2, filename: dumpFilenameTmpl })
    .src(url, ["940x1024"])
    .dest(dest)
    .run()
    .then(results => {
      return results.map(res => `${dest}/${res.filename}`);
    });
}

function convert(filename) {
  const newFilename = filename.replace(/\.png$/, ".jpg");

  return sharp(filename)
    .jpeg({ quality: 60 })
    .toFile(newFilename)
    .then(data => {
      return newFilename;
    });
}

function detectFaces(filename) {
  const read = fs.createReadStream(filename);

  const base = "https://westeurope.api.cognitive.microsoft.com/face/v1.0";

  return got
    .post(
      base +
        "/detect?returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
      {
        body: read,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": process.env.AZURE_TOKEN
        }
      }
    )
    .then(res => {
      return JSON.parse(res.body);
    });
}

if (require.main === module) {
  main().then(() => { console.log('done') })
} else {
  module.exports = main
}
