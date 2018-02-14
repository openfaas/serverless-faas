'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const BbPromise = require('bluebird');
const got = require('got');
const promisify = require('../promisify-spawn');
const listeners = require('../spawn-listener');

class FaaSInit {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options || {};
        this.provider = this.serverless.getProvider('faas');
        this.commands = {
            init: {
                lifecycleEvents: [
                    'swarm',
                    'get-compose',
                    'open-faas'
                ],
                usage: 'Setup OpenFaaS function boilerplate'
            }
        };
        this.initSwarm = process.env.SLS_INIT_SWARM;

        if (this.initSwarm == "1" || this.initSwarm == "true") {
            this.hooks = {
                'init:swarm': () => BbPromise.bind(this).then(this.swarmInitFunction),
                'init:get-compose': () => BbPromise.bind(this).then(this.getCompose),
                'init:open-faas': () => BbPromise.bind(this).then(this.openFaaSFunction)
            };
        }
    }

    swarmInitFunction() {
        this.serverless.cli.log('Attempting to initialize Docker Swarm');

        return new BbPromise(resolve => {
            const swarmInit = spawn('docker', ['swarm', 'init']);

            promisify(swarmInit)
                .then(res => this.serverless.cli.log('Initialized Docker Swarm'))
                .then(() => resolve())
                .catch(err => this.serverless.cli.log(err));

            listeners(swarmInit);
        });
    }

    getCompose() {
        this.serverless.cli.log('Attempting to download OpenFaaS config...');

        return new BbPromise(resolve => {
            got('https://raw.githubusercontent.com/alexellis/faas/master/docker-compose.yml')
                .then(req => {
                    fs.writeFile('docker-compose.yml', req.body, err => {
                        err ?
                            BbPromise.reject(err) :
                            this.serverless.cli.log('docker-compose.yml downloaded');
                        resolve();
                    });
                })
                .catch(err => console.log(err));
        });
    }

    openFaaSFunction() {
        return new BbPromise(resolve => {
            const faasInit = spawn('docker', [
                'stack',
                'deploy', 'func',
                '-c', 'docker-compose.yml'
            ]);

            promisify(faasInit)
                .then(res => this.serverless.cli.log('Initialized OpenFaaS Framework'))
                .then(() => resolve())
                .catch(err => this.serverless.cli.log(err));

            listeners(faasInit);
        });
    }

}

module.exports = FaaSInit;