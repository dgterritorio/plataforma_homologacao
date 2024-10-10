const db = require(__basedir + 'modules/db/base');
const { parseMetadata } = require(__basedir + 'modules/requestUtils');

const queries = Object.freeze({
    6: {
        head: 'select * ',
        body: 'from producers.entity_states '
    },
    4: {
        head: 'select * ',
        body: 'from producers.entity_states '
    },
    5: {
        head: 'select * ',
        body: 'from producers.entity_states ',
        where: ' where id != -1 and user_id = $1',
        keys: ['userId']
    }
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
        const value = target.value;

        filters.push({
            property: 'intervening',
            operator: operator,
            value: value
        });

        if (value) {
            filters.push({
                property: 'finished',
                operator: 'eq',
                value: false
            });
        }
    }
}


async function getRequestInfo(params) {
    const userGroup = params.userGroup;

    if (!queries.hasOwnProperty(params.userGroup)) {
        return { error: 'Permission denied' };
    }

    let { head, body, where, keys } = queries[userGroup];
    const values = keys ? keys.map(k => params[k]) : [];

    preprocessFilter(params.filter, userGroup);

    const { paging, sorting, filters } = parseMetadata(params);

    if (where) {
        body += where;
    }

    if (filters.length) {
        body += where ? ' and ' + filters : ' where ' + filters;
    }

    const mainSql = head + body + sorting + paging;

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
            if (row.intervening === true && userGroup === 4) {
                row.must_intervene = true;

                // If user = applicant
            } else if (row.intervening === false && userGroup === 5) {
                row.must_intervene = true;

                // else set false
            } else {
                row.must_intervene = false;
            }
        });
    }

    return result;
}

export default async function (req, res, next) {
    console.log("> Request: Get all entities");
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