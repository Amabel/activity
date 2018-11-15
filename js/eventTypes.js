// event types:
//
// CreateEvent
// DeleteEvent
// IssueCommentEvent
// IssuesEvent
// PullRequestEvent
// PushEvent
// PullRequestReviewEvent, not implemented
// PullRequestReviewCommentEvent
// ReleaseEvent
// WatchEvent
// ForkEvent

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

function getWatchEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/eye.svg');
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
                        ' started watching <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
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

function getForkEventTypeContent(activity) {
  let contents = '';
  let username = activity.actor.login;
  let userUrl = GITHUB_PREFIX + username;
  let avatarUrl = activity.actor.avatar_url;
  let orgRepoName = activity.repo.name;
  let repoName = activity.repo.name.split('/')[1];
  let repoUrl = 'https://github.com/' + orgRepoName;
  let forkeeUrl = activity.payload.forkee.html_url;
  let forkeeName = activity.payload.forkee.full_name;
  let createdAt = activity.created_at;
  let timeFromNow = moment(createdAt).fromNow();
  let iconUrl = chrome.runtime.getURL('images/icons/repo-forked.svg');
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
                        ' forked <a href="' + repoUrl + '" target="_blank">' + repoName + '</a>' +
                        ' into <a href="' + forkeeUrl + '" target="_blank">' + forkeeName + '</a>' +
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
