const db = require(__basedir + 'modules/db/base');
const redis = require("redis");
const redisClient = redis.createClient();

// Searchs for session_id and delete keys from rows
async function deleteSessionKeys(rows) {
  for (let i = 0; i < rows.length; i++) {
    const { session_id } = rows[i];

    console.log(">   terminating session: ", session_id);

    redisClient.del(`sess:${session_id}`);
  }
}

/**
 * Updates user sessions to ativo = false and removes the respective redis keys
 * @param {*} params 
 * @returns 
 */
async function deleteActiveSessions(params) {
  const { user_id } = params;

  console.log("> deleting sessions for user: ", user_id);

  let res = await db.query('update webapp.sessions set ativo = false, logout = now() where user_id = $1 and ativo = true returning session_id', [user_id]);


  if (res.error) {
    throw res.error;
  }

  const sessions = res.data;

  deleteSessionKeys(sessions);

  return sessions;
}

module.exports = {
  deleteActiveSessions,
}