function parseFilterType(filter) {
  const property = filter.property,
    operator = filter.operator,
    value = filter.value,
    type = filter.type;

  let condition;

  switch (type) {
    case 'date':
      const timezoneOffset = property === 'timezoneOffset' ? value : 0;

      const date = new Date(value);

      date.setMinutes(date.getMinutes() + timezoneOffset);

      const dopt = {
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };

      const timestamp = 'to_timestamp(\'' + date.toLocaleString('en-GB', dopt) + '\', \'MM/DD/YYYY, HH24:MI:SS\')';

      if (operator === 'gt') {
        condition = property + " > " + timestamp;
      } else if (operator === 'gteq') {
        condition = property + " >= " + timestamp;
      } else if (operator === 'lt') {
        condition = property + " < " + timestamp;
      }
      // else if (operator === 'lteq') {
      //   condition = property + " <= " + timestamp;
      // }
      else {
        condition = "date_trunc('day', " + property + ")" + " = '" + value + "'";
      }

      break;
    case 'dateyear':
      if (operator === 'gt') {
        condition = "EXTRACT(year FROM " + property + ")" + " > '" + value + "'";
      } else if (operator === 'gteq') {
        condition = "EXTRACT(year FROM " + property + ")" + " >= '" + value + "'";
      } else if (operator === 'lt') {
        condition = "EXTRACT(year FROM " + property + ")" + " < '" + value + "'";
      } else if (operator === 'lteq') {
        condition = "EXTRACT(year FROM " + property + ")" + " <= '" + value + "'";
      }
      else {
        condition = "EXTRACT(year FROM " + property + ")" + " = '" + value + "'";
      }
      break;
    default:
      break;
  }

  return condition;
}



function parseFilterOperator(filter) {
  const property = filter.property,
    operator = filter.operator,
    value = filter.value;

  let condition;

  switch (operator) {
    case 'is':
      condition = property + " is " + value;
      break;
    case 'isnot':
      condition = property + " is not " + value;
      break;
    case '==':
      condition = property + " = " + value;
      break;
    case 'eq':
      condition = property + " = '" + value + "'";
      break;
    case 'lt':
      condition = property + " < '" + value + "'";
      break;
    case 'gt':
      condition = property + " > '" + value + "'";
      break;
    case 'lteq':
      condition = property + " <= '" + value + "'";
      break;
    case 'gteq':
      condition = property + " >= '" + value + "'";
      break;
    case 'like':
      condition = property + " ILIKE '%" + value + "%'";
      break;
    case 'likein':
      condition = "array_to_string(" + property + ", ',') ilike '%" + value + "%'";
      break;
    case 'noteq':
      condition = property + " != '" + value + "'";
      break;
    case 'bboxin':
      if (Array.isArray(value) && value.length === 4) {

        condition = "ST_MakeEnvelope (" + value.toString() + ") ~ " + property;
      }

      break;
    case 'in':
      if (Array.isArray(value) && value.length) {
        condition = property + " IN (" + value.toString() + ")";
      }

      break;
    default:
      break;
  }

  return condition;
}



/**
 * 
 * @param {*} filters 
 */
function parseFilters(filters) {
  const conditions = [];

  // console.log("> Processing query filters...");

  // If not array or array len = 0
  if (!Array.isArray(filters) || !filters.length) {

    // console.log("...done");
    return '';
  }


  for (let i = 0; i < filters.length; i++) {

    const filter = filters[i];

    // console.log("Processing filter: ", filter);

    if (!filter.hasOwnProperty('property') ||
      !filter.hasOwnProperty('value') ||
      !filter.hasOwnProperty('operator')) {

      // console.log("   Skipping filter: ", filter);
      continue;
    }

    let condition;

    /**
     * If filter has type
     */
    if (filter.hasOwnProperty('type')) {
      condition = parseFilterType(filter);
    } else {
      condition = parseFilterOperator(filter);
    }

    if (condition) {
      conditions.push(condition);
    }
  }

  // console.log("...done");

  return conditions.join(" AND ");
}

/**
 * Retrieves keys from a json object
 * @param {*} received 
 * @param {*} model 
 */
function parseMetadata(params) {
  let paging = '', sorting = '', filters = '';

  try {
    if (params.hasOwnProperty('limit') && Number.isInteger(params.limit)) {// !== undefined) {

      paging = ' limit ' + params.limit;

      if (params.hasOwnProperty('start') && Number.isInteger(params.start)) {// !== undefined) {
        paging += ' offset ' + params.start;
      }
    }

    if (params.hasOwnProperty('sortBy') && params.sortBy !== undefined) {
      const { sortBy, sortOrder } = params;

      // check type of sortBy is array
      if (Array.isArray(sortBy) && Array.isArray(sortOrder) && sortBy.length && sortBy.length === sortOrder.length) {

        sorting = ' order by ' + sortBy.map(function (s, i) {
          return `"${s}" ${sortOrder[i] ? ' asc ' : ' desc '}`
        }).join(',');

        // check sortby is a string (single sort)
      } else if (typeof sortBy === 'string') {
        sorting = ' order by ' + params.sortBy;

        if (params.hasOwnProperty('sortOrder')) {
          sorting += params.sortOrder ? ' asc' : ' desc';
        }
      }
    }

    if (params.hasOwnProperty('filter') && params.filter !== undefined) {
      filters = parseFilters(params.filter)
    }

  } catch (e) {
    console.log("[Error] parsing request metadata...")
  }

  return { paging, sorting, filters };
}


/**
 * Retrieves keys from a json object
 * @param {*} received 
 * @param {*} model 
 */
function parseData(received, model) {
  const data = {};

  model.forEach(function (key) {
    if (received[key] === 'null') {
      data[key] = null;
    } else if (received[key] === 'false') {
      data[key] = false;
    } else if (received[key] === 'true') {
      data[key] = true;
    } else if (received[key] !== undefined) {
      data[key] = received[key];
    } else {
      data[key] = null;
    }
  });

  return data;
}

function parseDataArr(arr, model) {
  const result = [];

  arr.forEach(function (r) {
    const parsed = parseData(r, model);

    result.push(parsed);
  });

  return arr;
}

/**
 * Returns req.body values based on a signature
 * @param {*} body 
 * @param {*} signature 
 */
function parseSignature(body, signature) {

  const params = {};

  for (let i = 0; i < signature.length; i++) {

    const key = signature[i];

    // Test if has key
    if (!body.hasOwnProperty(key)) {
      return null;
    }

    params[key] = body[key];
  }

  return params;
}


module.exports = {
  parseData: parseData,
  parseDataArr: parseDataArr,
  parseMetadata: parseMetadata
}