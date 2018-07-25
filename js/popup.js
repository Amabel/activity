GITHUB_API_ENDPOINT = 'https://api.github.com';
EVENT_TYPES = [
                'CreateEvent', 'DeleteEvent', 'IssueCommentEvent', 
                'IssuesEvent', 'PullRequestEvent', 'PushEvent',
                'PullRequestReviewEvent', 'PullRequestReviewCommentEvent'
              ];

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
  $.each(myActivities, function(index, myActivity) {
    if (myActivity.type == 'CreateEvent') {
      $('.activity-contents-wrapper').prepend(resolveActivity(myActivity));
    }
  });
}

function resolveActivity(myActivity) {
  let contentDiv = '';
  let activityType = myActivity.type;
  console.log(activityType);
  switch(activityType) {
    case 'CreateEvent':
      contentDiv += getCreateEventTypeContents(myActivity);
      break;
    case 'DeleteEvent':
      break;
    case 'IssueCommentEvent':
      break;
    case 'IssuesEvent':
      break;
    case 'PullRequestEvent':
      break;
    case 'PushEvent':
      break;
    case 'PullRequestReviewEvent':
      break;
    case 'PullRequestReviewCommentEvent':
      break;
    default:
      console.log('unsupported type: ' + activityType);
  }
  return contentDiv;
}

// event types
function getCreateEventTypeContents(myActivity) {
  let contents = '';
  let username = myActivity.actor.login;
  let repoName = myActivity.repo.name;
  let repoUrl = 'https://github.com/' + repoName;
  let refType = myActivity.payload.ref_type;
  let ref = myActivity.payload.ref || '';
  let actionUrl = repoUrl + '/tree/' + ref;
  let createdAt = myActivity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = '';
  switch(refType) {
    case 'branch':
      iconUrl = 'images/icons/git-branch.svg';
      break;
    case 'tag':
    case 'tags':
      iconUrl = 'images/icons/tag.svg';
      break;
    case null:
      iconUrl = 'images/icons/repo.svg';
      break;
    default:
  }
  console.log(iconUrl);

  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon grey" style="background-image: url(' + iconUrl + ')">' +

                  '</div>' + 
                  '<div class="activity-desctiption>' + 
                    '<span class="action">' + 
                      'created a ' + refType + ' <a href="' + actionUrl + '">' + ref + '</a>' +
                    '</span>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  console.log(contents);
  console.log(moment(createdAt).fromNow());
  return contents;
}
