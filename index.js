let app = require('./server');

// start server
app.listen(process.env.PORT, () => {
  console.log('hovercraftAP is listening on port ' + process.env.PORT + '!');
});
