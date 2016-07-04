var http = require('http');
function main() {
  http.get('http://www.google.com', function(res) {
    console.log(res);
  });
}
