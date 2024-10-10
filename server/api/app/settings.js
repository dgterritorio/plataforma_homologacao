// const fs = require('fs');

export default function (req, res, next) {
  // req is the Node.js http request object

  // Read the settings file
  // const strConfigs = fs.readFileSync('./server/server-config.json', 'utf-8');
  //
  // const jsonConfigs = JSON.parse(strConfigs);

  // Get the title and service properties
  // let title = jsonConfigs.ClientConfig.title;

  let title = global.App.clientConfig.title;
  let version = global.App.version;

  // Send the result to client
  res.send({title: title, appVersion: version});
}
