
# ilearn-backend

Backend Repository for the ILEARN AFRICAN backend

# Description

- ILEARN AFRICAN is a multi-faceted omline education platform that provides users with blended learning experiwnce tailored to meet each individuals unique learning styles.

##  List of endpoints exposed by the service


| Method | Endpoint                                           | Description                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| POST   | /api/user/register/                                | registers new users by email                             |
| PUT    | /api/user/confirmation/:emailToken                 | activates a users account                                |
| POST   | /api/user/login/                                   | logs in a user by email                                  |
| GET    | /api/user/profile/                                 | get information of logged in user                        |
| POST   | /api/user/activity/                                | get logged in user's activity                            |
| PUT   | /api/user/profile/                                 | update user profile                                      |
| POST   | /api/user/password/                                | user change password                                     |
| POST   | /api/user/search?email=email&otherfields=value     | search through users                                     |

##  Request and Response Bodies
### Register
Request => `{ "email": "","password": "","password2": "" }`

Response => `{ "_id": "", "IsAuthenticated": false, "email": "","register_date": ""}`

Errors => `{ "email": "", "password": "", "password2": "" }`
### Login
Request => `{ "email": "", "password": ""}` 
Headers => `{ "User-Agent": "Browser info", "x-userip": "id address" }`

Response => `{ "_id": "", "IsAuthenticated": true, "email": "", "register_date": "", "activity_data": [], "token": ""}`

Errors => `{ "email": "", "password": "" }`
### Change password
Request => `{"old_password": "", "password": "", "password2": "" }` 
Headers => `{ Authorization: Bearer token }`

Response => `{ "message": "Password changed successfully" }`

Errors => `{ "old_password": "", "password": "", "password2": "" }`
### Update profile
Request => `{ "first_name": "", "last_name": "" }` 
Headers => `{ Authorization: Bearer token }`

Response => `{ "id": "", "email": "", "first_name": "", "last_name": "", "message": ""}`

Errors => `{ "first_name": "", "last_name": "" }`
### Get current user
Headers => `{ Authorization: Bearer token }`

Response => `{ "id": "", "email": "", "first_name": "", "last_name": ""}`
### Get user activity
Headers => `{ Authorization: Bearer token }`

Response => `{  "activity": [] }`

## API Documentation

## Setup

- Step by step instructions on how to get the code setup locally. This may include:

### Dependencies

    - node v10
    - mongoDB

### Getting Started

- First clone the project to your local machine using `git clone https://bitbucket.org/ilearnafrica/ilearn-backend.git`
- Go to the develop branch using the command `git checkout develop`
- Install project packages using `npm install`
- To create a dot_env file `.env`, run the command `cp .env_sample .env` so that the `.env_sample` file can be copied to `.env`
- Edit the `.env` file with your own credentials. Eg : mongodb database URL and SMTP email credentials
- Run command `nodemon start.js` to start the project

### Run The Service

- List of steps to run the service (e.g. docker commands)
- Install docker on your machine
- Modify the address of mongodb database in the `.env` file from `mongodb://localhost:27017/mybd29` to `mongodb://mongo:27017/mybd29`
- Run `docker-compose up`, this will bring up both the application server and mongodb server

### Microservices

- List out the microservices if any that this repo uses(This will include the payment service we shall be using)

## Testing

- To run tests without coverage run `npm run test`
- To run tests with coverage run `npm run cov`

## Contributers

- This project exists thanks to all these people
