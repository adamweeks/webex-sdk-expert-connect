require('dotenv').config();

const express = require('express');
const {createUser} = require('./jwt');

const app = express();
const port = 3000;
const expertEmail = process.env.WEBEX_EXPERT_EMAIL;

app.use(express.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
    const displayName = req.body.name || 'SDK Workshop Guest';

    const guestJWT = await createUser({displayName});

    const guestUser = 'Fix me in step 2';

    const space = 'Fix me in step 3';

    const response = {
      guestJWT,
      guestUser,
      space,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!!`));
