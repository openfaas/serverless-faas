'use strict';

const spawnListener = spawn => {
	spawn.stdout.on('data', data => console.log(data.toString('utf8')));
	spawn.stderr.on('data', data => console.log(data.toString('utf8')));
	spawn.on('close', data => console.log(`faas-cli exited with code: ${data}`));
};

module.exports = spawnListener;
