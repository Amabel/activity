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
  let value = accessToken;
  chrome.storage.sync.set({github_activities_access_token: value}, function() {
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
    $('.activity-contents-wrapper').append(resolveActivity(myActivity));
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
    contentDiv += getIssueCommentEventTypeContent(myActivity);
      break;
    case 'IssuesEvent':
    contentDiv += getIssuesEventTypeContent(myActivity);
      break;
    case 'PullRequestEvent':
      contentDiv += getPullRequestEventTypeContent(myActivity);
      break;
    case 'PushEvent':
      contentDiv += getPushEventTypeContent(myActivity);
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
    case 'repository':
      iconUrl = 'images/icons/repo.svg';
      break;
    default:
  }
  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' + 
                  '<div class="activity-description">' + 
                    '<div class="action">' + 
                      'created a ' + refType + ' <a href="' + actionUrl + '" target="_blank">' + ref + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' + 
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  return contents;
}

function getDeleteEventTypeContent(myActivity) {

}

function getIssueCommentEventTypeContent(myActivity) {
  let contents = '';
  let username = myActivity.actor.login;
  let repoName = myActivity.repo.name;
  let repoUrl = 'https://github.com/' + repoName;
  let comment = myActivity.payload.comment;
  let issue = myActivity.payload.issue;
  let commentUrl = comment.html_url;
  let issueNum = issue.number;
  let issueUrl = issue.html_url;
  let title = issue.title;
  let action = myActivity.payload.action;
  let createdAt = myActivity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = 'images/icons/comment.svg';
  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' + 
                  '<div class="activity-description">' + 
                    '<div class="action">' + 
                      action + ' a ' + '<a href="' + commentUrl + '" class="comment-text-wrapper" target="_blank">comment</a> on ' + ' <a href="' + issueUrl + '" target="_blank"> #' + issueNum + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' + 
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  return contents;
}

function getIssuesEventTypeContent(myActivity) {
  let contents = '';
  let username = myActivity.actor.login;
  let repoName = myActivity.repo.name;
  let repoUrl = 'https://github.com/' + repoName;
  let issue = myActivity.payload.issue;
  let issueNum = issue.number;
  let title = issue.title;
  let actionUrl = issue.html_url;
  let action = myActivity.payload.action;
  let createdAt = myActivity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = '';
  if (action === 'closed') {
    iconUrl = 'images/icons/issue-closed.svg';
  } else if (action === 'reopened') {
    iconUrl = 'images/icons/issue-reopened.svg';
  } else {
    iconUrl = 'images/icons/issue-opened.svg';
  }
  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' + 
                  '<div class="activity-description">' + 
                    '<div class="action">' + 
                      action + ' an issue ' + ' <a href="' + actionUrl + '" target="_blank">#' + issueNum + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' + 
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  return contents;
}

function getPullRequestEventTypeContent(myActivity) {
  let contents = '';
  let username = myActivity.actor.login;
  let repoName = myActivity.repo.name;
  let repoUrl = 'https://github.com/' + repoName;
  let pullRequestNumber = myActivity.payload.pull_request.number;
  let pullRequestTitle = myActivity.payload.pull_request.title;
  // action
  let action = myActivity.payload.action;
  if (action === 'closed') {
    if (myActivity.payload.pull_request.merged) {
      action = 'merged';
    }
  }
  let actionUrl = myActivity.payload.pull_request.html_url;
  let createdAt = myActivity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  // icon url
  let iconUrl = null;
  switch (action) {
    case 'opened':
      iconUrl = 'images/icons/git-pull-request-open.svg';
      break;
    case 'closed':
      iconUrl = 'images/icons/git-pull-request-closed.svg';
      break;
    case 'merged':
      iconUrl = 'images/icons/git-merge.svg';
      break;
    default:
      iconUrl = null;
  }
  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' + 
                  '<div class="activity-description">' + 
                    '<div class="action">' + 
                      action + ' a pull request ' + '<a href="' + actionUrl + '" target="_blank">' + '#' + pullRequestNumber + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' + 
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  return contents;
}

function getPushEventTypeContent(myActivity) {
  let contents = '';
  let username = myActivity.actor.login;
  let repoName = myActivity.repo.name;
  let repoUrl = 'https://github.com/' + repoName;
  let ref = myActivity.payload.ref.substring(11);
  let actionUrl = repoUrl + '/commits/' + myActivity.payload.commits[0].sha;
  let numberOfCommit = myActivity.payload.commits.length;
  let commitWord = numberOfCommit === 1 ? 'commit' : 'commits';
  let createdAt = myActivity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = 'images/icons/repo-push.svg';
  contents += '<div class="activity-content-wrapper">' + 
                '<div class="activity-row">' + 
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' + 
                  '<div class="activity-description">' + 
                    '<div class="action">' + 
                      'pushed ' + numberOfCommit + ' ' + commitWord + ' into ' + ' <a href="' + actionUrl + '" target="_blank">' + ref + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' + 
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +           
              '</div>';
  return contents;
}

function getPullRequestReviewEventEventTypeContent(myActivity) {

}

function getPullRequestReviewCommentEventTypeContent(myActivity) {

}
