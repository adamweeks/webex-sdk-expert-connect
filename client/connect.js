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
