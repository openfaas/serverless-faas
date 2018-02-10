'use strict';

const BbPromise = require('bluebird');

const promisify = spawn => {
	return new BbPromise((resolve, reject) => {
		spawn.addListener('error', reject);
		spawn.addListener('exit', resolve);
	});
};

module.exports = promisify;
