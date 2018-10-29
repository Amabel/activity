GITHUB_API_ENDPOINT = 'https://api.github.com';
GITHUB_PREFIX = 'https://github.com/';

// find the current orgnization name from the url
let orgName = window.location.toString().split('/')[3];
if (orgName === 'orgs') {
  orgName = window.location.toString().split('/')[4];
}

// find the 'projects' tab (div), and attach the 'activities' tab (div)
let regex = new RegExp(".*Projects.*");
let nav = $('.pagehead-tabs-item').filter(function () {
  return regex.test($(this).text());
});
// create the 'activities' tab (div)
let iconUrl = chrome.extension.getURL("images/icons/activities.svg");
activitiesTab = '<a class="pagehead-tabs-item ga-tabs-item">' +
'<img src="' + iconUrl + '" class="octicon ga-icon-wrapper">' +
'Activities' +
'</a>';
nav.before(activitiesTab);

// For recording the number of unsupported activities,
// then we can update the divs properly.
// (Because we need to remove those divs at every refresh)
unsupportedActivityNum = 0;

$('.ga-tabs-item').click(function() {
  // Google analytics
  chrome.runtime.sendMessage({eventCategory: 'orgnizationPage', eventAction: 'showActivities'});
  $('.pagehead-tabs-item').each(function() {
    $(this).removeClass('selected');
    $(this).children('.ga-icon-wrapper').removeClass('ga-selected');
  })
  $(this).addClass('selected');
  $(this).children('.ga-icon-wrapper').addClass('ga-selected');
  showContents();
});

