const dotenv = require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const sites = require(__dirname + process.env.SITES_DATA);

for (let key in sites) {
	let site = sites[key];
	site.categories.forEach(category => {
		fetch(site.domain + category.uri, category.selector);
	});
}

function fetch (url, selector) {
	axios.get(url, {
		headers: {
			'User-Agent': process.env.USER_AGENT
		}
	}).then(res => {
		const $ = cheerio.load(res.data);
		console.log('Found %s element(s)', $(selector).length);
		if ($(selector).length) {
			$(selector).each((i, el) => {
				console.log($(el).text());
			});
		}
	}).catch(e => {
		console.log(e);
	});
}