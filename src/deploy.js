/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const fs = require('fs')
const path = require('path')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */

const deploy = (env, option1, option2, option3, option4, option5) => {
	/*eslint-disable */
	const deployPath = path.join(process.cwd(), 'deploy.js')
	/*eslint-enable */

	if (!fs.existsSync(deployPath)) {
		console.log('Missing deploy.js file. Your project needs that file to deploy this project.'.red)
		/*eslint-disable */
		process.exit(1)
		/*eslint-enable */
	}

	const deployProject = require(deployPath).deploy
	deployProject()
}

module.exports = {
	deploy
}



