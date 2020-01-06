const webex = require('webex/env');

if (!process.env.WEBEX_ACCESS_TOKEN) {
  throw new Error('Environment variable WEBEX_TOKEN must be defined');
}

/**
 * Prepares a space by creating it, adding members, and sending a message.
 *
 * @param {Object} param
 * @param {string} param.title
 * @param {string} param.email
 * @param {string} param.message
 * @returns
 */
async function prepareSpace({title, email, message}) {
  // Create a Room
  const room = await webex.rooms.create({title});
  // Add the "expert"
  await webex.memberships.create({
    roomId: room.id,
    personEmail: email,
  });
  // TODO: Add the "guest"

  // Send the details as a room message
  await webex.messages.create({
    roomId: room.id,
    text: message,
  });

  return room;
}

module.exports = {prepareSpace};
