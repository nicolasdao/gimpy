/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash')
const shell = require('shelljs')
const path = require('path')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const  { askQuestion, deleteDir } = require('./utilities')
const  { search, searchLocally } = require('./search')

const loadProjectType = ({ projectType, dest }) => (projectType ? searchLocally(projectType) : Promise.resolve([]))
	.then(localResults => (localResults || []).length == 1
		// Template has been found locally. Ready to start using it straight away.
		? startQuestions(localResults[0], projectType, dest)
		// Template not found locally. Search for it on github and load it locally.
		: search(projectType)
			.then(projectTemplates => {
				const l = projectTemplates.length
				if (l == 0) {
					console.log(`Cannot find any gimpy template that matches '${projectType}'. Run ${'\'gimp list\''.italic.bold} to list all available templates.`.red)
					/*eslint-disable */
					process.exit(1)
					/*eslint-enable */
				}
				if (l > 1) 
					return loadOneOfTheProjectTypes(projectTemplates, dest)
				else
					return projectTemplates[0]
			})
			.then(projectTemplate => {
				/*eslint-disable */
				const templateLocation = path.join(__dirname, `../templates`, projectTemplate.name)
				/*eslint-enable */
				return deleteDir(templateLocation)
					.then(() => shell.exec(`git clone ${projectTemplate.clone_url} ${templateLocation}`))
					.then(
						() => startQuestions(projectTemplate.name, projectTemplate.name, dest),
						() => {
							console.log('Ooooooochh Masteeeer!!! Your git clone failed.'.red)
							/*eslint-disable */
							process.exit(1)
							/*eslint-enable */
						})
			}))

const loadOneOfTheProjectTypes = (projectTemplates, dest, noIntro = false) => askQuestion((
	(!noIntro ? 'I\'ve found multiple projects that match your search Master: \n' : '') +
	projectTemplates.map((p, idx) => `  [${idx+1}] ${p.name} `).join('\n') + '\n' +
	'Choose one of the above: ([1]) ').cyan)
	.then(answer => {
		answer = (answer || 1) * 1
		const projectTemplate = projectTemplates[answer - 1]
		if (!projectTemplate) {
			console.log(`I've been a bad bad slave Master! I don't understand your answer ${answer}. Try hitting me harder!!!`.red)
			return loadOneOfTheProjectTypes(projectTemplates, dest, true)
		}
		else 
			return projectTemplate
	})

const startQuestions = (questionDir, projectType, dest) => {
	/*eslint-disable */
	const templatePath = path.join(__dirname, '../templates', questionDir, 'templates')
	/*eslint-enable */
	const { preQuestions, questions } = require(`../templates/${questionDir}/questions`)
	const answers =  { _templatePath: templatePath, _projectType: projectType, _dest: dest }
	return (preQuestions ? preQuestions() : Promise.resolve(1))
		.then(() => !questions 
			? Promise.resolve(answers)
			: questions.reduce((a, q) => a.then(answers => runQuestion(q, answers)), Promise.resolve(answers)))
}

const runQuestion = ({ question, answerName, defaultValue, execute = {}, files }, answers) => askQuestion(question(answers))
	.then(a => a || (defaultValue ? defaultValue(answers) : ''))
	.then(a => execute.validate
		? execute.validate(a) 
			? execute.onSuccess ? execute.onSuccess(a) : a
			: execute.onError 
				? throwErrorAndReRunQuestion({ question, answerName, defaultValue, execute, files }, answers, execute.onError(a))
				: throwErrorAndReRunQuestion({ question, answerName, defaultValue, execute, files }, answers, 'Ouch!!! Your answer is not valid Master!')
		: execute.onSuccess ? execute.onSuccess(a) : a)
	.then(a => {
		let b = {}
		b[answerName] = a
		b[`_${answerName}`] = { type: 'answer', token: answerName, value: a, files: files }
		return Object.assign(answers, b)
	})

const throwErrorAndReRunQuestion = (question, answers, error) => {
	console.log(error.red)
	return runQuestion(question, answers)
}

module.exports = {
	loadProjectType
}



