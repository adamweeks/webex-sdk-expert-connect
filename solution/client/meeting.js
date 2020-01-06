const Webex = require('webex');

const {updateStatus} = require('./utils');

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

module.exports = {bindMeetingEvents, connectToMeeting, joinMeeting};
