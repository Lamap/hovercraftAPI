# REST API Skeleton

[![Build Status](https://travis-ci.org/morphatic/rest-api-skeleton.svg?branch=master)](https://travis-ci.org/morphatic/rest-api-skeleton)
[![Coverage Status](https://coveralls.io/repos/github/morphatic/rest-api-skeleton/badge.svg?branch=master)](https://coveralls.io/github/morphatic/rest-api-skeleton?branch=master)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/morphatic/rest-api-skeleton/master/LICENSE)

A REST API skeleton based on NodeJS, Express, MongoDB, Mongoose using JSON Web Tokens (JWT) for authentication.

## Quick Start

To get started, please follow these steps:

1. [Install MongoDB Community Server](https://www.mongodb.com/download-center#community) for your platform
2. **FORK** this repo, then clone your fork locally
3. Install dependencies by running `npm install`
4. You may also need to install `nodemon` globally, i.e. `npm i -g nodemon`
5. Rename `.env.example` to `.env`, and (optionally) edit the variables
6. (Optional) Add/Edit routes, models, and controllers
7. (Optional) Add custom tests at the bottom of `test/rest-api-skeleton.js`
8. Startup Mongo following the instructions for your platform
9. (Optional) Run the tests to make sure all is well: `npm test`
10. Fire it up! `npm start`