const dotenv = require('dotenv').config();
const app = {};
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

module.exports = app;

/**
 * Create table
 * @param   {String}  table Table name
 * @param   {String}  sql   Query to create table
 * @param   {Boolean} drop  Determine to drop the table first. Default is TRUE
 * @returns {Promise}
 */
app.createTable = function (table, sql, drop = true) {
	return new Promise(function (resolve, reject) {
		connection.query('SELECT * FROM information_schema.tables WHERE table_name = ?', [table], function (err, rows) {
			if (err) {
				reject(err);
				return;
			}

			if (!drop && rows.length) {
				reject('Cannot create table "' + table + '" when it exists and drop table is set to false');
				return;
			}

			connection.query(drop ? 'DROP TABLE IF EXISTS ??' : 'SELECT 1', [table], function (err) {
				if (err) {
					reject(err);
					return;
				}

				connection.query(sql, [table], function (err) {
					if (err) {
						reject(err);
						return;
					}

					resolve();
				});
			});
		});
	});
};

app.find = function (table, conditions = {}) {
	return new Promise(function (resolve, reject) {
		let sql = mysql.format('SELECT * FROM ??', [table]);
		if (Object.keys(conditions).length) {
			sql += mysql.format(' WHERE ?', [conditions]);
		}
		connection.query(sql + ' LIMIT 1', function (err, rows) {
			if (err) {
				reject(err);
				return;
			}
			if (!rows.length) {
				 reject('No site found');
				 return;
			}
			resolve(rows[0]);
		});
	});
};

/**
 * Find multiple by conditions
 * @param   {String}  table
 * @param   {Object}  conditions
 * @returns {Promise}
 */
app.findAll = function (table, conditions = []) {
	return new Promise(function (resolve, reject) {
		let sql = mysql.format('SELECT * FROM ??', [table]);
		if (Object.keys(conditions).length) {
			sql += mysql.format(' WHERE ?', [conditions]);
		}
		connection.query(sql, function (err, rows) {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows);
		});
	});
};

app.upsert = function (table, data, conditions = {}) {
	let columns, payload = [], row = null;
	return new Promise(async function (resolve, reject) {
		if (typeof data === 'object' && data.constructor === Object) {
			columns = Object.keys(data);
			payload.push(Object.values(data));
		} else {
			reject('Data type should be Object. "' + typeof data + '" is given.');
			return;
		}

		if (Object.keys(conditions).length) {
			row = await app.find(table, conditions);
		}

		if (!row) {
			let sql = mysql.format('INSERT INTO ?? SET ?', [table, data]);
			connection.query('INSERT INTO ?? SET ?', function (err, rows) {
				if (err) {
					reject(err);
					return;
				}
				resolve(rows.affectedRows);
			});
		}
		resolve(sql);
	});
};

app.bulkInsert = function (table, data) {
	let columns, payload = [];
	return new Promise(function (resolve, reject) {
		if (Array.isArray(data)) {
			data.forEach(each => {
				columns = Object.keys(each);
				payload.push(Object.values(each));
			});
		} else if (typeof data === 'object' && data.constructor === Object) {
			columns = Object.keys(data);
			payload.push(Object.values(data));
		} else {
			reject('Data type should be Array or Object. "' + typeof data + '" is given.');
			return;
		}

		let sql = mysql.format('INSERT INTO ?? (??) VALUES ? ON DUPLICATE KEY UPDATE ', [table, columns, payload]);
		columns.forEach((column, i) => {
			sql += mysql.format(' ?? = VALUES (??)' + (i < columns.length - 1 ? ',' : '') + ' ', [column, column]);
		});
		connection.query(sql, function (err, rows) {
			if (err) {
				reject(err);
				return;
			}
			resolve(rows.affectedRows);
		});
	});
};


