const Webex = require('webex');

const SERVER_URL = 'http://localhost:3000';

function updateStatus(status) {
  document.getElementById('status').innerText = status;
}

function getUrlParams(urlString) {
  const params = {};
  var url = new URL(urlString);
  ['name', 'pet', 'details', 'connect'].forEach((key) => {
    params[key] = url.searchParams.get(key);
  });
  return params;
}

function postData(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then((response) => {
    return response.json();
  });
}

function createExpertSpace(params) {
  const postUrl = `${SERVER_URL}/guest`;
  updateStatus('Creating Expert Space');

  return postData(postUrl, params)
    .then((postResponse) => {
      console.log(postResponse);
      updateStatus('Expert Space Created');
      return postResponse;
    })
    .catch((e) => {
      console.error(e);
      updateStatus('Error: Unable to create expert space');
    });
}

// Similarly, there are a few different ways we'll get a meeting Object, so let's
// put meeting handling inside its own function.
function bindMeetingEvents(meeting) {
  // call is a call instance, not a promise, so to know if things break,
  // we'll need to listen for the error event. Again, this is a rather naive
  // handler.
  meeting.on('error', (err) => {
    console.error(err);
  });

  // Handle media streams changes to ready state
  meeting.on('media:ready', (media) => {
    if (!media) {
      return;
    }
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = media.stream;
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = media.stream;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = media.stream;
    }
  });

  // Handle media streams stopping
  meeting.on('media:stopped', (media) => {
    // Remove media streams
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = null;
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = null;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = null;
    }
  });

  // Of course, we'd also like to be able to end the call:
  document.getElementById('hangup').addEventListener('click', () => {
    meeting.leave();
    updateStatus('Disconnected.');
  });
}

// Join the meeting and add media
function joinMeeting(meeting) {
  return meeting.join().then(() => {
    document.getElementById('hangup').disabled = false;
    updateStatus('Connected to Expert');
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: false,
      sendVideo: true,
      sendAudio: true,
      sendShare: false,
    };

    return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
      const [localStream, localShare] = mediaStreams;

      meeting.addMedia({
        localShare,
        localStream,
        mediaSettings,
      });
    });
  });
}

function connectToMeeting(jwt, spaceID) {
  updateStatus('Connecting to Webex');

  const webex = Webex.init();
  webex.once(`ready`, () => {
    webex.authorization.requestAccessTokenFromJwt({jwt}).then(() => {
      updateStatus('Webex connected...');

      // Once expert connects, we will get a meeting added event
      webex.meetings.on('meeting:added', (addedMeetingEvent) => {
        const addedMeeting = addedMeetingEvent.meeting;
        console.log(addedMeeting);
        // Acknowledge to the server that we received the call on our device
        addedMeeting.acknowledge(addedMeetingEvent.type).then(() => {
          // Join the meeting
          joinMeeting(addedMeeting);
          bindMeetingEvents(addedMeeting);
        });
      });

      webex.meetings.register().then(() => {
        updateStatus('Webex connected, waiting for expert...');
      });
    });
  });
}

function main() {
  const params = getUrlParams(window.location.href);

  if (!params.connect) {
    // Values are incorrect, redirect back to form
    window.location = './index.html';
    return;
  }

  document.getElementById('name').innerHTML = params.name;

  createExpertSpace(params).then((postResponse) => {
    const jwt = postResponse.guestJWT;
    const spaceID = postResponse.space.id;
    connectToMeeting(jwt, spaceID);
  });
}

main();
