const db = require(__basedir + 'modules/db/base');

function generalizeEvaluatorName(state){
    if(state.intervening){
        state.intervening_name = 'Avaliador';
    }

    state.last_intervening = '';
    state.last_intervening_email = '';
}

function findLastState(state) {
    let last;

    for (let j = state.length - 1; j >= 0; j--) {
        const s = state[j];

        if (!s.reverted) {
            last = s;

            break;
        }
    }

    return last;
}

// Cicles through states and expandes states that have a revert_to pointer
function expandStates(data) {
    const expandStates = [];

    for (let i = 0; i < data.length; i++) {
        const state = data[i];
        const code = state.code;

        // Remove Evaluator name from payload
        generalizeEvaluatorName(state);

        // Check if has a pointer to other state
        const revertTo = state.revert_to;

        // If has reverTo
        const hasRevertTo = revertTo !== null && !isNaN(revertTo) || code === 305;

        // const shouldExpand = (code === 300 || code === 305) && revertTo !== null && !isNaN(revertTo);

        // If it is a normal state
        if (!hasRevertTo) {
            // Push state
            expandStates.push(state);

            continue;
        }

        const isTypeChange = code === 301 || code === 302;
        const isRevert = code === 300;
        const isSuspend = code === 305;

        // If reverted
        if (isRevert) {
            // Search for it
            expandStates.splice(expandStates.length - 1, 1);
        }

        // If suspended
        if (isSuspend) {
            const last = findLastState(expandStates);

            // If not found
            if (!last) {
                console.log("[Error] Inconsistent state, could not find suspended state");
                continue;
            }

            // Initialize structure
            if (!last.hasOwnProperty('suspensions')) {
                last.suspensions = [];
            }

            // Set suspended state (can have multiple suspensions)
            last.suspensions.push(state);
            last.isSuspended = state.end_date === null;

            // If the last entry is suspended
            if (last.isSuspended) {
                last.color = 'orange';
            }
        }

        // If has type changes
        if (isTypeChange) {
            continue;
        }
    }

    return expandStates;
}

// Cicles through states and expandes states that have a revert_to pointer
// EValuator version
function expandStatesEvaluator(data) {
    const expandStates = [];

    for (let i = 0; i < data.length; i++) {
        const state = data[i];
        const code = state.code;

        // Check if has a pointer to other state
        const revertTo = state.revert_to;

        // If has reverTo
        const hasRevertTo = revertTo !== null && !isNaN(revertTo) || code === 305;

        // const shouldExpand = (code === 300 || code === 305) && revertTo !== null && !isNaN(revertTo);

        // If it is a normal state
        if (!hasRevertTo) {
            // Push state
            expandStates.push(state);

            continue;
        }

        const isTypeChange = code === 301 || code === 302;
        const isRevert = code === 300;
        const isSuspend = code === 305;

        // If reverted
        if (isRevert) {
            // Search for it
            const last = expandStates[expandStates.length - 1];

            // const revertToState = data.find(d => d.id === revertTo);
            last.reverted = true;
            last.color = 'red';

            // // Copy homologation changes
            // if (state.hasOwnProperty('homologationtypes')) {
            //     if (last.hasOwnProperty('homologationtypes')) {
            //         last.homologationtypes = last.homologationtypes.concat(state.homologationtypes)
            //     } else {
            //         last.homologationtypes = state.homologationtypes;
            //     }

            //     delete state.homologationtypes;
            // }

            // // COpy regime changes
            // if (state.hasOwnProperty('regimetypes')) {
            //     if (last.hasOwnProperty('regimetypes')) {
            //         last.regimetypes = last.regimetypes.concat(state.regimetypes)
            //     } else {
            //         last.regimetypes = state.regimetypes;
            //     }

            //     delete state.regimetypes;
            // }
        }

        // If suspended
        if (isSuspend) {
            const last = findLastState(expandStates);

            // If not found
            if (!last) {
                console.log("[Error] Inconsistent state, could not find suspended state");
                continue;
            }

            // Initialize structure
            if (!last.hasOwnProperty('suspensions')) {
                last.suspensions = [];
            }

            // Set suspended state (can have multiple suspensions)
            last.suspensions.push(state);
            last.isSuspended = state.end_date === null;

            // If the last entry is suspended
            if (last.isSuspended) {
                last.color = 'orange';
            }
        }

        // If has type changes
        if (isTypeChange) {
            const last = findLastState(expandStates);

            // If not found
            if (!last) {
                console.log("[Error] Inconsistent state, could not find suspended state");
                continue;
            }

            // Initialize structure
            if (code === 301) {
                if (!last.hasOwnProperty('homologationtypes')) {
                    last.homologationtypes = [];
                }

                last.homologationtypes.push(state)
            }

            if (code === 302) {
                if (!last.hasOwnProperty('regimetypes')) {
                    last.regimetypes = [];
                }

                last.regimetypes.push(state)
            }
        }
    }

    return expandStates;
}

async function getRequestInfo(params) {
    let result;
    let userGroup = params.userGroup;

    if (params.userGroup === 2) {
        // Check if we have permission for state transition
        result = await db.query('select * from homologation.requests where applicant_id = $1 and id = $2', [params.userId, params.requestId]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data.length) {
            return { data: [], error: null, total: 0 };
        }
    }

    let sql = "select * from homologation.get_request_states(" + params.requestId + ") order by ord asc;";

    result = await db.query(sql);

    if (result.error) {
        throw 'Error: could not query states';
    }

    const data = result.data;

    const isEvaluator = (userGroup === 4 || userGroup === 6);

    // Cicle through states and duplicate when revert_to is not null
    const expandedData = isEvaluator ? expandStatesEvaluator(data) : expandStates(data);

    return { data: expandedData, error: result.error, total: expandedData.length };
}

export default async function (req, res, next) {
    console.log("> State: Get all");

    try {
        const body = req.body;

        const user = res.locals.user;
        const userGID = user.group;

        const params = {
            requestId: body.requestId,
            userId: user.id,
            userGroup: user.group
        };

        let result = await getRequestInfo(params);

        if (!result || result.error) {
            throw result.error;
        }


        result.data.forEach(function (row) {

            if (userGID === 4) {
                row.description = row.evaluator_description;
            } else {
                row.description = row.applicant_description;
            }

            // If user = evaluator
            if (row.intervening && userGID === 4) {
                row.must_intervene = true;

                // If user = applicant
            } else if (!row.intervening && userGID === 2) {
                row.must_intervene = true;

                // else set false
            } else {
                row.must_intervene = false;
            }
        });

        res.send(result);
    } catch (e) {
        next(e);
    }
}