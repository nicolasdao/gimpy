/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const fs = require('fs')
const rimraf = require('rimraf')
const readline = require('readline')
const ncp = require('ncp').ncp
ncp.limit = 16 // nbr of concurrent process allocated to copy your files

const askQuestion = (question) => {
	const rl = readline.createInterface({
		/*eslint-disable */
		input: process.stdin,
		output: process.stdout
		/*eslint-enable */
	})
	/*eslint-disable */
	return (new Promise((resolve, reject) => rl.question(question, resolve)))
	/*eslint-enable */
		.then(answer => {
			rl.close()
			return answer
		})
}

const createDir = (dir) => {
	if (!fileOrDirExists(dir)) {
		fs.mkdirSync(dir)
	}
}

const fileOrDirExists = dir => fs.existsSync(dir)

const listDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(p+'/'+f).isDirectory())

const copyFolderContent = (src, dest) => {
	/*eslint-disable */
	return new Promise((onSuccess, onFailure) => ncp(src, dest, { clobber: false }, onSuccess)) // clobber false means do not override existing files
	/*eslint-enable */
}

const deleteDir = dir => new Promise(onSuccess => rimraf(dir, () => onSuccess()))


module.exports = {
	askQuestion,
	copyFolderContent,
	createDir,
	fileOrDirExists,
	listDirectories,
	deleteDir
}