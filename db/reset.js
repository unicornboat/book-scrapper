const db = require('./lib');
const dbFactory = {
	bs_sites: {
		create: 'CREATE TABLE ?? (' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`name` varchar(255) NOT NULL, ' +
			'`url` varchar(255) NOT NULL, ' +
			'`book_list` varchar(255) NOT NULL, ' +
			'`book_title` varchar(255) NOT NULL, ' +
			'`book_image` varchar(255) NOT NULL, ' +
			'`book_author` varchar(255) NOT NULL, ' +
			'`book_description` varchar(255) NOT NULL, ' +
			'`book_chapters` varchar(255) NOT NULL, ' +
			'PRIMARY KEY (`id`), ' +
			'KEY `name_url` (`name`,`url`) ' +
			') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4;',
	},
	bs_categories: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`site_id` bigint(20) NOT NULL, ' +
			'`name` varchar(255) NOT NULL DEFAULT "", ' +
			'`prefix` varchar(255) NOT NULL DEFAULT "", ' +
			'`suffix` varchar(255) NOT NULL DEFAULT "", ' +
			'`first` varchar(255) NOT NULL, ' +
			'`last` varchar(255) NOT NULL, ' +
			'`url` varchar(255) NOT NULL, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	},
	bs_books: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`site_id` bigint(20) NOT NULL, ' +
			'`category_id` bigint(20) NOT NULL, ' +
			'`title` varchar(255) NOT NULL DEFAULT "", ' +
			'`author` varchar(255) NOT NULL, ' +
			'`description` varchar(512) NOT NULL, ' +
			'`url` varchar(255) NOT NULL, ' +
			'`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
			'`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	},
	bs_chapters: {
		create: 'CREATE TABLE ?? ( ' +
			'`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, ' +
			'`book_id` bigint(20) NOT NULL, ' +
			'`title` varchar(255) NOT NULL DEFAULT "", ' +
			'`content` varchar(50000) NOT NULL DEFAULT "", ' +
			'`filter` varchar(255) NOT NULL DEFAULT "", ' +
			'`url` varchar(255) NOT NULL, ' +
			'`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
			'`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
			'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;'
	}
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
})();