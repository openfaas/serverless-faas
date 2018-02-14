'use strict';

const {spawn} = require('child_process');
const _ = require('lodash');
const BbPromise = require('bluebird');
const promisify = require('../promisify-spawn');
const listeners = require('../spawn-listener');

class FaaSRemove {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options || {};
		this.provider = this.serverless.getProvider('faas');

		this.hooks = {
			'remove:remove': () => BbPromise.bind(this).then(this.removeFunction)
		};

//		This.serverless.cli.log('Configuring FaaS Remove plugin');
	}

	removeFunction() {
		return new BbPromise(resolve => {
			_.each(this.serverless.service.functions, (description, name) => {
				this.serverless.cli.log('Attempting to remove ' + name);

				const faasCli = spawn('faas-cli', ['remove', name]);

				promisify(faasCli)
					.then(res => this.serverless.cli.log(`Function ${name} has been remove.`))
					.then(() => resolve())
					.catch(err => this.serverless.cli.log(err));

				listeners(faasCli);
			});
		});
	}
}

module.exports = FaaSRemove;
