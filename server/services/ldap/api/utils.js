const passport = require('passport')

// Async passport.authenticate
function authenticate(strategy, params) {
    const { username, password } = params;

    return new Promise((resolve, reject) => {
        passport.authenticate(strategy, (err, user, info) => {
            const error = err;

            if (error) {
                return reject(error);
            }

            if (!info) {
                resolve(user);
            } else {
                resolve(null);
            }

        })({ body: { username, password } });
    });
}

// Converts host group info to local
function parseUserGroup(value, host, local, groupCfg) {
    const {
        ckey,
        cdefault,
        cmap
    } = groupCfg;

    console.log("> parsing ldap group: ", value);

    // If the attr is the group_id
    // Check if the host user has a memberOf property
    const memberOf = [value];//host.hasOwnProperty('memberOf') ? [].concat(host.memberOf) : null;

    // Set configured default group
    // local[ckey] = cdefault;

    console.log("> presetting webapp group to: ", cdefault);

    // both the properties exist
    if (memberOf && cmap) {
        console.log("> checking if ldap group can be converted", memberOf, cmap);

        // Search for the host group_id
        const hostGroupKeys = Object.keys(cmap);

        // For each host group id's, check if any is included in the host/local group mapping
        for (let i = 0; i < hostGroupKeys.length; i++) {
            const hostGroupKey = hostGroupKeys[i];

            // If exists, map
            if (memberOf.includes(hostGroupKey)) {
                local[ckey] = cmap[hostGroupKey];

                console.log("> converted ldap group to webapp: ", cmap[hostGroupKey]);
            }
        }
    }

    console.log("> ----- ")
}


function parseUserMembership(value, host, local, membershipCfg, profileCfg) {
    const {
        key: ckey,
        default: cdefault,
        map: cmap
    } = membershipCfg;

    console.log("> parsing ldap membership: ", value);

    let memberships;

    console.log("> checking if ldap membership can be converted", value, cmap);

    // TODO: testar se hostValue é array ou nao
    if (value && cmap.hasOwnProperty(value)) {
        const localValue = cmap[value];

        // TODO: provavelmente temos de remover repetições
        memberships = cdefault.concat([localValue]);

        console.log("> memberships converted", value, memberships);
    } else {
        // memberships = cdefault;

        console.log("> memberships set to default", value, memberships);
    }

    local[ckey] = memberships;


    let profiles = {};

    memberships.forEach(function (ms) {
        profiles[ms] = profileCfg.default;
    });

    local[profileCfg.key] = profiles;

    console.log("> profiles set to ", profiles);
    console.log("> ----- ")
}

// Map host user attributes to local user
function parseUser(hostUser, config) {
    const {
        host,
        attributeMap,
        groupMap,
        groupKey,
        groupDefault,
        memberships,
        profiles
    } = config;

    const localUser = { "host": host };
    const localGroupKey = groupKey;
    const localMembershipKey = memberships ? memberships.key : null;
    const localProfileKey = profiles ? profiles.key : null;

    console.log("> parsing user: ", localGroupKey, memberships, profiles);


    // set default group
    localUser[localGroupKey] = groupDefault;

    // set default memberships
    if (memberships) {
        localUser[memberships.key] = memberships.default;
        localUser[profiles.key] = memberships.default.reduce(function (acc, curr) {
            acc[curr] = profiles.default;

            return acc;
        }, {});
    }

    // Map all host attributes into local user
    for (let hostAttr in attributeMap) {

        // If the attr is not required, skip
        if (!hostUser.hasOwnProperty(hostAttr)) {
            console.log(" Skipping attribute: ", hostAttr);
            continue;
        }

        const hostValue = hostUser[hostAttr];

        const localAttr = attributeMap[hostAttr];

        console.log("> processing key :", hostAttr, ' value: ', hostValue, ' converted key: ', localAttr);

        // If it's group attr
        if (localAttr === localGroupKey) {
            // convert host -> local
            parseUserGroup(hostValue, hostUser, localUser, {
                ckey: groupKey,
                cdefault: groupDefault,
                cmap: groupMap,
            })

            // If it's membership attr
        } else if (localMembershipKey && localAttr === localMembershipKey) {

            // convert host -> local
            parseUserMembership(hostValue, hostUser, localUser, memberships, profiles);

            // Else we accept any key, as long as it's not the membership profiles key
        } else if(!localProfileKey || localProfileKey && localAttr !== localProfileKey) {
            // direct map
            localUser[localAttr] = hostValue;
        }
    }

    console.log("> end: ", localUser);
    console.log("> ----- ")

    return localUser;
}

module.exports = {
    parseUser: parseUser,
    authenticate: authenticate
}