require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

const createUser = require('./guest');

app.get('/', (req, res) => res.send('Hello World!'));

/**
 * This endpoint does the following things:
 * Creates a Guest User with the submitted data
 * Creates a Webex Space
 * Adds Guest User and "expert" to space
 * Sends details as a space message
 */
app.post('/guest', (req, res) => {
  // The response should allow the user to open an sdk instance to listen to meetings on the create space.

  const displayName = 'SDK Workshop';
  createUser({displayName}).then((guestJWT) => {
    const response = {
      guestJWT,
      spaceID: 'space-id',
    };

    res.json(response);
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!!`));
