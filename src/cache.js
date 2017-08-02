/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const path = require('path')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const  { listDirectories, deleteDir } = require('./utilities')

const clearCache = () => {
	const cacheLocation = path.join(__dirname, '../templates')
	const cachedTemplates = listDirectories(cacheLocation)
	return Promise.all((cachedTemplates || []).map(d => deleteDir(path.join(__dirname, '../templates', d))))
	.then(values => {
		if (values.length == 0)
			console.log(`The cache was already empty Master.`.green)
		else
			console.log(`Cache successfully flushed. ${values.length} templates have been wipped out Master.`.green)
	})
}

module.exports = {
	clearCache
}