function validateAccessToken(accessToken) {
  // if verified, returns the user info
  $.ajax({
    url: GITHUB_API_ENDPOINT + '/user?access_token=' + accessToken,
    dataType: 'json',
    success: function(data) {
      addInfoToMainContainer(data);
      getActivities(accessToken, false, addContentsToActivityContentDiv);
      setInterval(function() { getActivities(accessToken, true, addContentsToActivityContentDiv)}, 5000);
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}

function showContents() {
  $('.orghead').next().remove();
  $('.orghead').after('<div class="ga-container container"></div>');
  let key = 'github_activities_access_token';
  chrome.storage.sync.get([key], function(result) {
    accessToken = result[key];
    if (!accessToken) {
      console.log('please submit access token');
      $('.ga-container').append(requireSubmitTokenDiv());
    } else {
      validateAccessToken(accessToken);
    }
  });
}

function requireSubmitTokenDiv() {
  return  '<div class="ga-require-submit-container">' +
            '<div class="qa-requiresubmit-wrapper ga-not-found">' +
              'Can\'t find your token :(<br>' +
              'Please submit your GitHub access token with the repo scope.' +
            '</div>' +
          '</div>';
}

function addInfoToMainContainer(data) {
  // global variables
  myData = eval(data);
  avatarUrl = myData.avatar_url;
  username = myData.login;
  homePage = myData.html_url;
}

function getActivities(accessToken, removeDiv, callback) {
  // Google analytics
  // chrome.runtime.sendMessage({eventCategory: 'orgnizationPage', eventAction: 'getActivities'});
  $.ajax({
    url: GITHUB_API_ENDPOINT + '/users/' + username + '/events/orgs/' + orgName + '?access_token=' + accessToken,
    dataType: 'json',
    success: function(data) {
      callback(data, removeDiv);
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}

function addContentsToActivityContentDiv(data, removeDiv) {
  activities = eval(data);
  // console.log(activities);
  unsupportedActivityNum = 0;
  if (activities.length > 0) {
    $.each(activities.reverse(), function(index, activity) {
      // console.log(activity);
      $('.ga-container').prepend(resolveActivity(activity));
    });
    let divNum = data.length - unsupportedActivityNum;
    if (removeDiv) {
      $('.activity-content-wrapper:nth-last-child(-n+' + divNum + ')').remove();
      $('.ga-no-content-wrapper:last-child').remove();
    }
  } else {
    $('.ga-container').prepend(noContentFoundDiv(activities));
    if (removeDiv) {
      $('.ga-no-content-wrapper:last-child').remove();
    }
  }
}

function noContentFoundDiv(activities) {
  if (activities.length === 0) {
    return  '<div class="ga-no-content-wrapper">' +
              '<div class="ga-no-content-description ga-not-found">' +
                 'Oops! Nothing found here :(<br>' +
                 'Please make sure you are a team member of this organization.' +
            '</div>';
  }
}

function resolveActivity(activity) {
  let contentDiv = '';
  let activityType = activity.type;
  switch(activityType) {
    case 'CreateEvent':
      contentDiv += getCreateEventTypeContents(activity);
      break;
    case 'DeleteEvent':
      contentDiv += getDeleteEventTypeContent(activity);
      break;
    case 'IssueCommentEvent':
      contentDiv += getIssueCommentEventTypeContent(activity);
      break;
    case 'IssuesEvent':
      contentDiv += getIssuesEventTypeContent(activity);
      break;
    case 'PullRequestEvent':
      contentDiv += getPullRequestEventTypeContent(activity);
      break;
    case 'PushEvent':
      contentDiv += getPushEventTypeContent(activity);
      break;
    case 'PullRequestReviewEvent':
      break;
    case 'PullRequestReviewCommentEvent':
      contentDiv += getPullRequestReviewCommentEventTypeContent(activity);
      break;
    case 'ReleaseEvent':
      contentDiv += getReleaseEventTypeContent(activity);
      break;
    default:
      unsupportedActivityNum ++;
      console.log('unsupported type: ' + activityType);
  }
  return contentDiv;
}

// event types
function getCreateEventTypeContents(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let refType = activity.payload.ref_type;
  let ref = activity.payload.ref || '';
  let actionUrl = repoUrl + '/tree/' + ref;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = '';
  switch(refType) {
    case 'branch':
      iconUrl = chrome.runtime.getURL('images/icons/git-branch.svg');
      break;
    case 'tag':
    case 'tags':
      iconUrl = chrome.runtime.getURL('images/icons/tag.svg');
      break;
    case 'repository':
      iconUrl = chrome.runtime.getURL('images/icons/repo.svg');
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
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' created a ' + refType + ' <a class="ga-bold" href="' + actionUrl + '" target="_blank">' + ref + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getDeleteEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let refType = activity.payload.ref_type;
  let ref = activity.payload.ref;
  let actionUrl = repoUrl + '/branches';
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/trashcan.svg');
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' deleted a ' + refType + ' <a class="ga-bold" href="' + actionUrl + '" target="_blank">' + ref + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getIssueCommentEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let comment = activity.payload.comment;
  let issue = activity.payload.issue;
  let issueTitle = issue.title;
  let commentUrl = comment.html_url;
  let issueNum = issue.number;
  let issueUrl = issue.html_url;
  let labels = issue.labels;
  let labelsDiv = '';
  labels.forEach(function(label) {
    textColor = textColorBaseOnLuma(label.color);
    labelsDiv += '<span class="label" style="background-color:#' + label.color + ';color:' + textColor + '">' +
                   label.name +
                 '</span>';
  });
  let title = issue.title;
  let action = activity.payload.action;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/comment.svg');
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' ' + action + ' a ' + '<a href="' + commentUrl + '" class="comment-text-wrapper" target="_blank">comment</a> on ' + ' <a class="ga-bold" href="' + issueUrl + '" target="_blank">' + issueTitle + ' ' + '<span class="ga-issue-number">#' + issueNum + '</span></a>' +
                        labelsDiv +
                        ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getIssuesEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let issue = activity.payload.issue;
  let issueNum = issue.number;
  let issueTitle = issue.title;
  let actionUrl = issue.html_url;
  let labels = issue.labels;
  let labelsDiv = '';
  labels.forEach(function(label) {
    textColor = textColorBaseOnLuma(label.color);
    labelsDiv += '<span class="label" style="background-color:#' + label.color + ';color:' + textColor + '">' +
                   label.name +
                 '</span>';
  });
  let action = activity.payload.action;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = '';
  if (action === 'closed') {
    iconUrl = chrome.runtime.getURL('images/icons/issue-closed.svg');
  } else if (action === 'reopened') {
    iconUrl = chrome.runtime.getURL('images/icons/issue-reopened.svg');
  } else {
    iconUrl = chrome.runtime.getURL('images/icons/issue-opened.svg');
  }
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' ' + action + ' an issue ' + ' <a class="ga-bold" href="' + actionUrl + '" target="_blank">' + issueTitle + ' ' +'<span class="ga-issue-number">#' + issueNum + '</span></a>' +
                        labelsDiv +
                        ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getPullRequestEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let pullRequestNumber = activity.payload.pull_request.number;
  let pullRequestTitle = activity.payload.pull_request.title;
  // action
  let action = activity.payload.action;
  if (action === 'closed') {
    if (activity.payload.pull_request.merged) {
      action = 'merged';
    }
  }
  let actionUrl = activity.payload.pull_request.html_url;
  let labels =  activity.payload.pull_request.labels;
  let labelsDiv = '';
  labels.forEach(function(label) {
    textColor = textColorBaseOnLuma(label.color);
    labelsDiv += '<span class="label" style="background-color:#' + label.color + ';color:' + textColor + '">' +
                   label.name +
                 '</span>';
  });
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  // icon url
  let iconUrl = null;
  switch (action) {
    case 'opened':
      iconUrl = chrome.runtime.getURL('images/icons/git-pull-request-open.svg');
      break;
    case 'closed':
      iconUrl = chrome.runtime.getURL('images/icons/git-pull-request-closed.svg');
      break;
    case 'merged':
      iconUrl = chrome.runtime.getURL('images/icons/git-merge.svg');
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
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' ' + action + ' a pull request ' + '<a class="ga-bold" href="' + actionUrl + '" target="_blank">' +  pullRequestTitle + ' ' + '<span class="ga-issue-number">#' + pullRequestNumber + '</span></a>' +
                        labelsDiv +
                        ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getPushEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let ref = activity.payload.ref.substring(11);
  let actionUrl = activity.payload.commits[0] ? repoUrl + '/commits/' + activity.payload.commits[0].sha : '#';
  let numberOfCommit = activity.payload.commits.length;
  let commitWord = numberOfCommit > 1 ? 'commits' : 'commit';
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/repo-push.svg');
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' pushed ' + numberOfCommit + ' ' + commitWord + ' into ' + ' <a class="ga-bold" href="' + actionUrl + '" target="_blank">' + ref + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getPullRequestReviewEventTypeContent(activity) {

}

function getPullRequestReviewCommentEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let comment = activity.payload.comment;
  let pullRequest = activity.payload.pull_request;
  let commentUrl = comment.html_url;
  let pullRequestNum = pullRequest.number;
  let pullResuestUrl = pullRequest.html_url;
  let labels =  pullRequest.labels;
  let labelsDiv = '';
  labels.forEach(function(label) {
    textColor = textColorBaseOnLuma(label.color);
    labelsDiv += '<span class="label" style="background-color:#' + label.color + ';color:' + textColor + '">' +
                   label.name +
                 '</span>';
  });
  let title = pullRequest.title;
  let action = activity.payload.action;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/comment.svg');
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' ' + action + ' a ' + '<a href="' + commentUrl + '" class="comment-text-wrapper" target="_blank">comment</a> on ' + ' <a class="ga-bold" href="' + pullResuestUrl + '" target="_blank">' + title + ' ' + '<span class="ga-issue-number">#' + pullRequestNum + ' '  + '</span></a>' +
                        labelsDiv +
                        ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}

function getReleaseEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let releaseName = activity.payload.release.name;
  let actionUrl = activity.payload.release.html_url;
  let preRelease = activity.payload.release.prerelease ? 'pre-' : '';
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/package.svg');
  contents += '<div class="activity-content-wrapper">' +
                '<div class="activity-row">' +
                  '<div class="activity-icon-wrapper">' +
                    '<img src="' + iconUrl + '">' +
                  '</div>' +
                  '<div class="activity-description">' +
                    '<div class="action">' +
                      '<div class="ga-avatar">' +
                        '<img src="' + avatarUrl + '">' +
                      '</div>' +
                      '<div class="action-description">' +
                        '<a href="' + userUrl + '" class="username">' + username + '</a>' +
                        ' published a ' + preRelease + 'release ' + '<a class="ga-bold" href="' + actionUrl + '" target="_blank">' + releaseName + '</a>' + ' in <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                      '</div>' +
                    '</div>' +
                    '<div class="time-stamp">' +
                      timeFromNow
                    '</div>' +
                  '</div>'
                '</div>' +
              '</div>';
  return contents;
}
