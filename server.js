const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");
const firebase = require("./firebase.server");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

if (dev) {
  require("dotenv").load();
}

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json());
  server.use((req, res, next) => {
    req.firebaseServer = firebase;
    next();
  });

  server.get("/dumps/:key", (req, res) => {
    return app.render(req, res, "/dump", req.params);
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Ready on port :${port}`);
  });
});
