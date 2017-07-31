<a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_black_small_logo.png" alt="Neap Pty Ltd logo" title="Neap" align="right" height="50" width="120"/></a>

# Gimpy - Create & Deploy Projects to Google Cloud Functions. Support for more tortures coming soon...
[![NPM][1]][2]

[1]: https://img.shields.io/npm/v/gimpy.svg?style=flat
[2]: https://www.npmjs.com/package/gimpy

## Intro
I'm your gimp! I loves doing your painful chores like your project initilization, your deployments, etc. The more painful it is, the more likely I'll be "satisfied" :japanese_ogre: :japanese_ogre: :smiling_imp: :smiling_imp:.

## Install
```
npm install gimpy -g
```
## How To Use It
#### Creating a new project from scratch
gimpy currently supports 2 types of new projects:

1. _**Basic HTTP**_ - This is a simple Hello World app.
2. _**GraphQL**_ - This template is built using the [google-graphql-functions](https://github.com/nicolasdao/google-graphql-functions) package which hosts a GraphQL API.

All those projects come with a basic pre-configuration in their _webconfig.json_ file which makes it trivial to configure CORS as well as multiple depoyments in various environments.

```
gimpy init your-web-app
cd your-web-app
npm install
```
This will ask some basic questions and will initialize a HelloWorld Web App ready to be hosted on Google Cloud.

To deploy it locally (using [@google-cloud/functions-emulator](https://github.com/GoogleCloudPlatform/cloud-functions-emulator/))
```
gimpy deploy
```

To deploy it to a Google Cloud Account (that you must have presumably configured during the ```gimpy init``` step)
```
gimpy deploy build
```

Alternatively, you can also run those 2 commands through npm:
```
npm run deploy
```

```
npm run deploy -- build
```

In case you simply want to initialize a new _webconfig.json_ inside an existing Google Cloud Functions project, simply run the following command:
```
gimpy init
```
#### Adding an HTTP Handler Into An Existing Google Cloud Functions Project

First, install gimpy.js in your project
```
npm install gimpy --save
``` 

In its simplest form, a Google Cloud Functions project looks like this:
```js
exports.yourapp = (req, res) => {
  res.status(200).send('Hello World')
}
```

Simply update it as follow:
```js
const { serveHttp } = require('gimpy')

exports.yourapp = serveHttp((req, res) => {
  res.status(200).send('Hello World')
})
```

Easy isn't it!?

To configure the HTTP handler, simply configure the _**webconfig.json**_ file as explained in the next section.

## Configuring The HTTP Handler - webconfig.json
#### CORS
This is the main 'raison d'être' of this project. Out-of-the box, Google Cloud Functions does not support easy configuration for CORS when triggered through HTTP (at least as of July 2017). gimpy provides an easy to configure CORS through its _**webconfig.json**_ file. 

```js
{
  "headers": {
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Max-Age": "1296000"
  }
}
```
More details about those headers in the [Annexes](#annexes) section under [A.1. CORS Refresher](#a1-cors-refresher).

> CORS is a classic source of headache. Though gimpy allows to easily configure any Google Cloud Functions project, it will not prevent anybody to badly configure a project, and therefore loose a huge amount of time. For that reason, a series of common mistakes have been documented in the [Annexes](#annexes) section under [A.2. CORS Basic Errors](#a2-cors-basic-errors).

#### Adding Multiple Deployment Environments
Let's imagine that 3 different environments have been setup on a Google Cloud Account, the gimpy can easily deploy to any of those environment if they have been configured in the project's _**webconfig.json**_ file:

```js
{
  "env": {
    "active": "default",
    "default": {
      "functionName": "helloneap",
      "trigger": "--trigger-http",
      "entryPoint": "helloNeap",
      "googleProject": "DevEnv",
      "bucket": "devenvbucket"
    },
    "build": {
      "functionName": "helloneap",
      "trigger": "--trigger-http",
      "entryPoint": "helloNeap",
      "googleProject": "DevEnv",
      "bucket": "devenvbucket"
    },
    "staging": {
      "functionName": "helloneap",
      "trigger": "--trigger-http",
      "entryPoint": "helloNeap",
      "googleProject": "StagingEnv",
      "bucket": "stagingenvbucket"
    },
    "prod": {
      "functionName": "helloneap",
      "trigger": "--trigger-http",
      "entryPoint": "helloNeap",
      "googleProject": "ProdEnv",
      "bucket": "prodenvbucket"
    }
  }
}
```

To deploy to a specific environment(prod for example):
```
gimpy deploy prod
```
> TIPS: The above command will not only deploy the project to "prod" (whatever _prod_ means depending on the configuration defined under the prod property above), but prior to that, it will update the _**active**_ property from "default" to "prod". The sole purpose of the _**active**_ property is to behave as a sort of environment variable that lets your code figure out which environment is currently active. More details about this in the next section.

#### Configuring Custom Environment Variables
The previous _webconfig.json_ file example highlighted the _**active**_ property. As mentioned before, it's sole purpose is to behave as a sort of environment variable that let's your code figure out which environment is currently active. The code below demonstrates how to programmatically access the current environment:

```js
const { getActiveEnv } = require('gimpy')
const activeEnv = getActiveEnv()
```
Using the previous _webconfig.json_, if the _active_ property is set to "default", then the value of _activeEnv_ will be the following JSON object:
```js
{
  "functionName": "helloneap",
  "trigger": "--trigger-http",
  "entryPoint": "helloNeap",
  "googleProject": "DevEnv",
  "bucket": "devenvbucket"
}
```

But after deployment to prod, its value will be:

```js
{
  "functionName": "helloneap",
  "trigger": "--trigger-http",
  "entryPoint": "helloNeap",
  "googleProject": "ProdEnv",
  "bucket": "prodenvbucket"
}
```
> NOTE: _**getActiveEnv**_ accepts one optional boolean called 'memoize'. By default it is set to true. That means that calling it multiple times will not incure more read resources. 

## Annexes
#### A.1. CORS Refresher
_COMING SOON..._

#### A.2. CORS Basic Errors
_**WithCredentials & CORS**_
The following configuration is forbidden:
```js
{
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true"
  }
}
```

You cannot allow anybody to access a resource("Access-Control-Allow-Origin": "*") while at the same time allowing anybody to share cookies("Access-Control-Allow-Credentials": "true"). This would be a huge security breach (i.e. [CSRF attach](https://en.wikipedia.org/wiki/Cross-site_request_forgery)). 

For that reason, this configuration, though it allow your resource to be called from the same origin, would fail once your API is called from a different origin. A error similar to the following would be thrown by the browser:
```
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

__*Solutions*__

If you do need to share cookies, you will have to be explicitely specific about the origins that are allowed to do so:
```js
{
  "headers": {
    "Access-Control-Allow-Origin": "http://your-allowed-origin.com",
    "Access-Control-Allow-Credentials": "true"
  }
}
```

If you do need to allow access to anybody, then do not allow requests to send cookies:
```js
{
  "headers": {
    "Access-Control-Allow-Headers": "Authorization",
    "Access-Control-Allow-Origin": "*",
  }
}
```
If you do need to pass authentication token, you will have to pass it using a special header(e.g. Authorization), or pass it in the query string if you want to avoid preflight queries (preflight queries happens in cross-origin requests when special headers are being used). However, passing credentials in the query string are considered a bad practice. 

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
