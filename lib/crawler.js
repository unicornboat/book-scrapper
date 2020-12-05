const app = {};
const db = require('../db/lib');
const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = app;

app.getCategories = async function (site) {
	return new Promise(async function (resolve) {
		let books = [], links = [];
		JSDOM.fromURL(site.protocol + site.domain + site.category_uri).then(async dom => {
			let document = dom.window.document,
				category_elements = document.querySelectorAll(site.category_selector);
			if (!category_elements.length) throw new Error('No elements found by selector "' + site.category_selector + '"');

			category_elements.forEach(el => {
				if (!/^http[s]{0,1}:\/\//gi.test(el.href)) el.href = site.protocol + site.domain + el.href;
				links.push(el.href);
			});
			getDocuments(links).then(function (documents) {
				getBookLinks(documents, site).then(links => {

				});
				if (site.category_first_item_selector && site.category_last_item_selector && site.category_item_template) {
					// Sub categories are abbreviated in a range such as 1,2,3,4,5...99,100

				} else if (site.category_item_selector) {
					// All sub category items are specified and accessible

				} else {
					// No sub categories
					console.log(documents.length);


				}
			});
			return;

			for (let i = 0; i < category_links.length; i ++) {
				let category_link = category_links[i],
					sub_doc = await getDocument(site.protocol + site.domain + category_link.getAttribute('href'));
				if (site.category_first_item_selector && site.category_last_item_selector && site.category_item_template) {
					let first_el = sub_doc.querySelector(site.category_first_item_selector),
						last_el = sub_doc.querySelector(site.category_last_item_selector);
					for (let m = parseInt(first_el.textContent); m <= parseInt(last_el.textContent); m ++) {
						links.push({
							name: null,
							site_id: site.id,
							uri: site.category_item_template.replace(/%p/g, i + 1).replace(/%c/g, m)
						});
					}
				} else if (site.category_item_selector) {
					let sub_category_links = sub_doc.querySelectorAll(site.category_item_selector);
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
				} else {
					if (category_link.getAttribute('href').substr(0, 1) !== '/') {
						category_link.setAttribute('href', '/' + category_link.getAttribute('href'));
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

function getBookLinks (documents, site) {
	let book_links = [];
	return new Promise(function (resolve) {
		if (site.category_first_item_selector && site.category_last_item_selector && site.category_item_template) {

		} else if (site.category_item_selector) {

		} else {
			documents.forEach(function (doc) {
				book_links.push({
					site_id: site.id,
					title: doc.querySelector(site.book_title_selector).textContent,
					url: doc.location.href,
				});
			});
			saveCategories().then();
		}
	});
}

function getDocument (url, encode) {
	return new Promise(function (resolve) {
		JSDOM.fromURL(url).then(dom => {
			resolve(dom.window.document);
		});
	});
}

function getDocuments (links, protocol = '', domain = '') {
	return new Promise(function (resolve) {
		let promises = [];
		links.forEach(function (link) {
			promises.push(getDocument(protocol + domain + link));
		});
		Promise.all(promises).then(resolves => {
			resolve(resolves);
		});
	});
}

function saveCategories () {
	return new Promise(function (resolve, reject) {

	});
}