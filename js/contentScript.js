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
  showContentsInOrganizationPage();
});

function validateAccessToken(accessToken) {
  // if verified, returns the user info
  $.ajax({
    url: GITHUB_API_ENDPOINT + '/user?access_token=' + accessToken,
    dataType: 'json',
    success: function(data) {
      addInfoToMainContainer(data);
      getUserOrganizations();
      setInterval(function() { getActivities(true, addContentsToActivityContentDiv)}, 5000);
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}

function showContentsInOrganizationPage() {
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

function getUserOrganizations() {
  let url = GITHUB_API_ENDPOINT + '/user/orgs' + '?access_token=' + accessToken;
  $.ajax({
    url: url,
    dataType: 'json',
    success: function(orgsJson) {
      let orgsName = [];
      let myOrgs = eval(orgsJson);
      $.each(myOrgs, function(index, myOrg) {
        orgsName.push(myOrg.login);
      });
      createGetActivitiesEndpoint(isUserInCurrentOrganization(orgsName));
      getActivities(false, addContentsToActivityContentDiv);
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}

function isUserInCurrentOrganization(orgs) {
  return $.inArray(orgName, orgs) > -1;
}

function createGetActivitiesEndpoint(userIsInCurrentOrganization) {
  getActivitiesEndpoint = userIsInCurrentOrganization
  ? GITHUB_API_ENDPOINT + '/users/' + username + '/events/orgs/' + orgName + '?access_token=' + accessToken
  : GITHUB_API_ENDPOINT + '/orgs/' + orgName + '/events';
}

function getActivities(removeDiv, callback) {
  // Google analytics
  // chrome.runtime.sendMessage({eventCategory: 'orgnizationPage', eventAction: 'getActivities'});
  if (typeof getActivitiesEndpoint != 'undefined') {
    $.ajax({
      url: getActivitiesEndpoint,
      dataType: 'json',
      success: function(data) {
        callback(data, removeDiv);
      },
      error: function(error) {
        console.log(JSON.stringify(error));
      }
    })
  }
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
    case 'WatchEvent':
      contentDiv += getWatchEventTypeContent(activity);
      break;
    case 'ForkEvent':
      contentDiv += getForkEventTypeContent(activity);
      break;
    default:
      unsupportedActivityNum ++;
      console.log('unsupported type: ' + activityType);
  }
  return contentDiv;
}
