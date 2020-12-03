const app = {};
const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

app.sync = site => {
	getAllBookLinks(site.domain, site.mainPage, site.categorySelector);
};

module.exports = app;

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