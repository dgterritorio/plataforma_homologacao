const base = require(__basedir + 'modules/db/base');


function parseRoute(current, parent) {
  const route = current.route;
  const parentRoute = parent ? parent.route : '';

  const isParameterized = route.indexOf(':') > -1;

  if (isParameterized) {
    const routeParts = route.split(':');
    const routePrefix = routeParts[0];

    current.fullroute = parentRoute + '/' + routePrefix;
    current.route = routePrefix;

  } else {

    // TODO: Improve this
    if (route.length === 1 && route.indexOf('/') > -1) {
      current.fullroute = parentRoute + '/';
    } else {
      current.fullroute = parentRoute + '/' + route;
    }
  }

  current.parameterized = isParameterized
}

function unflatten(arr) {
  let tree = [],
    mappedArr = {};

  // First map the nodes of the array to an object -> create a hash table.
  arr.forEach(function (arrEl) {

    mappedArr[arrEl.id] = arrEl;
    mappedArr[arrEl.id]['children'] = [];

    if (isNaN(mappedArr[arrEl.id].ord)) {
      mappedArr[arrEl.id].ord = Number.MAX_SAFE_INTEGER;
    }
  })

  // Current route
  let current;

  for (let currentId in mappedArr) {

    if (mappedArr.hasOwnProperty(currentId)) {
      current = mappedArr[currentId];

      const parentId = current['parent'];

      // If the element is at the root level, add it and continue.
      if (isNaN(parentId) || parentId === null) {
        parseRoute(current, null);

        tree.push(current);

        continue;
      }

      // Mishandling menu permissions may cause this
      if (!mappedArr.hasOwnProperty(parentId)) {

        console.log("> Discarding route, parent not present..");
        continue;
      }

      const parent = mappedArr[parentId];

      parseRoute(current, parent);

      mappedArr[parentId]['children'].push(current);

      mappedArr[parentId]['children'].sort(function (a, b) {
        return a.ord > b.ord
      });
    }
  }

  tree.sort(function (a, b) {
    return a.ord > b.ord;
  });

  return tree;
}

function getRoutes(arr) {
  let routes = [];

  arr.forEach(function (menuEntry) {

    const base = '/' + menuEntry.route;

    if (menuEntry.hasOwnProperty('children') && menuEntry.children.length) {

      const childs = menuEntry.children;

      const subEntries = getRoutes(childs);

      routes = subEntries.map(function (entry) {
        return base + entry;
      }).concat(routes);
    } else {
      routes.push(base);
    }
  });

  return routes;
}

export async function read(params) {
  console.log('\n[NavigationTree.read]');

  let sql = '';
  let values = [];

  if (params.hasOwnProperty('userid') && (parseInt(params.userid) > 0)) {
    sql += 'select m.*, NOT EXISTS (select * from webapp.menus inm where inm.parent = m.id) leaf ';
    sql += 'from webapp.menus m ';
    sql += 'where m.id IN (select distinct menu_id from webapp.permissions p, webapp.users u '; // ' + profile + ' and
    sql += 'where (p.group_id = u.group_id or p.group_id = 0) and u.id = $1 )'; // and (client IS NULL)  or client = '" + global.App.serverConfig.client + "' 

    values.push(params.userid);
  } else {
    sql += 'select m.*, NOT EXISTS (select * from webapp.menus inm where inm.parent = m.id) leaf ';
    sql += 'from webapp.menus m ';
    sql += 'where m.id IN (select menu_id from webapp.permissions p where p.group_id = 0 )'; //and (client IS NULL) ' + profile + " and  // or client = '" + global.App.serverConfig.client + "'
  }
  sql += 'order by m.id ';

  const result = await base.query(sql, values);

  if (result.error) {
    return result;
  }

  let tree,
    routes;

  tree = unflatten(result.data);

  routes = getRoutes(tree);

  return {
    data: {
      tree: tree,
      // flat: result.data,
      routes: routes
    },
    total: 0
  };
}

export default async function (req, res, next) {
  try {
    const params = req.body;

    const user = res.locals.user;

    if (user) {
      params['userid'] = user.id;
    }

    const result = await read(params);

    if (result.error) {
      throw 'Error fetching routes';
    }

    // next({ status: 500, message: 'Internal Server Error' });

    res.send(result);
  } catch (e) {
    next({ status: 500, message: 'Internal Server Error' });
  }
}
