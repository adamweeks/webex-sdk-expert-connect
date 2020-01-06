require('dotenv').config();

const express = require('express');
const {prepareSpace} = require('./webex');
const createUser = require('./guest');

const app = express();
const port = 3000;
const expertEmail = process.env.WEBEX_EXPERT_EMAIL;

app.get('/', (req, res) => res.send('Hello World!'));

/**
 * This endpoint does the following things:
 * Creates a Guest User with the submitted data
 * Creates a Webex Space
 * Adds Guest User and "expert" to space
 * Sends details as a space message
 */
app.post('/guest', async (req, res) => {
  // The response should allow the user to open an sdk instance to listen to meetings on the create space.

  try {
    const displayName = 'SDK Workshop Guest';
    const spaceTitle = 'SDK Expert Connect Workshop';
    const message = 'A user has requested expert support with the following details:';
    const guestJWT = await createUser({displayName});
    const space = await prepareSpace({title: spaceTitle, email: expertEmail, message});

    const response = {
      guestJWT,
      space,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!!`));
