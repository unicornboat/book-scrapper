const db = require('./db/lib');
const jsdomLib = require('jsdom');
const { JSDOM } = jsdomLib;
const siteConfig = require('./data/sites/bqg34.com/category.json');
let pages = [];
let bookLinks = [];

JSDOM.fromURL(siteConfig.url).then(mainDomObj => {
	let mainDocument = mainDomObj.window.document,
		title = mainDocument.querySelector(siteConfig.name).textContent,
		categoryRequests = [];
	console.log('Fetching: %s', title);
	for (let i = 0; i < siteConfig.categories.length; i ++) {
		let category = siteConfig.categories[i];
		categoryRequests.push(new Promise((resolve, reject) => {
			JSDOM.fromURL(category.url).then(categoryDomObj => {
				let categoryDocument = categoryDomObj.window.document,
					first = parseInt(categoryDocument.querySelector(category.first).textContent),
					last = parseInt(categoryDocument.querySelector(category.last).textContent),
					links = [];
				for (let c = first; c <= last; c ++) {
					links.push(category.prefix + c + category.suffix);
				}
				resolve(links);
			}).catch(err => {
				reject(err);
			});
		}));
	}

	Promise.all(categoryRequests).then(all => {
		pages = all.flat();
		console.log('Fetch %s category page(s)', pages.length);
		getBookLinks(pages, () => {
			console.log('Found %s book link(s)', bookLinks.length);
		});
	}).catch();
});

function getBookLinks (categoryUrl, callback) {
	if (!categoryUrl.length) {
		console.log('%s book links found', bookLinks.length);
		if (typeof callback === 'function') callback();
		return;
	}

	let url = categoryUrl.splice(0, 1); // Get the top url
	JSDOM.fromURL(url).then(bookListDomObj => {
		let bookListDocument = bookListDomObj.window.document, id,
			list = bookListDocument.querySelectorAll(siteConfig.bookList);
		for (let b = 0; b < list.length; b ++) {
			if (
				list[b].getAttribute('href')
				&& bookLinks.indexOf(list[b].getAttribute('href')) === -1
			) {
				console.log('《%s》: %s', list[b].textContent, list[b].getAttribute('href'));
				bookLinks.push(list[b].getAttribute('href'));
			}
		}
		id = setTimeout(() => {
			getBookLinks(categoryUrl);
			clearTimeout(id);
		}, getRandomInt());
	});
}

function getRandomInt (min = 100, max = 1000) {
	return Math.floor(Math.random() * (max - min) + min);
}