const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

const queries = Object.freeze({
    6: {
        head: 'select *, false as is_evaluation_owner ',
        body: 'from homologation.request_states '
    },
    4: {
        head: 'select *, false as is_evaluation_owner ',
        body: 'from homologation.request_states '
    },
    2: {
        head: 'select *, false as is_evaluation_owner ',
        body: 'from homologation.request_states ',
        where: ' where applicant_id = $1 ',
        keys: ['userId']
    },
    1: {
        head: 'select *, false as is_evaluation_owner ',
        body: 'from homologation.request_states '
    },
});


function preprocessFilter(filters, userGroup) {

    if (!filters) { return; }

    const idx = filters.findIndex(function (item) {
        return item.property === 'must_intervene';
    });

    if (idx > -1) {
        const target = filters[idx];

        filters.splice(idx, 1);

        const operator = target.operator;

        let value,
            testFinished;

        if (userGroup === 2) {
            value = target.value ? false : true;
            testFinished = !value;
        } else if (userGroup === 4 || userGroup == 6) {
            value = target.value ? true : false;
            testFinished = value;
        }

        filters.push({
            property: 'intervening',
            operator: operator,
            value: value
        });

        if (testFinished) {
            filters.push({
                property: 'finished',
                operator: 'eq',
                value: false
            });
        }
    }
}

function preprocessOrdering(params, userGroup) {
    if (params.sortBy && params.sortBy === 'must_intervene') {
        params.sortBy = 'intervening';
    }
}


async function getRequestInfo(params) {
    const userId = params.userId;
    const userGroup = params.userGroup;

    let { head, body, where, keys } = queries[userGroup];
    const values = keys ? keys.map(k => params[k]) : [];

    /**
     * Preprocess filters/ordering to account with must_intervene property
     */
    preprocessFilter(params.filter, userGroup);

    preprocessOrdering(params, userGroup);

    const { paging, sorting, filters } = parseMetadata(params);

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

    console.log(mainSql)

    let result = await db.query(mainSql, values);

    if (params.limit) {

        let count = await db.query("select count(*) as total " + body, values);

        if (count.hasOwnProperty('data') && count.data.length) {
            let total = parseInt(count.data[0].total);

            result.total = total;
        }
    } else {
        result.total = result.data.length;
    }

    // Set the must_intervene flag
    if (!result.error) {
        result.data.forEach(function (row) {

            if (userGroup === 4 || userGroup === 6) {
                row.description = row.evaluator_description;
            } else {
                row.description = row.applicant_description;
            }

            // If user = evaluator
            if (row.finished) {
                row.must_intervene = false;
            } else if (row.intervening && userGroup === 4) {
                row.must_intervene = true;

                // If user = applicant
            } else if (!row.intervening && userGroup === 2) {
                row.must_intervene = true;

                // else set false
            } else {
                row.must_intervene = false;
            }

            // Set evaluation owner
            row.is_evaluation_owner = row.evaluation_owner_id === userId;
            row.requires_evaluation_owner = !row.evaluation_owner_id;

            if (userGroup === 2) {
                delete row.expenses;
                delete row.evaluation_owner_id;
                
                row.evaluation_owner_name = 'Avaliador';

                row.show_evaluator = false;
                row.show_type = false;
            } else {
                row.show_evaluator = true;
                row.show_type = true;
            }
        });
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get all requests");
    try {
        const user = res.locals.user;

        const userId = user.id;
        const userGroup = user.group;

        const body = req.body;

        const params = {
            userId: userId,
            userGroup: userGroup,
            limit: body.limit,
            start: body.start,
            sortBy: body.sortBy,
            sortOrder: body.sortOrder,
            filter: body.filter
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