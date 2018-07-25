GITHUB_API_ENDPOINT = 'https://api.github.com';

$(function() {
  showVerifyingDiv();
  setTimeout(showContents, 0);
  // showContents();
});

$('#token-submit').validator()

$('#token-submit').submit(function() {
  showVerifyingDiv();
  let data = $(this).serializeArray()
  let accessToken = data[0]['value'];
  console.log('form submitted, token: ' + accessToken);
  validateAccessToken(accessToken);
  return false;
})

// ajax to api.github.com/user to verify the access token
function validateAccessToken(accessToken) {
  // if verified, returns the user info
  $.ajax({
    url: GITHUB_API_ENDPOINT + '/user?access_token=' + accessToken,
    dataType: 'json',
    success: function(data) {
      console.log(JSON.stringify(data));
      storeAccessToken(accessToken);
      showMainContainer(data);
      getActivities(accessToken, addContentsToActivityContentDiv);
    },
    error: function(error) {
      showTokenSubmit();
      console.log(JSON.stringify(error));
    }
  })
}

function showContents() {
  let key = 'github_activities_access_token';
  chrome.storage.sync.get([key], function(result) {
    console.log(JSON.stringify(result));
    accessToken = result[key];
    console.log(accessToken);
    if (!accessToken) {
      showTokenSubmit();
    } else {
      validateAccessToken(accessToken);
    }
  });
}

function storeAccessToken(accessToken) {
  let key = 'github_activities_access_token';
  let value = accessToken;
  chrome.storage.sync.set({key: value}, function() {
    console.log('stored');
  });
}

function showTokenSubmit() {
  $('.verifying-token').hide();
  $('.main-container').hide();
  $('#token-submit').show();
}

function showVerifyingDiv() {
  $('#token-submit').hide();
  $('.main-container').hide();
  $('.verifying-token').show();
}

function showMainContainer(data) {
  addInfoToMainContainer(data);
  $('#token-submit').hide();
  $('.verifying-token').hide();
  $('.main-container').show();
}

function addInfoToMainContainer(data) {
  // global variables
  myData = eval(data);
  console.log(JSON.stringify(data));
  console.log(myData);
  avatarUrl = myData.avatar_url;
  username = myData.login;
  homePage = myData.html_url;
  let avatarDiv = '<img src="' + avatarUrl + '">';
  console.log(avatarUrl);
  $('.main-container .user-wrapper .avatar').append(avatarDiv);
  $('#username').text('Hi, ' + username);
}

function getActivities(accessToken, callback) {
  console.log(myData);
  $.ajax({
    url: GITHUB_API_ENDPOINT + '/users/' + username + '/events?access_token=' + accessToken,
    dataType: 'json',
    success: function(data) {
      callback(data);
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}

function addContentsToActivityContentDiv(data) {
  myActivities = eval(data);
  console.log(myActivities);
  $.each(function(index, myActivity) {
    let activityType = myActivity.type;
    switch(activityType) {
      case '':

      default:
        console.log('unsupported type: ' + activityType);
    }
  });
}
