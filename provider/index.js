'use strict';

const constants = {
	providerName: 'faas'
};

class FaaSProvider {
	constructor(serverless) {
		this.serverless = serverless;
		this.provider = this;
		this.serverless.setProvider(constants.providerName, this);
	}

	static getProviderName() {
		return constants.providerName;
	}

}

module.exports = FaaSProvider;
