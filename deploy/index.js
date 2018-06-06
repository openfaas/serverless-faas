// Copyright (c) OpenFaaS Authors 2017. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

const {spawn} = require('child_process');
const _ = require('lodash');
const BbPromise = require('bluebird');
const promisify = require('../promisify-spawn');
const listeners = require('../spawn-listener');

class OpenFaasDeploy {
	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options || {};
		this.provider = this.serverless.getProvider('openfaas');
		this.commands = {
			deploy: {
				usage: 'Deploy OpenFaaS functions',
				lifecyleEvents: [
					'deploy'
				],
				options: {
          push: {
            usage: 'Push image to Docker repository',
          },
					function: {
						usage: 'Deploy a single OpenFaaS function',
						shortcut: 'f'
					}
				},
				commands: {
					function: {
						usage: 'Deploy a single function',
						lifecycleEvents: [
							'function'
						],
						shortcut: 'f'
					},
					list: {
						usage: 'List all OpenFaaS functions',
						lifecycleEvents: [
							'list'
						],
						shortcut: 'l'
					}
				}
			}
		};

		this.hooks = {
			'deploy:deploy': (() => {
        if (this.options.push) {
          BbPromise.bind(this).then(this.pushFunction).then(this.deployFunction);
        } else {
          BbPromise.bind(this).then(this.deployFunction);
        }
      }),
			'deploy:function:function': (() => {
        if (this.options.push) {
          BbPromise.bind(this).then(this.pushSingleFunction).then(this.deploySingleFunction);
        } else {
          BbPromise.bind(this).then(this.deploySingleFunction);
        }
      }),
			'deploy:list:list': () => BbPromise.bind(this).then(this.deployList)
		};
	}

	deployFunction() {
		return new BbPromise(resolve => {

			const faasCli = spawn('faas-cli', [
				'deploy',
				'-f', './serverless.yml'
			]);

			promisify(faasCli, this)
				.then(res => this.serverless.cli.log(`Function(s) deployed...`))
				.then(() => resolve())
				.catch(err => this.serverless.cli.log(err));

			listeners(faasCli);
		});
	}

	deploySingleFunction() {
		return new BbPromise(resolve => {
			const faasCli = spawn('faas-cli', [
				'deploy',
				'-f', './serverless.yml',
				'--filter', this.options.function
			]);

			promisify(faasCli)
				.then(res => this.serverless.cli.log(`Deployed ${this.options.function}`))
				.then(() => resolve())
				.catch(err => this.serverless.cli.log(err));

			listeners(faasCli);
		});
	}

	deployList() {
		return new BbPromise(resolve => {
			const faasCli = spawn('faas-cli', ['list', "-f", "./serverless.yml"]);

			promisify(faasCli)
				.then(() => resolve())
				.catch(err => this.serverless.cli.log(err));

			listeners(faasCli);
		});
	}

	pushFunction() {
		return new BbPromise(resolve => {
			const faasCli = spawn('faas-cli', [
				'push',
				'-f', './serverless.yml'
			]);

			promisify(faasCli, this)
				.then(res => this.serverless.cli.log(`Function(s) pushed...`))
				.then(() => resolve())
				.catch(err => this.serverless.cli.log(err));

			listeners(faasCli);
		});
	}

	pushSingleFunction() {
		return new BbPromise(resolve => {
			const faasCli = spawn('faas-cli', [
				'push',
				'-f', './serverless.yml',
				'--filter', this.options.function
			]);

			promisify(faasCli)
				.then(res => this.serverless.cli.log(`Pushed ${this.options.function}`))
				.then(() => resolve())
				.catch(err => this.serverless.cli.log(err));

			listeners(faasCli);
		});
	}
}

module.exports = OpenFaasDeploy;
