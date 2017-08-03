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
const shell = require('shelljs')
const replace = require('replace')
const path = require('path')
const { createDir, copyFolderContent, askQuestion, deleteDir, fileOrDirExists } = require('./utilities')
const  { search, searchLocally } = require('./search')

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

const initNewTemplate = (dest, verbose) => searchLocally('gimpy', verbose)
	.then(localResults => (localResults || []).length == 1
		// Template has been found locally. Ready to start using it straight away.
		? startQuestions(localResults[0], 'gimpy', dest, verbose)
		// Template not found locally. Search for it on github and load it locally.
		: search('gimpy', verbose)
			.then(projectTemplates => {
				const l = projectTemplates.length
				if (l == 0) {
					console.log(`Cannot find any gimpy template that matches '${'gimpy'}'. Run ${'\'gimp list\''.italic.bold} to list all available templates.`.red)
					/*eslint-disable */
					process.exit(1)
					/*eslint-enable */
				}
				if (l > 1) {
					if (projectTemplates.filter(x => x.fullname == 'gimpy-template-gimpy').length == 1)
						return projectTemplates.filter(x => x.fullname == 'gimpy-template-gimpy')[0]
					else {
						console.log(`Ooooooochh ooch Master!!! The 'gimpy' template is nowhere to be found. Check ${'https://github.com/nicolasdao/gimpy-template-gimpy'.underline} to see if it still exists.`.red)
						/*eslint-disable */
						process.exit(1)
						/*eslint-enable */
					}
				}
				else
					return projectTemplates[0]
			})
			.then(projectTemplate => {
				if (verbose)
					console.log(`Template ${projectTemplate.name} has been found on GitHub. Preparing to clone that repo.`.magenta)
				/*eslint-disable */
				const templateLocation = path.join(__dirname, `../templates`, projectTemplate.name)
				/*eslint-enable */
				if (verbose)
					console.log(`Deleting previous directory ${templateLocation}.`.magenta)
				return deleteDir(templateLocation)
					.then(() => {
						if (verbose) {
							console.log(`Directory ${templateLocation} successfully deleted.`.magenta)
							console.log(`Ready to clone repo ${projectTemplate.clone_url}.`.magenta)
						}
					})
					.then(() => shell.exec(`git clone ${projectTemplate.clone_url} ${templateLocation}`))
					.then(
						() => {
							if (verbose)
								console.log('Git clone successful.'.magenta)
							return validateGimpyTemplate(projectTemplate.name, projectTemplate.author.name, projectTemplate.author.github, templateLocation, verbose)
						},
						() => {
							console.log('Ooooooochh Masteeeer!!! Your git clone failed.'.red)
							/*eslint-disable */
							process.exit(1)
							/*eslint-enable */
						})
					.then(() => startQuestions(projectTemplate.name, projectTemplate.name, dest, verbose))
			}))
	.then(answers => createApp(answers, verbose))

const validateGimpyTemplate = (templateName, authorName, authorGitHub, location, verbose) => {
	if (verbose)
		console.log(`Validating the ${templateName} gimpy template.`.magenta)
	if (!fileOrDirExists(path.join(location, 'templates')))
		console.log(`Ooooch, pardon me Master, but it seems the template ${templateName} is not valid. It is missing the 'templates' folder. Get in touch with the author (${authorName} - ${authorGitHub.underline})`.red)
	if (!fileOrDirExists(path.join(location, 'questions.js')))
		console.log(`Ooooch, pardon me Master, but it seems the template ${templateName} is not valid. It is missing the 'questions.js' file. Get in touch with the author (${authorName} - ${authorGitHub.underline})`.red)
	if (verbose)
		console.log(`${templateName} gimpy template is valid.`.magenta)
	return 0
}

const startQuestions = (questionDir, projectType, dest, verbose) => {
	if (verbose)
		console.log('The template has been successfully installed locally. Starting asking questions'.magenta)
	/*eslint-disable */
	const templatePath = path.join(__dirname, '../templates', questionDir, 'templates')
	/*eslint-enable */
	const { preQuestions, questions } = require(`../templates/${questionDir}/questions`)
	if (verbose) {
		if (preQuestions)
			console.log('A preQuestions function has been found in that template.'.magenta)	
		console.log(`${(questions || []).length} questions have been found in this template.`.magenta)
	}

	const answers =  { _templatePath: templatePath, _projectType: projectType, _dest: dest }
	return (preQuestions ? Promise.resolve(preQuestions()) : Promise.resolve(1))
		.then(() => !questions 
			? Promise.resolve(answers)
			: questions.reduce((a, q) => a.then(answers => runQuestion(q, answers, verbose)), Promise.resolve(answers)))
}

const runQuestion = ({ question, answerName, defaultValue, execute = {}, files }, answers, verbose) => {
	const quest = question(answers)
	if (verbose)
		console.log(`Asking question: '${quest}'`.magenta)
	return askQuestion(quest)
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
}

const throwErrorAndReRunQuestion = (question, answers, error) => {
	console.log(error.red)
	return runQuestion(question, answers)
}

module.exports = {
	createApp,
	initNewTemplate
}
