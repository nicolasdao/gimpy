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
const fs = require('fs')

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
		console.log('Start searching locally'.magenta)

	const templateIsAbsolutePath = template && template.trim().match(/^\//) || template.trim().match(/^~/)
	const templateIsRelativePath = template && template.trim().match(/^\.\//) || template.trim().match(/^\.\.\//)
	if (templateIsAbsolutePath || templateIsRelativePath) {
		if (verbose)
			console.log(`Template '${template}' is a local path. Start searching for a template under that path.`.magenta)
		/*eslint-disable */
		const fullPath = templateIsRelativePath ? path.join(process.cwd(), template) : template
		/*eslint-enable */
		if (!fs.existsSync(fullPath)) {
			console.log(`Path ${fullPath} does not exist!`.red)
			/*eslint-disable */
			process.exit(1)
			/*eslint-enable */
		}
		else {
			const questionsJs = path.join(fullPath, 'questions.js')
			const templatesFolder = path.join(fullPath, 'templates')
			if (!fs.existsSync(questionsJs)) {
				console.log(`Could not find the ${'question.js'.italic} file under path '${fullPath}'`.red)
				/*eslint-disable */
				process.exit(1)
				/*eslint-enable */
			}
			if (!fs.existsSync(templatesFolder)) {
				console.log(`Could not find the ${'templates'.italic} folder under path '${fullPath}'`.red)
				/*eslint-disable */
				process.exit(1)
				/*eslint-enable */
			}
			if (verbose)
				console.log(`Template successfully found under '${fullPath}'`.magenta)
			return Promise.resolve([fullPath])
		}
	}
	else {
		if (verbose)
			console.log(`Template '${template}' is not a local path. Start searching the local cache.`.magenta)
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
}

module.exports = {
	list,
	search,
	searchLocally
}