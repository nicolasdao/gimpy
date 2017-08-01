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
const  { askQuestion } = require('./utilities')

const askProjectQuestionsToGetAnswers = (answers = {}) => askQuestion(`project type:
  [1] Basic HTTP
  [2] GraphQL
Choose one of the above: ([1]) `.cyan)
	.then(answer => {
		if (!answer || answer == '')
			answer = 1

		const a = _.toNumber(answer)
		if (a != 1 && a != 2) {
			console.log(`'${a}' is not a valid project type.`.red)
			askProjectQuestionsToGetAnswers(answers)
		} else {
			let templatePath = null
			let preQuestions = null
			let questions = null
			let template = null
			switch (a) {
			case 1:
				/*eslint-disable */
				templatePath = path.join(__dirname, '../' ,'templates/simpleWebApp/templates')
				/*eslint-enable */
				template = require('../templates/simpleWebApp/questions')
				preQuestions = template.preQuestions
				questions = template.questions
				break
			case 2:
				/*eslint-disable */
				templatePath = path.join(__dirname, '../' ,'templates/graphql/templates')
				/*eslint-enable */
				template = require('../templates/graphql/questions')
				preQuestions = template.preQuestions
				questions = template.questions
				break
			}

			const newAnswer =  Object.assign(answers, { _templatePath: templatePath })

			return (preQuestions ? preQuestions() : Promise.resolve(1))
			.then(() => !questions 
				? Promise.resolve(newAnswer)
				: questions.reduce((a, q) => a.then(answers => runQuestion(q, answers)), Promise.resolve(newAnswer)))
		}
	})

const runQuestion = ({ question, answerName, defaultValue, execute = {}, files }, answers) => askQuestion(question(answers))
.then(a => a || (defaultValue ? defaultValue(answers) : ''))
.then(a => { console.log(a); return a })
.then(a => execute.validate
	? execute.validate(a) 
		? execute.onSuccess ? execute.onSuccess(a) : a
		: execute.onError 
			? throwErrorAndReRunQuestion({ question, answerName, defaultValue, execute, files }, answers, execute.onError(a))
			: throwErrorAndReRunQuestion({ question, answerName, defaultValue, execute, files }, answers, `Ouch!!! Your answer is not valid Master!`)
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
	askProjectQuestionsToGetAnswers
}



