const https = require('https');
const options = {
  hostname: 'specter-ai-taupe.vercel.app',
  path: '/api/notebooks',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://specter-ai-frontend-coed1gg6i-rexjumawid-7631s-projects.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
};
const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});
req.end();
