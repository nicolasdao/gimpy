#!/usr/bin/env node
/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
'use strict'

const program = require('commander')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const { loadProjectType } = require('./src/questions')
const { createApp } = require('./src/projectInit')
const { deploy } = require('./src/deploy')
const { logs } = require('./src/logs')
const { list } = require('./src/search')
const { clearCache } = require('./src/cache')

program
	.version('1.0.0')
	.command('new <projectType> [dest]')
	.usage('Creates a new project for my master.')
	.option('-v, --verbose', 'Provides detailed data of the creation process.')
	.action((projectType, dest, options) => loadProjectType({ projectType, dest }, options.verbose).then(answers => createApp(answers, options.verbose)))

program
	.command('list')
	.usage('List all templates hosted on github')
	.option('-c, --cache', 'List cached gimpy templates.')
	.action(options => list(null, options.cache))
program
	.command('ls')
	.usage('List all templates hosted on github')
	.option('-c, --cache', 'List cached gimpy templates.')
	.action(options => list(null, options.cache))

program
	.command('cache')
	.usage('List or clear the cached gimpy templates.')
	.option('-c, --clear', 'List cached gimpy templates.')
	.action(options => !options || !options.clear ? list(null, true) : clearCache())

program
	.command('deploy [env]')
	.usage('Deploys a Google Cloud Functions projects locally or to a Google Cloud Account.')
	.action(env => deploy(env))

program
	.command('logs [limit]')
	.usage('Access local logs.')
	.action(limit => logs(limit))

/*eslint-disable */
program.parse(process.argv) 
/*eslint-enable */
