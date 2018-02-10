'use strict';

const {spawn} = require('child_process');
const _ = require('lodash');
const BbPromise = require('bluebird');
const promisify = require('../promisify-spawn');
const listeners = require('../spawn-listener');

class FaaSPackage {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options || {};
		this.provider = this.serverless.getProvider('faas');
//		This.commands = {
//			package: {
//				lifecycleEvents: [
//					'package'
//				],
//				usage: 'Bundle function for deployment on OpenFaaS'
//			}
//		};

		this.hooks = {
			'after:package:createDeploymentArtifacts': () => BbPromise.bind(this).then(this.packageFunction)
		};
	}

	packageFunction() {
		this.serverless.cli.log('Attempting to package');

		return new BbPromise(resolve => {
			_.each(this.serverless.service.functions, (description, name) => {
				this.serverless.cli.log('Attempting to package ' + name);

				const faasCli = spawn('faas-cli', ['build', '-f', './serverless.yml']);

				promisify(faasCli)
					.then(res => this.serverless.cli.log(`Function ${name} has been packaged`))
					.then(() => resolve())
					.catch(err => this.serverless.cli.log(err));

				listeners(faasCli);
			});
		});
	}
}

module.exports = FaaSPackage;
