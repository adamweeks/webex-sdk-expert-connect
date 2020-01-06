const Webex = require('webex');

const {createExpertSpace, updateStatus, getUrlParams, postData} = require('./utils');

const {bindMeetingEvents, connectToMeeting, joinMeeting} = require('./meeting');

const SERVER_URL = 'http://localhost:3000';

function main() {
  const params = getUrlParams(window.location.href);

  if (!params.connect) {
    // Values are incorrect, redirect back to form
    window.location = './index.html';
    return;
  }

  document.getElementById('name').innerHTML = params.name;

  createExpertSpace(params);
}

main();
