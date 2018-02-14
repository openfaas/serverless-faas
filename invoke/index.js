'use strict';

const { spawn } = require('child_process');
const BbPromise = require('bluebird');
const promisify = require('../promisify-spawn');
const listeners = require('../spawn-listener');

class FaaSInvoke {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('faas');
        this.command = {
            invoke: {
                lifecycleEvents: [
                    'invoke'
                ],
                options: {
                    data: {
                        shortcut: 'd'
                    }
                }
            }
        };

        this.hooks = {
            'invoke:invoke': () => BbPromise.bind(this).then(this.invokeFunction)
        };

        //		This.serverless.cli.log('Configuring FaaS Invoke plugin');
    }

    invokeFunction() {
        return new BbPromise(resolve => {
            this.serverless.cli.log('Attempting to invoke ' + this.options.function);
            const args = this.options.data || '';

            const echo = spawn('echo', [args]);
            const faasCli = spawn('faas-cli', ['invoke', this.options.function]);

            echo.stdout.pipe(faasCli.stdin);

            promisify(faasCli)
                .then(res => this.serverless.cli.log(`Function ${this.options.function} has been invoked`))
                .then(() => resolve())
                .catch(err => this.serverless.cli.log(err));

            listeners(faasCli);
        });
    }
}

module.exports = FaaSInvoke;