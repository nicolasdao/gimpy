/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */

const updateAppConfigActive = (appconfig, env = 'default') => {
	if (appconfig && appconfig.env) {
		appconfig.env.active = env
		const fileContent = JSON.stringify(appconfig, null, '\t')
		/*eslint-disable */
		const appconfigPath = path.join(process.cwd(), 'appconfig.json')
		/*eslint-enable */
		fs.writeFileSync(appconfigPath, fileContent)
	}
}

const deploy = (env = 'default') => {
	const startClock = Date.now()

	/*eslint-disable */
	const appconfigPath = path.join(process.cwd(), 'appconfig.json')
	/*eslint-enable */

	if (!fs.existsSync(appconfigPath)) {
		console.log('Missing appconfig.json file.'.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}
	
	const appconfig =  require(appconfigPath)
	const environments = appconfig.env

	if (!environments) {
		console.log(`${'appconfig.json'.italic.bold} is missing the ${'env'.italic.bold} property.`.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}

	const config = environments[env]

	if (!config) {
		console.log(`${'appconfig.json'.italic.bold} does not define any ${env.italic.bold} property under its ${'env'.italic.bold} property.`.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}

	if (!config.trigger) {
		console.log(`${'appconfig.json'.italic.bold} does not define any ${'trigger'.italic.bold} property under its ${env.italic.bold} environment.`.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}

	if (!config.entryPoint) {
		console.log(`${'appconfig.json'.italic.bold} does not define any ${'entryPoint'.italic.bold} property under its ${env.italic.bold} environment.`.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}

	if (env == 'default') { // Local environment. Make Sure the Google function emulator is running.
		const functionsNotInstalled = !shell.exec('which functions', {silent:true}).stdout
		if (functionsNotInstalled) {
			console.log(`${'Google Function Emulator'.italic} seems to not be installed on your machine.

You cannot run this project on your local machine. To install it globally, simply run the following: 
${'npm install -g @google-cloud/functions-emulator'.bold.italic}`.red)
			/*eslint-disable */
			process.exit(1)
			/*eslint-enable */
		}

		const functionStatus = shell.exec('functions status', {silent:true}).stdout
		const functionsStopped = functionStatus.indexOf('│ STOPPED') > 0

		if (functionsStopped) {
			console.log('No emulator running. Time to start one!'.cyan)
			shell.exec('functions start')
		}

		updateAppConfigActive(appconfig, 'default')

		console.log(`${'LOCALLY'.italic.bold} deploying entry-point ${config.entryPoint.italic.bold} using trigger type ${config.trigger.italic.bold}.`.cyan)
		shell.exec(`functions deploy ${config.entryPoint} ${config.trigger}`)
	}
	else {
		if (!config.functionName) {
			console.log(`${'appconfig.json'.italic.bold} does not define any ${'functionName'.italic.bold} property under its ${env.italic.bold} environment.`.red)
			/*eslint-disable */
			process.exit(1)
			/*eslint-enable */
		}

		if (!config.googleProject) {
			console.log(`${'appconfig.json'.italic.bold} does not define any ${'googleProject'.italic.bold} property under its ${env.italic.bold} environment.`.red)
			/*eslint-disable */
			process.exit(1)
			/*eslint-enable */
		}

		if (!config.bucket) {
			console.log(`${'appconfig.json'.italic.bold} does not define any ${'bucket'.italic.bold} property under its ${env.italic.bold} environment.`.red)
			/*eslint-disable */
			process.exit(1)
			/*eslint-enable */
		}

		updateAppConfigActive(appconfig, env)

		console.log(`Deploying entry-point ${config.entryPoint.italic.bold} to ${`GOOGLE CLOUD FUNCTION ${config.functionName}`.italic.bold} located in project ${config.googleProject.italic.bold} using trigger type ${config.trigger.italic.bold}`.cyan)
		shell.exec(`gcloud config set project ${config.googleProject}`)
		shell.exec(`gcloud beta functions deploy ${config.functionName} --stage-bucket ${config.bucket} ${config.trigger} --entry-point ${config.entryPoint}`)
	}

	console.log(`Deployment successful (${(Date.now() - startClock)/1000} sec.)`.green)
}

module.exports = {
	deploy
}



