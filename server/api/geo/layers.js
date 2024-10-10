const db = require(__basedir + 'modules/db/base');

export default async function (req, res, next) {
  // req is the Node.js http request object
  const service = req.body.service;
  const mapId = req.body.mapId;

  // Query all layers
  const sql = 'SELECT * from webapp.layers where menu_id = ' + mapId;

  const result = await db.query(sql, [], false, service); 

  if (result.error) {
    res.send(result);
  }

  const flat_layers = result.data;
  const layers = [];

  for (let i = 0; i < flat_layers.length; i++) {
    const l = flat_layers[i];

    layers.push({
      title: l.title,
      layer: l.layer,
      url: l.url,
      service: l.service
    })
  }

  // Send the result to client
  res.send({ error: null, layers: layers });
}
