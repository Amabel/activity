GITHUB_API_ENDPOINT = 'https://api.github.com';

$('#token-submit').validator()

$('#token-submit').submit(function() {
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
    },
    error: function(error) {
      console.log(JSON.stringify(error));
    }
  })
}
