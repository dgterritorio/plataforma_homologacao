const db = require(__basedir + 'modules/db/base');

async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;


    // If user is not evaluator or inspector, filter
    const doFilter = userGroup !== 4 && userGroup !== 6;

    const values = doFilter ? [userId] : [];

    let mainSql = 'with ';
    mainSql += ' total_count as ( '
    mainSql += '    select count(*) n from homologation.request_states r ' + (doFilter ? ' where applicant_id = $1 ' : '')
    mainSql += ' ), finished_count as ( '
    mainSql += '     select count(*) n from homologation.request_states r where code >= 56 ' + (doFilter ? ' and applicant_id = $1 ' : '')
    mainSql += ' ), ongoing_count as ( '
    mainSql += ' select count(*) n from homologation.request_states r where code < 56 and code >= 0 ' + (doFilter ? ' and applicant_id = $1' : '')
    mainSql += ' ) '
    mainSql += ' select t.n as total, f.n as finished, o.n as ongoing '
    mainSql += ' from total_count t, finished_count f, ongoing_count o;';


    // console.log("> " + mainSql)

    let result = await db.query(mainSql, values);

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get request counts");
    try {
        const user = res.locals.user;

        const userId = user.id;
        const userGroup = user.group;

        const body = req.body;

        const params = {
            userId: userId,
            userGroup: userGroup,
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }

        const data = result.data[0];

        res.send({ data: data, error: null, total: 1 });
    } catch (e) {
        next(e);
    }
}