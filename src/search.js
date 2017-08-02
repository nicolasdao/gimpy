/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const axios = require('axios')
const _ = require('lodash')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const { listDirectories } = require('./utilities')
const path = require('path')

const list = (template, cache = false) => (cache ? searchLocally(template) : search(template).then(items => items.map(i => i.name)))
	.then(names => _.toArray(_(names).sortBy(n => n)).map(n => console.log(n.cyan)))

const search = (template, verbose) => {
	if (verbose)
		console.log('Start searching github'.magenta)

	return axios.get(`https://api.github.com/search/repositories?q=gimpy-template${template ? `-${template}`: ''}`)
		.then(results => ((results.data || {}).items || []).filter(i => i.name.indexOf('gimpy-template') == 0))
		.then(items => items.map(i => ({
			fullname: i.name,
			name: i.name.replace('gimpy-template-',''),
			clone_url: i.clone_url,
			author: {
				name: (i.owner || {}).login,
				github: (i.owner || {}).html_url
			}
		})))
		.then(data => {
			if (verbose)
				console.log(data.length == 0 ? 'No templates found in github'.magenta : `${data.length} templates found in github`.magenta)
			return data
		})
}

const searchLocally = (template, verbose) => {
	if (verbose)
		console.log('Start searching the local cache'.magenta)
	/*eslint-disable */
	const allDirs = listDirectories(path.join(__dirname, '../templates'))
	/*eslint-enable */
	return Promise.resolve(template ? (allDirs || []).filter(d => d == template) : allDirs)
		.then(dirs => {
			if (verbose)
				console.log(dirs.length == 0 ? 'No templates found in the cache'.magenta : `${dirs.length} templates found in the cache`.magenta)
			return dirs
		})
}

module.exports = {
	list,
	search,
	searchLocally
}