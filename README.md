# User API

[![Build Status](https://travis-ci.org/ryanwalters/user-api.svg?branch=master)](https://travis-ci.org/ryanwalters/user-api)[![Coverage Status](https://coveralls.io/repos/github/ryanwalters/base-api/badge.svg?branch=github)](https://coveralls.io/github/ryanwalters/base-api?branch=github)

An API built primarily using the [hapi](https://github.com/hapijs/hapi) ecosystem, along with a JWT authentication
plugin called jot.

- Authentication - [jot](https://github.com/ryanwalters/jot)
- Configuration - [confidence](https://github.com/hapijs/confidence)
- Documentation - [lout](https://github.com/hapijs/lout)
- ORM - [sequelize](https://github.com/sequelize/sequelize) (postgres)

The API has endpoints for simple user creation and maintenance, as well as token generation and revocation.

## Setup

1. `npm install`
1. Create `.env` file using the __Development Environment Variables__ section below
1. `foreman start` or `nf start`

## Development Environment Variables

```
DATABASE_URL=postgres://...
NODE_ENV=development
```