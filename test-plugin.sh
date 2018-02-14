#!/bin/bash

# link the plugin to be available for development
npm link

# clear out previous driver / test-run
rm -rf driver

mkdir -p driver/
cd driver

# Install Node.js driver/template
serverless install --url https://github.com/aafrey/openfaas-nodejs --name faas-func

cd ..

# link the plugin with the template
cd driver/faas-func
npm link serverless-faas
#node --inspect-brk=0.0.0.0:9229 /home/austin/.nvm/versions/node/v8.4.0/bin/sls package

# Run the workflow

serverless init

serverless package
serverless deploy

sleep 10

serverless invoke -f hello-serverless

serverless deploy function -f hello-serverless

sleep 10

serverless deploy list

serverless invoke -f hello-serverless

# Comment out to leave in place.
serverless remove
