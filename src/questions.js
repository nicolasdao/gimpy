/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const shell = require('shelljs')
const path = require('path')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */
const  { askQuestion, deleteDir, fileOrDirExists } = require('./utilities')
const  { search, searchLocally } = require('./search')

const loadProjectType = ({ projectType, dest }, verbose) => (projectType ? searchLocally(projectType, verbose) : Promise.resolve([]))
	.then(localResults => (localResults || []).length == 1
		// Template has been found locally. Ready to start using it straight away.
		? startQuestions(localResults[0], projectType, dest, verbose)
		// Template not found locally. Search for it on github and load it locally.
		: search(projectType, verbose)
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
	const { preQuestions, questions, onTemplateLoaded } = require(`../templates/${questionDir}/questions`)
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
		.then(answers => {
			if (onTemplateLoaded) {
				const t = typeof(onTemplateLoaded)
				const onTemplateLoadedMessage = 
					t == 'function' ? onTemplateLoaded(answers) :
						t == 'string' ? onTemplateLoaded : null
				return Object.assign(answers, { _onTemplateLoadedMessage: onTemplateLoadedMessage })
			}
			else
				return Object.assign(answers, { _onTemplateLoadedMessage: null })
		})
}

const runQuestion = ({ skip, question, answerName, defaultValue, execute = {}, files }, answers, verbose) => {
	if (skip && typeof(skip) != 'function')
		throw new Error('The \'skip\' property of one of the template\'s question is not a function. Sorry Master!')
	if (question && typeof(question) != 'function')
		throw new Error('The \'question\' property of one of the template\'s question is not a function. Sorry Master!')
	if (defaultValue && typeof(defaultValue) != 'function')
		throw new Error('The \'defaultValue\' property of one of the template\'s question is not a function. Sorry Master!')
	if (execute.validate && typeof(execute.validate) != 'function')
		throw new Error('The \'execute.validate\' property of one of the template\'s question is not a function. Sorry Master!')
	if (execute.onError && typeof(execute.onError) != 'function')
		throw new Error('The \'execute.onError\' property of one of the template\'s question is not a function. Sorry Master!')
	if (execute.onSuccess && typeof(execute.onSuccess) != 'function')
		throw new Error('The \'execute.onSuccess\' property of one of the template\'s question is not a function. Sorry Master!')

	const quest = question(answers)
	if (verbose)
		console.log(`Asking question: '${quest}'`.magenta)
	return (skip && skip(answers) ? Promise.resolve(null) : askQuestion(quest))
		.then(a => a || (defaultValue ? defaultValue(answers) : ''))
		.then(a => execute.validate
			? execute.validate(a) 
				? execute.onSuccess ? execute.onSuccess(a) : a
				: execute.onError 
					? { _errorMessage: execute.onError(a) }
					: { _errorMessage: 'Ooch!!! Your answer is not valid Master!' }
			: execute.onSuccess ? execute.onSuccess(a) : a)
		.then(a => {
			if (a._errorMessage) 
				return throwErrorAndReRunQuestion({ skip, question, answerName, defaultValue, execute, files }, answers, a._errorMessage)
			else {
				let b = {}
				b[answerName] = a
				b[`_${answerName}`] = { type: 'answer', token: answerName, value: a, files: files }
				return Object.assign(answers, b)
			}
		})
}

const throwErrorAndReRunQuestion = (question, answers, error) => {
	console.log(error.red)
	return runQuestion(question, answers)
}

module.exports = {
	loadProjectType
}



