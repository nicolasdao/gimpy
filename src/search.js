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

const search = template => axios.get(`https://api.github.com/search/repositories?q=gimpy-template${template ? `-${template}`: ''}`)
	.then(results => ((results.data || {}).items || []).filter(i => i.name.indexOf('gimpy-template') == 0))
	.then(items => items.map(i => ({
		fullname: i.name,
		name: i.name.replace('gimpy-template-',''),
		clone_url: i.clone_url
	})))

const searchLocally = template => {
	/*eslint-disable */
	const allDirs = listDirectories(path.join(__dirname, '../templates'))
	/*eslint-enable */
	return Promise.resolve(template ? (allDirs || []).filter(d => d == template) : allDirs)
}

module.exports = {
	list,
	search,
	searchLocally
}