# Wedding Foundry: API

## Setup

1. `npm install`
2. Create `.env` file using the __Development Environment Variables__ section below

## Methods

### User

HTTP Method | Endpoint | Function
------------|----------|---------
`POST` | /user | Create user
`GET` | /user/{id} | Get user information
`PUT` | /user/{id} | Update user information
`DELETE` | /user/{id} | Delete user

### Tokens

HTTP Method | Endpoint | Function
------------|----------|---------
`POST` | /token/refresh | Obtain refresh token
`POST` | /token/access | Obtain access token

## Development Environment Variables

    DATABASE_URL=postgres://jhfkwpibezsmli:NUU1Iv1_Zp5XwR14Wy_myHk0W1@ec2-54-163-228-0.compute-1.amazonaws.com:5432/deqt4qke1araia?ssl=true
    NODE_ENV=development