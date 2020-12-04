const app = {};
const crawler = require('./crawler');
const db = require('../db/db');

module.exports = app;

app.fetch = async function (id) {
	try {
		let site = await db.find('bs_sites', {id: id}),
			categories = await crawler.getCategories(site),
			affected = await db.bulkInsert('bs_categories', categories);
		console.log('%s categorie%s fetched', affected, affected > 1 ? 's' : '');
		process.exit();
	} catch (err) {
		console.log(err);
		process.exit();
	}
};

// app.fetchAll = async function () {
// 	let sites = await db.findAll('bs_sites');
// 	console.log(sites);
// };