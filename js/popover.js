function reloadTippy() {
  tippy('.with-popover', {
    content(reference) {
      return document.getElementById(reference.getAttribute('data-template'))
    }
  });
}

function issueCommentPopoverDiv(issueCommentEvent) {
  let content = '';
  let div = '';
  let id = 'popover_' + issueCommentEvent.id;
  let repoName = issueCommentEvent.repo.name;
  let issue = issueCommentEvent.payload.issue;
  let issueTitle = ellipsisBy(issue.title, 50);
  let issueCreatedAt = moment(issue.created_at).format('ll');
  let isClosed = issue.closed_at;
  let state = isClosed ? 'Closed' : 'Open';
  let stateColor = isClosed ? '#cb2431' : '#2cbe4e';
  let iconUrl = isClosed
  ? chrome.runtime.getURL('images/icons/issue-closed-white.svg')
  : chrome.runtime.getURL('images/icons/issue-opened-white.svg')
  let comment = issueCommentEvent.payload.comment;
  let commentUrl = comment.html_url;
  let issueBody = ellipsisBy(trimHtmlTags(marked(issue.body)), 100);
  let commentBody = ellipsisBy(trimHtmlTags(marked(comment.body)), 100);
  console.log(issueBody);
  console.log(commentBody);
  let user = issueCommentEvent.payload.comment.user;

  console.log(issueCommentEvent);

  content += '<a href="' + commentUrl + '" ' +
               ' class="comment-text-wrapper with-popover"' +
               ' target="_blank"' +
               ' data-template="' + id + '">comment</a>';

  div += '<div id="' + id + '" class="popover-container">' +
            '<div class="issue-title">' + issueTitle + '</div>' +
            '<div class="info-wrapper">' +
              '<span class="issue-state" style="background-color:' + stateColor + '">' +
              '<img src="' + iconUrl + '">' +
              state +
              '</span>' +
              '<span class="info-description">' + repoName + ' on ' + issueCreatedAt +'</span>' +
            '</div>' +
            '<div class="issue-body text-grey">' + issueBody + '</div>' +
            '<div class="divider"></div>' +
            '<div class="user-wrapper">' +
              '<div class="avatar-wrapper">' +
                '<img src="' + user.avatar_url + '">' +
              '</div>' +
              '<span class="username">' + user.login + '</span>' +
              '<span class="text-gray">commented</span>' +
            '</div>' +
            '<div class="issue-comment text-gray">' + commentBody + '</div>' +
         '</div>';
  return content + div;
}
