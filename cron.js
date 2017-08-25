const { CronJob } = require("cron");
const scrape = require("./scrape");
const fs = require("fs");

const jobs = [
  new CronJob("0 0 9 * * *", scrape, null, false, "Europe/Copenhagen"),
  new CronJob("0 0 21 * * *", scrape, null, false, "Europe/Copenhagen")
];

jobs.forEach(job => {
  job.start();
});
