const { CronJob } = require("cron");
const scrape = require("./scrape");
const fs = require("fs");

const job = new CronJob("0 0 * * * *", scrape, null, false, "Europe/Copenhagen");

job.start();
