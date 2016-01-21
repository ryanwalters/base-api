# Base API

This API is built on the [hapi](https://github.com/hapijs/hapi) platform, and uses
[JSON web tokens (JWT)](https://github.com/ryanwalters/jot) for authentication.

## Setup

1. `npm install`
1. Create `.env` file using the __Development Environment Variables__ section below
1. `foreman start` or `nf start`

## Development Environment Variables

```
DATABASE_URL=postgres://...
NODE_ENV=development
```