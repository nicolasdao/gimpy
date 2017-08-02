/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const replace = require('replace')
const path = require('path')
const u = require('./utilities')
const createDir = u.createDir
const copyFolderContent = u.copyFolderContent

const createApp = (answers, verbose) => {
	if (verbose) 
		console.log('All answers collected. Ready to create project.'.magenta)
	/*eslint-disable */
	const destination = answers._dest ? path.join(process.cwd(), answers._dest) : process.cwd()
	/*eslint-enable */
	createDir(destination)
	copyFolderContent(answers._templatePath, destination)
		.then(err => {
			if (err) return console.error(err)
			else {
				for (let key in answers) {
					const answer = answers[key]
					if (answer.type == 'answer' && (answer.files || []).length > 0) {
						const token = `{{${answer.token}}}`
						const tokenValue = answer.value 
						replace({
							regex: token,
							replacement: tokenValue,
							paths: answer.files.map(f => path.join(destination, f)),
							recursive: true,
							silent: true,
						})
					}
				}

				console.log(`New ${answers._projectType} project successfully created.`.green)
				/*eslint-disable */
				process.exit(1)
				/*eslint-enable */
			}
		}) 
}

module.exports = {
	createApp
}
