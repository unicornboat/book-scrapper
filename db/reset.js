const db = require('./db');
const pre_data = {
	bs_sites: {
		create: 'CREATE TABLE ?? (' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`name` varchar(255) NOT NULL, ' +
			'`domain` varchar(255) NOT NULL, ' +
			'`protocol` enum("http://","https://") NOT NULL DEFAULT "http://", ' +
			'`port` int(5) unsigned DEFAULT NULL, ' +
			'`encode` varchar(10) NOT NULL DEFAULT "utf8", ' +
			'`catrgory_uri` varchar(255) NOT NULL DEFAULT "/", ' +
			'`category_selector` varchar(255) NOT NULL, ' +
			'`category_item_selector` varchar(255) DEFAULT NULL, ' +
			'`category_first_item_selector` varchar(255) DEFAULT NULL, ' +
			'`category_last_item_selector` varchar(255) DEFAULT NULL, ' +
			'PRIMARY KEY (`id`), ' +
			'KEY `name` (`name`,`domain`) ' +
			') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4;',
		rows: [
			{
				name: 'w3schools',
				domain: 'www.w3schools.com',
				protocol: 'https://',
				category_selector: '#mySidenav .w3-bar-item'
			},
			// {
			// 	name: '全本小说',
			// 	domain: 'www.ybdu.co',
			// 	category_selector: '.nav .navitem a'
			// }
		]
	},
	bs_categories: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`site_id` bigint(20) NOT NULL, ' +
			'`name` varchar(255) NOT NULL, ' +
			'`uri` varchar(255) NOT NULL, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	},
	// bs_category_pages: {
	// 	create: 'CREATE TABLE ?? ( ' +
	// 		'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
	// 		'PRIMARY KEY (`id`) ' +
	// 		') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	// }
};

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
			if (data.hasOwnProperty('rows')) {
				let inserted = await db.bulkInsert(table, data.rows).then();
				console.log('%s row' + (inserted > 1 ? 's' : '') + ' inserted', inserted);
			}
			count ++;
			if (count >= total) {
				console.log('Database has been reset');
				process.exit();
			}
		} catch(err) {
			// Stop by error
			console.log(err);
			process.exit();
		}
	}
})();