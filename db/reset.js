const crawler = require('../lib/crawler');
const db = require('./lib');
const pre_data = {
	bs_sites: {
		create: 'CREATE TABLE ?? (' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`name` varchar(255) NOT NULL, ' +
			'`domain` varchar(255) NOT NULL, ' +
			'`protocol` enum("http://","https://") NOT NULL DEFAULT "http://", ' +
			'`port` int(5) unsigned DEFAULT NULL, ' +
			'`encode` varchar(10) NOT NULL DEFAULT "utf8", ' +
			'`category_uri` varchar(255) NOT NULL DEFAULT "/", ' +
			'`category_selector` varchar(255) NOT NULL, ' +
			'`category_item_selector` varchar(255) DEFAULT NULL, ' +
			'`category_first_item_selector` varchar(255) DEFAULT NULL, ' +
			'`category_last_item_selector` varchar(255) DEFAULT NULL, ' +
			'`category_item_template` varchar(255) DEFAULT NULL, ' +
			'`book_title_selector` varchar(255) NOT NULL, ' +
			'`book_author_selector` varchar(255) NOT NULL, ' +
			'`book_category_selector` varchar(255) NOT NULL, ' +
			'`book_description_selector` varchar(255) NOT NULL, ' +
			'`book_chapters_selector` varchar(255) NOT NULL, ' +
			'`chapter_title_selector` varchar(255) NOT NULL, ' +
			'`chapter_content_selector` varchar(255) NOT NULL, ' +
			'`sanitiser_regex` varchar(1000) NOT NULL, ' +
			'PRIMARY KEY (`id`), ' +
			'KEY `name_protocol_domain` (`name`,`protocol`,`domain`) ' +
			') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4;',
		rows: [
			// {
			// 	name: 'w3schools',
			// 	domain: 'www.w3schools.com',
			// 	protocol: 'https://',
			// 	encode: 'utf8',
			// 	category_selector: '#mySidenav .w3-bar-item',
			// 	category_item_selector: null,
			// 	category_first_item_selector: null,
			// 	category_last_item_selector: null,
			// 	category_item_template: null,
			// 	book_title_selector: 'h1'
			// 	book_author_selector: '.info2 h3 a',
			// 	book_category_selector: '.breadcrumb li:nth-last-child(2) a',
			// 	book_description_selector: '.info2 > div',
			// },
			// {
			// 	name: '全本小说网',
			// 	domain: 'www.ybdu.co',
			// 	protocol: 'http://',
			// 	encode: 'gbk',
			// 	category_selector: 'ul.nav .navitem[nav^="cat_"] a',
			// 	category_item_selector: null,
			// 	category_first_item_selector: 'ul.pagination li:nth-child(3) a',
			// 	category_last_item_selector: 'ul.pagination li:last-child a',
			// 	category_item_template: '/list/%p-%c.html',
			// 	book_title_selector: '.info2 h1',
			// 	book_author_selector: '.info2 h3 a',
			// 	book_category_selector: '.breadcrumb li:nth-last-child(2) a',
			// 	book_description_selector: '.info2 > div',
			// 	book_chapters_selector: '.panel-body ul.list-charts a',
			// 	chapter_title_selector: '.panel-heading:first-child',
			// 	chapter_content_selector: '.panel-body.content-body.content-ext',
			// 	sanitiser_regex: '/(一本读|)+|(ＷｗんＷ．『yb→du→．co)+/gi',
			// }
		]
	},
	bs_categories: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`site_id` bigint(20) NOT NULL, ' +
			'`title` varchar(255) NOT NULL DEFAULT "", ' +
			'`url` varchar(255) NOT NULL, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	},
	bs_books: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`site_id` bigint(20) NOT NULL, ' +
			'`title` varchar(255) DEFAULT NULL, ' +
			'`url` varchar(255) NOT NULL, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	}
};

const sites = [
	{
		name: '全本小说网',
		domain: 'www.ybdu.co',
		protocol: 'http://',
		encode: 'gbk',
		categories: [
			{
				max: 371,
				prefix: '/list/1-',
				suffix: '.html',
				title: '玄幻魔法'
			},
			{
				max: 118,
				prefix: '/list/2-',
				suffix: '.html',
				title: '仙侠修真'
			},
			{
				max: 534,
				prefix: '/list/3-',
				suffix: '.html',
				title: '都市言情'
			},
			{
				max: 74,
				prefix: '/list/4-',
				suffix: '.html',
				title: '历史军事'
			},
			{
				max: 93,
				prefix: '/list/5-',
				suffix: '.html',
				title: '网游动漫'
			},
			{
				max: 124,
				prefix: '/list/6-',
				suffix: '.html',
				title: '科幻小说'
			},
			{
				max: 64,
				prefix: '/list/7-',
				suffix: '.html',
				title: '恐怖灵异'
			},
			{
				max: 595,
				prefix: '/list/8-',
				suffix: '.html',
				title: '女生综合'
			}
		],
		category_selector: 'ul.nav .navitem[nav^="cat_"] a',
		category_item_selector: null,
		category_first_item_selector: 'ul.pagination li:nth-child(3) a',
		category_last_item_selector: 'ul.pagination li:last-child a',
		category_item_template: '/list/%p-%c.html',
		book_title_selector: '.info2 h1',
		book_author_selector: '.info2 h3 a',
		book_category_selector: '.breadcrumb li:nth-last-child(2) a',
		book_description_selector: '.info2 > div',
		book_chapters_selector: '.panel-body ul.list-charts a',
		chapter_title_selector: '.panel-heading:first-child',
		chapter_content_selector: '.panel-body.content-body.content-ext',
		sanitiser_regex: '/(一本读|)+|(ＷｗんＷ．『yb→du→．co)+/gi',
	}
];

(async function () {
	let count = 0,
		total = Object.keys(pre_data).length;

	for (let table in pre_data) {
		try {
			let data = pre_data[table];

			// Create table
			await db.createTable(table, data.create);
			console.log('Table "%s" created', table);

			// Insert prepared rows
			if (data.hasOwnProperty('rows') && Array.isArray(data.rows) && data.rows.length) {
				let inserted = await db.bulkInsert(table, data.rows).then();
				console.log('%s row' + (inserted > 1 ? 's' : '') + ' inserted', inserted);
			}
			count ++;
			if (count >= total) {
				console.log('Database has been reset');
				// process.exit();
			}
		} catch(err) {
			// Stop by error
			console.log(err);
			process.exit();
		}
	}

	if (sites) {
		for (let i = 0; i < sites.length; i ++) {
			let site_data = Object.assign({}, sites[i]);
			delete site_data.categories;

			let site_id = await db.upsert('bs_sites', site_data),
				promises = [];
			sites[i].categories.forEach(cat => {
				for (let m = 1; m <= cat.max; m ++) {
					promises.push(new Promise(function (resolve, reject) {
						db.upsert('bs_categories', {
							site_id: site_id,
							title: cat.title,
							url: sites[i].protocol + sites[i].domain + cat.prefix + m + cat.suffix
						}).then(cat_id => {
							resolve(cat_id);
						}).catch(err => {
							reject(err.messae);
							process.exit();
						});
					}));
				}
			});
			Promise.all(promises)
				.then(results => {
					console.log(results);
					process.exit();
				})
				.catch(err => {
					console.error(err.message);
					process.exit();
				});
		}
	}
})();