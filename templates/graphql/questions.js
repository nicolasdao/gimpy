const shell = require('shelljs')
/*eslint-disable */
const colors = require('colors')
/*eslint-enable */

const sanitizeDest = dest => dest ? dest.split(' ').map(x => x.trim().toLowerCase()).join('') : null
const sanitizeProjectName = name => name ? name.split(' ').join('-') : null
const sanitizeEntryPoint = name => name ? name.split(' ').join('') : null
const sanitizeFunctionName = name => name ? name.trim().split(' ').map(x => x.toLowerCase()).join('-') : null
const sanitizeBucket = name => name ? name.trim().split(' ').map(x => x.toLowerCase()).join('-') : null
const TRIGGERS = { '1': '--trigger-http', '2': '--trigger-topic', '3': '--trigger-bucket' }

const emulatorNotInstalledWarningQuestion = functionsNotInstalled => functionsNotInstalled 
	? askQuestion(`
${'WARNING'.bold.italic}: ${'Google Function Emulator'.italic} seems to not be installed on your machine.

You won't be able to run this project on your local machine. 
We recommend to install it globally: ${'npm install -g @google-cloud/functions-emulator'.bold.italic}

Do you want to ignore this warning? (y/n) `.yellow)
		.then(answer => {
			if (answer == 'n')
			/*eslint-disable */
                process.exit(1)
                /*eslint-enable */
		})
	: Promise.resolve('ok')

const gcloudNotInstalledWarningQuestion = gcloudNotInstalled => gcloudNotInstalled 
	? askQuestion(
		`${`
WARNING`.bold.italic}: The ${'gcloud SDK'.italic} seems to not be installed on your machine.

You won't be able to use your terminal to deploy this project to your Google Cloud Account. 
We recommend to install it (instructions here: ${'https://cloud.google.com/sdk/downloads'.underline.italic.blue}).

Do you want to ignore this warning? (y/n) `.yellow)
		.then(answer => {
			if (answer == 'n')
			/*eslint-disable */
                process.exit(1)
                /*eslint-enable */
		})
	: Promise.resolve('ok')

exports.preQuestions = () => {
	const gcloudNotInstalled = !shell.exec('which gcloud', {silent:true}).stdout
	return gcloudNotInstalledWarningQuestion(gcloudNotInstalled)
		.then(() => {
			const functionsNotInstalled = !shell.exec('which functions', {silent:true}).stdout
			return emulatorNotInstalledWarningQuestion(functionsNotInstalled)
		})
}

exports.questions = [{
	question: answers => `project name: ${answers.dest ? `(${sanitizeDest(answers.dest)}) ` : ''} `.cyan,
	answerName: 'projectName',
	defaultValue: answers => answers.dest,
	execute: {
		validate: null,
		onSuccess: answer => sanitizeProjectName(answer)
	},
	files: ['package.json']
},{
	question: answers => `project version: (1.0.0) `.cyan,
	answerName: 'projectVersion',
	defaultValue: answers => `1.0.0`,
	files: ['package.json']
},{
	question: answers => `Google Cloud Function name : (${sanitizeFunctionName(answers.projectName)}) `.cyan,
	answerName: 'functionName',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeFunctionName(answer)
	},
	files: ['webconfig.json']
},{
	question: answers => ('Google Cloud Function trigger: \n' + 
						 '  [1] HTTP \n' +
						 '  [2] Pub/Sub \n' +
						 '  [3] Storage \n' +
						 'Choose one of the above: ([1]) ').cyan,
	answerName: 'trigger',
	defaultValue: answers => 1,
	execute: {
		validate: answer => TRIGGERS[answer],
		onSuccess: answer => TRIGGERS[answer],
		onError: answer => `'${answer}' is not a valid trigger.`
	},
	files: ['webconfig.json']
},{
	question: answers => `Google Cloud Function entry-point (no spaces, no hyphens): (${sanitizeEntryPoint(answers.projectName)}) `.cyan,
	answerName: 'entryPoint',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeEntryPoint(answer)
	},
	files: ['index.js', 'webconfig.json']
},{
	question: answers => `Google Cloud Project: (${answers.projectName.toLowerCase()}) `.cyan,
	answerName: 'googleProject',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => answer.toLowerCase()
	},
	files: ['webconfig.json']
},{
	question: answers => `Google Cloud Function bucket: (${sanitizeBucket(answers.projectName)}) `.cyan,
	answerName: 'bucket',
	defaultValue: answers => answers.projectName,
	execute: {
		onSuccess: answer => sanitizeBucket(answer)
	},
	files: ['webconfig.json']
}]