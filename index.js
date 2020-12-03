const dotenv = require('dotenv').config();
const fetcher = require('./lib/fetcher');
const sites = require(__dirname + process.env.SITES_DATA);

for (let key in sites) {
	fetcher.sync(sites[key]);
}