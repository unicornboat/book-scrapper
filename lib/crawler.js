const app = {};
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = app;

app.getCategories = async function (site) {
	return new Promise(async function (resolve) {
		let links = [];
		JSDOM.fromURL(site.protocol + site.domain + site.catrgory_uri).then(async dom => {
			let document = dom.window.document,
				category_links = document.querySelectorAll(site.category_selector);
			if (!category_links.length) throw new Error('No elements found by selector "' + site.category_selector + '"');

			if (site.category_first_item_selector && site.category_last_item_selector ) {
				// Sub categories are abbreviated in a range such as 1,2,3,4,5...99,100
			} else if (site.category_item_selector) {
				// All sub category items are specified and accessible
				for (let i = 0; i < category_links.length; i ++) {
					let sub_doc = await getDocument(site.protocol + site.domain + category_links[i].getAttribute('href')),
						sub_category_links = sub_doc.querySelectorAll(site.category_item_selector);
					for (let n = 0; n < sub_category_links.length; n ++) {
						if (sub_category_links[n].getAttribute('href').substr(0, 1) !== '/') {
							sub_category_links[n].setAttribute('href', '/' + sub_category_links[n].getAttribute('href'));
						}
						links.push({
							name: sub_category_links[i].textContent,
							site_id: site.id,
							uri: sub_category_links[n].getAttribute('href')
						});
					}
				}
			} else {
				// No sub categories
				for (let i = 0; i < category_links.length; i ++) {
					if (category_links[i].getAttribute('href').substr(0, 1) !== '/') {
						category_links[i].setAttribute('href', '/' + category_links[i].getAttribute('href'));
					}
					links.push({
						name: category_links[i].textContent,
						site_id: site.id,
						uri: category_links[i].getAttribute('href')
					});
				}
			}
			resolve(links);
		});
	});
};

function getDocument (url, encode) {
	return new Promise(function (resolve) {
		JSDOM.fromURL(url).then(dom => {
			resolve(dom.window.document);
		});
	});
}

function getHtml (url, encode) {
	let chunks = [],
		request = url.trim().substr(0, 5).toLowerCase() === 'https' ? https : http;
	return new Promise(function (resolve) {
		request.get(url, function (res) {
			res.on('data',  function (chunk) {chunks.push(chunk)});
			res.on('end', function () {
				resolve(iconv.decode(Buffer.concat(chunks), encode));
			});
		});
	});
}

function getAllBookLinks (domain, uri, selector) {
	let pages = [];
	http.get(domain + uri, function (res) {
		let chunks = [];
		res.on('data',  function (chunk) {chunks.push(chunk)});
		res.on('end', function () {
			let decoded = iconv.decode(Buffer.concat(chunks), 'gbk'),
				$ = cheerio.load(decoded);
			if ($(selector).length) {
				$(selector).each(async function (i, el) {
					console.log(domain + $(el).attr('href'));
					let promise = new Promise(function (resolve, reject) {
						http.get(domain + $(el).attr('href'), function (res) {
							let chunks = [];
							res.on('data',  function (chunk) {chunks.push(chunk)});
							res.on('end', function () {
								let decoded = iconv.decode(Buffer.concat(chunks), 'gbk'),
									$ = cheerio.load(decoded),
									$li = $('.pagination li:last-child');
								if ($li) {
									for (let n = 1; n <= parseInt($li.text()); n ++) {
										pages.push(domain + '/list/' + (i + 1) + '-' + n + '.html');
									}
									resolve();
								}
							});
						});
					});
					await promise;
				});
				console.log(pages);
			}
		});
	});
}