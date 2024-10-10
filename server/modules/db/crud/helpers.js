const parseMetadata = function (params) {
    const meta = {
        table: '',
        pkey: 'id',
        geomColumn: 'wkb_geometry',
    };

    // If we are fechting metadata from multiple inserts, delete, uptates
    const metaContainer = Array.isArray(params) && params.length ? params[0] : params;

    // Get the target table
    if (metaContainer.hasOwnProperty('defaultTable')) {
        meta["table"] = metaContainer.defaultTable;

        delete metaContainer.defaultTable;
    } else {
        return null;
    }

    // Get the primary key
    if (metaContainer.hasOwnProperty('pkey')) {
        meta['pkey'] = metaContainer.pkey;

        delete metaContainer.pkey;
    }

    // Get the geometry column
    if (metaContainer.hasOwnProperty('geomColumn')) {
        meta['geomColumn'] = metaContainer.geomColumn;

        delete metaContainer.geomColumn;
    }

    return meta;
};

const parseFilters = function (params) {
    const condicoes = [];

    if (params.hasOwnProperty('filter') && params.filter.length) {
        const filters = params.filter;

        console.log('Exitem filtros:' + JSON.stringify(filters));
        console.log('filtros.length: ' + filters.length);

        var timezoneOffset = 0;

        for (var k = 0; k < filters.length; k++) {
            if (filters[k].type) {
                if (params.filter[k].property === 'timezoneOffset') {
                    timezoneOffset = params.filter[k].value;
                    console.log('timezoneOffset: ' + timezoneOffset);
                    continue;
                }

                console.log('Filtrar por ' + filters[k].property + ' do tipo ' + filters[k].type);
                switch (filters[k].type) {
                    case 'string':
                        // console.log('filtro sobre o tipo: ' + filters[k].type + ' com o valor ' + filters[k].value);
                        //condicoes.push(filters[k].property + " ilike '%" + filters[k].value + "%'");
                        condicoes.push(filters[k].property + " = '" + filters[k].value + "'");
                        break;
                    case 'date':
                        // console.log('filtro sobre o tipo: ' + params.filter[k].type + ' com o valor ' + params.filter[k].value);
                        var dte = new Date(params.filter[k].value);
                        dte.setMinutes(dte.getMinutes() + timezoneOffset);
                        // console.log(dte);
                        var dopt = {
                            hour12: false,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        };
                        var datefltr = 'to_timestamp(\'' + dte.toLocaleString('en-GB', dopt) + '\', \'MM/DD/YYYY, HH24:MI:SS\')';
                        if (params.filter[k].operator && params.filter[k].operator === 'gt') {
                            condicoes.push(params.filter[k].property + " >= " + datefltr);
                        } else if (params.filter[k].operator && params.filter[k].operator === 'lt') {
                            condicoes.push(params.filter[k].property + " <= " + datefltr);
                        } else {
                            condicoes.push("date_trunc('day', " + params.filter[k].property + ') ' + " = " + " '" + params.filter[k].value + "'");
                        }
                        break;
                    case 'dateyear':
                        // console.log('filtro sobre o tipo: ' + filters[k].type + ' com o valor ' + filters[k].value);
                        condicoes.push("EXTRACT(year FROM " + filters[k].property + ") = '" + filters[k].value + "'");
                        break;
                    case 'numeric':
                    case 'number':
                        // console.log('filtro sobre o tipo: ' + filters[k].type + ' com o valor ' + filters[k].value);
                        condicoes.push(filters[k].property + ' ' + " = " + ' ' + filters[k].value);
                        break;
                    default:
                        console.log('filtro inesperado sobre o tipo: ' + filters[k].type);
                        break;
                }
            } else {
                if (filters[k].operator) {
                    console.log('Filtrar por ' + filters[k].property + ' com o operador ' + filters[k].operator);
                    switch (filters[k].operator) {
                        case '==':
                            condicoes.push(filters[k].property + " = " + filters[k].value + "");
                            break;
                        case 'eq':
                            condicoes.push(filters[k].property + " = '" + filters[k].value + "'");
                            break;
                        case 'lt':
                            condicoes.push(filters[k].property + " < '" + filters[k].value + "'");
                            break;
                        case 'gt':
                            condicoes.push(filters[k].property + " > '" + filters[k].value + "'");
                            break;
                        case 'like':
                            condicoes.push(filters[k].property + " ILIKE '%" + filters[k].value + "%'");
                            break;
                        case 'noteq':
                            condicoes.push(filters[k].property + " != '" + filters[k].value + "'");
                            break;
                        case 'bboxin':
                            if (Array.isArray(filters[k].value) && filters[k].value.length === 4) {

                                let bbox = filters[k].value;

                                // "ST_MakeEnvelope (" + bbox.toString() + ") ~ " + filters[k].property
                                condicoes.push("ST_MakeEnvelope (" + bbox.toString() + ") ~ " + filters[k].property);
                            } else {
                                console.log('filtro inesperado com o operador: ' + filters[k].operator + ' e array invalido');
                            }
                            break;
                        case 'in':
                            if (Array.isArray(filters[k].value) && filters[k].value.length) {
                                condicoes.push(filters[k].property + " IN (" + filters[k].value.toString() + ")");
                            } else {
                                console.log('filtro inesperado com o operador: ' + filters[k].operator + ' e array invalido');
                            }
                            break;
                        default:
                            console.log('filtro inesperado com o operador: ' + filters[k].operator);
                            break;
                    }
                }
            }
        }
    }

    const filters = condicoes.join(" AND ");

    return filters ? 'WHERE ' + filters : '';
};

const parseSort = function (params) {
    let order = '';

    if (params.sort) {
        const s = params.sort[0];

        order = ' ORDER BY ' + s.property + ' ' + s.direction;
    } else {
        if (params.defaultSortColumn) {
            order = ' ORDER BY ' + params.defaultSortColumn;
            if (params.defaultSortDirection) {
                order += ' ' + params.defaultSortDirection;
            }
        }
    }

    return order;
};

const parsePaging = function (params) {
    let paging = '';

    if (params.hasOwnProperty('limit'))
        console.log('params.limit: ' + params.limit);
    if (params.hasOwnProperty('start'))
        console.log('params.start: ' + params.start);

    if (params.hasOwnProperty('limit') && params.hasOwnProperty('start')) {
        console.log('params.limit: ' + params.limit);
        console.log('params.start: ' + params.start);
        paging = ' LIMIT ' + params.limit + ' OFFSET ' + params.start;
    }

    return paging;
};

module.exports = {
    parseMetadata: parseMetadata,
    parsePaging: parsePaging,
    parseSort: parseSort,
    parseFilters: parseFilters
}