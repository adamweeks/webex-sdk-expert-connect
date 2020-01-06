/**
 * Tools for generating a guest user token
 *
 * Online docs:
 * https://developer.webex.com/docs/guest-issuer
 */

const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const axios = require('axios');

const {GUEST_ISSUER_ID, GUEST_SHARED_SECRET} = process.env;

/**
 * Creates a jwt user token
 * @param {object} options
 * @param {String} options.displayName *required*
 * @param {Number} options.expiresInSeconds
 * @param {String} options.issuer Guest Issuer ID
 * @param {String} options.userId *no spaces*
 * @returns {Promise<object>}
 */
function createUser({displayName}) {
  const payload = {
    name: displayName,
  };
  const options = {
    expiresIn: 90 * 60,
    issuer: GUEST_ISSUER_ID,
    subject: uuid.v4(),
  };
  const secret = Buffer.from(GUEST_SHARED_SECRET, 'base64');
  try {
    const jwtToken = jwt.sign(payload, secret, options);
    return Promise.resolve(jwtToken);
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Gets the user details of a guest user via token.
 *
 * @param {string} jwtToken
 * @returns {object} User Object from the /people/me endpoint
 */
async function getWebexGuest(jwtToken) {
  const guestLoginOptions = {
    headers: {
      authorization: `Bearer ${jwtToken}`,
    },
    method: 'POST',
    url: 'https://api.ciscospark.com/v1/jwt/login',
  };

  try {
    const response = await axios(guestLoginOptions);
    const guestAccessToken = response.data.token;
    const getMeOptions = {
      headers: {
        authorization: `Bearer ${guestAccessToken}`,
      },
      method: 'GET',
      url: 'https://api.ciscospark.com/v1/people/me',
    };
    const guestUser = await axios(getMeOptions);

    return guestUser.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {createUser, getWebexGuest};
