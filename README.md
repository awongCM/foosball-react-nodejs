# foosball-react-nodejs

Foosball Ranking System written entirely in NodeJS/React

Ingredient used to make this system:
* NodeJS
* ExpressJS (for API JSON request/response)
* React
* Elo-rank
* UUID
* POJOs
* YARN/NPM

## Instructons to setup and run
1. Download the repo.
2. Navigate to the project root folder, run `npm install` or `npm i`.
3. To start up API webserice, type `yarn start`.
4. To serve front end app, type `yarn serve`.

## Backend API endpoints provided

### 1. `players` with get/post verbs.

#### GET with no request body.
*Response Payload:* A list of all players is returned.

#### POST with the following request body.

```
{
  "name": <player name>
}
```
*Response Payload:* A new player is successfully entered in the system.

### 2. `game` with post verb.

#### POST with the following request body.

```
{
  "winners": [
    <player 1 name>,
    <player 2 name>,
  ],
  "losers": [
    <player 3 name>,
    <player 4 name>,
  ]
}
```
*Response Payload:* A new match with paired opponents is created; and their respective opponents' win ratios are calculated and returned.

### 3. `matches` with get verbs.

#### GET with no request body.

*Response Payload:* A list of all recent played matches is returned.

## Front end React UI component provided
An interface to view the JSON payload message when interacting with the API services.

![alt text](/React_App.png)

TODO:
1. To host it live in Heroku/AWS.
2. Use a graph API to display matches over time.
3. Replace the UI json viewer object with more useful actual form input fields.

### References
For more information on how players ranking are determined during the games.

https://www.npmjs.com/package/elo-rank

https://en.wikipedia.org/wiki/Elo_rating_system
