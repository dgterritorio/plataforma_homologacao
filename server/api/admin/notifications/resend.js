const emails = require(__basedir + 'modules/emails/main');

async function getRequestInfo(params) {
    return await emails.resend(params);
}

export default async function (req, res, next) {
    console.log("> Request: Get document");
    try {
        const user = res.locals.user;

        const userId = user.id;
        const userGroup = user.group;

        const body = req.body;

        const params = {
            userId: userId,
            userGroup: userGroup,
            emailId: body.emailId
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        res.send({ data: result.data, error: null, total: result.total });
    } catch (e) {
        next(e);
    }
}