const db = require(__basedir + 'modules/db/base');

export default async function (req, res, next) {
  // req is the Node.js http request object
  const mapId = req.body.mapId;

  // Query all layers
  const sql = 'SELECT * from webapp.mapcfgs where map_id = ' + mapId;

  const result = await db.query(sql); 

  if (result.error) {
    res.send(result);
  }

  // Send the result to client
  res.send({ error: null, data: result.data });
}
