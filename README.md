<a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_black_small_logo.png" alt="Neap Pty Ltd logo" title="Neap" align="right" height="50" width="120"/></a>

# Gimpy - Automate Your Chores. New Tortures Coming Regularly...
[![NPM][1]][2]

[1]: https://img.shields.io/npm/v/gimpy.svg?style=flat
[2]: https://www.npmjs.com/package/gimpy

## Intro
I'm your gimp! I loves doing your painful chores like your project initilization, your deployments, etc. The more painful it is, the more likely I'll be "satisfied" :collision: :japanese_ogre: :japanese_ogre: :collision: :smiling_imp: :smiling_imp:.

> Whether you're a Dom or a Sub, I've got you covered you little Devil :smiling_imp:

_**If you're a Dom**_, I'm easy to use and you'll dominate me in no time :smoking:. I'll let you mistreat me with all the chores you throw at me. I could for example set up a new fully functional GraphQL project that is ready to be deployed to Google Cloud Functions (i.e. the Google serverless solution):

```
gimp new graphql-gcf slapMeGraphQL
cd slapMeGraphQL
npm install
gimp deploy
```

_**If you're a Sub**_, well it's time to make that botty dance and beg for work :collision:. Stop being a wuss and start creating templates to satisfied your Masters. I don't discriminate, so go on and create any type of nasty templates. From the a nasty Angular template to a dirty JQuery library. Do whatever you want you worm, as long as you publicly host them on GitHub using the naming convention: ```gimpy-template-[your-template-name]```

To get started you little worm, run the following:
```
gimp init chore4Pleasure
cd chore4Pleasure
npm install
npm test
```

## Install
```
npm install gimpy -g
```
## How To Use It
#### Creating New Projects Using Templates Created By The Gimps

If you already know which template you want to use, simply run:
```
gimp new your-template your-project-name
```
Answer some questions and your done!!!

If you're looking for templates, you can list all the templates hosted on GitHub as follow:
```
gimp ls
```

Each template is cached as soon as you use it so next time will be faster. If you want to list all cached templates:
```
gimp cache
```

If you want to clear the cache:
```
gimp cache --clear
```
#### Creating & Publishing Your Own Gimpy Template
To be a good Gimp, you want to start publishing new templates for your Masters. Nothing more simplt Gimp! Simply run the following:
```
gimp init chore4Pleasure
cd chore4Pleasure
npm install
npm test
```

You'll find a README.md file at the root of the _chore4Pleasure_ project. It explains how to create your own template, and then publish it.

#### Deployments
As you've noticed in the intro, the _graphql-gcf_ template can be automatically deployed both locally or to any Google Cloud Account. Gimp currently only supports deployment to Google Cloud Functions. More is coming, as well as the ability to let you create your own custom deployment. For those interested, there are currently only 2 templates that are fully configured to be deployed to GCF using gimpy:

1. _**graphql-gcf**_ - GraphQL project (incl. GraphiQL).
2. _**basicwebapp-gcf**_ - Basic HTTP server that supports CORS.

Example:

```
gimp new graphql-gcf slapMeGraphQL
cd slapMeGraphQL
npm install
gimp deploy
```

The last command will deploy your GraphQL project locally (providing both [gcloud](https://cloud.google.com/sdk/gcloud/), _gcloud beta component_, and [Google Functions Emulator](https://www.npmjs.com/package/@google-cloud/functions-emulator) are installed).

To deploy it to your Google Could Account (the details of your account will be asked during the template installation):
```
gimp deploy staging
```

All the environment configurations are stored in a _**appconfig.json**_ file. Update it to add or update environments. 

## This Is What We re Up To
We are Neap, an Australian Technology consultancy powering the startup ecosystem in Sydney. We simply love building Tech and also meeting new people, so don't hesitate to connect with us at [https://neap.co](https://neap.co).

## License
Copyright (c) 2017, Neap Pty Ltd.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Neap Pty Ltd nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL NEAP PTY LTD BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
