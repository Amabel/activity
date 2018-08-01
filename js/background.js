// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Set up google analytics
var _gaq = _gaq || [];
// let trackID = 'UA-122329936-3'; // for test
let trackID = 'UA-122329936-4'; // for production
_gaq.push(['_setAccount', trackID]);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Receive events from content script and push to ga
chrome.runtime.onMessage.addListener(function( request, sender, sendResponse ) {
  _gaq.push(['_trackEvent', request.eventCategory, request.eventAction]);
});

function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

function GITHUB_API_ENDPOINT() {
  return 'https://api.github.com';
}
