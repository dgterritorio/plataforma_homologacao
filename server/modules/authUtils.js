

function authenticateUser(req) {
    if (req.session && req.session.userid) {
        return {
            id: req.session.userid,
            group: req.session.groupid,
            memberof: req.session.memberof,
            profiles: req.session.profiles,
            preferences: req.session.preferences,
            sessionId: req.session.id
        }
    } else {
        return null;
    }
}

function destroySession(session) {
    return new Promise(function (resolve, reject) {
        session.destroy(function (error) {
            if (error) {
                return reject();
            }

            resolve();
        })
    });
}


module.exports = {
    authenticateUser: authenticateUser,
    destroySession: destroySession
}