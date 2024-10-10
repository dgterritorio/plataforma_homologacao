const routes = Object.freeze([
    { path: '/api/settings', handler: '~/server/api/app/settings.js' },

    { path: '/api/layers/getall', handler: '~/server/api/geo/layers/getall.js' },

    { path: '/api/admin/users/getall', handler: '~/server/api/admin/users/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/users/create', handler: '~/server/api/admin/users/create.js', "auth": true, levels: [1] },
    { path: '/api/admin/users/update', handler: '~/server/api/admin/users/update.js', "auth": true, levels: [1] },
    { path: '/api/admin/users/delete', handler: '~/server/api/admin/users/delete.js', "auth": true, levels: [1] },

    { path: '/api/admin/sessions/getall', handler: '~/server/api/admin/sessions/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/sessions/update', handler: '~/server/api/admin/sessions/update.js', "auth": true, levels: [1] },

    { path: '/api/admin/memberships/getall', handler: '~/server/api/admin/memberships/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/memberships/create', handler: '~/server/api/admin/memberships/create.js', "auth": true, levels: [1] },
    { path: '/api/admin/memberships/delete', handler: '~/server/api/admin/memberships/delete.js', "auth": true, levels: [1] },

    { path: '/api/admin/membershipprofiles/getall', handler: '~/server/api/admin/membershipprofiles/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/membershipprofiles/create', handler: '~/server/api/admin/membershipprofiles/create.js', "auth": true, levels: [1] },
    { path: '/api/admin/membershipprofiles/delete', handler: '~/server/api/admin/membershipprofiles/delete.js', "auth": true, levels: [1] },
    { path: '/api/admin/profiles/getall', handler: '~/server/api/admin/profiles/getAll.js', "auth": true, levels: [1] },
    
    { path: '/api/admin/groups/getall', handler: '~/server/api/admin/groups/getAll.js', "auth": true },
    { path: '/api/admin/groups/create', handler: '~/server/api/admin/groups/create.js', "auth": true, levels: [1] },
    { path: '/api/admin/groups/update', handler: '~/server/api/admin/groups/update.js', "auth": true, levels: [1] },
    { path: '/api/admin/groups/delete', handler: '~/server/api/admin/groups/delete.js', "auth": true, levels: [1] },

    { path: '/api/admin/menus/getall', handler: '~/server/api/admin/menus/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/permissions/getall', handler: '~/server/api/admin/permissions/getAll.js', "auth": true, levels: [1] },
    { path: '/api/admin/permissions/update', handler: '~/server/api/admin/permissions/update.js', "auth": true, levels: [1] },
    { path: '/api/admin/permissions/delete', handler: '~/server/api/admin/permissions/delete.js', "auth": true, levels: [1] },

    { path: '/auth/login', handler: '~/server/api/auth/login.js', limiter: { key: 'login_user_limiter', max: 10, time: 3600 } },
    { path: '/auth/logout', handler: '~/server/api/auth/logout.js' },
    { path: '/auth/profile', handler: '~/server/api/auth/profile.js' },
    { path: '/api/auth/locale', handler: '~/server/api/auth/locale.js' },
    { path: '/api/auth/register', handler: '~/server/api/auth/register.js' },
    { path: '/api/auth/confirmation', handler: '~/server/api/auth/confirmation.js' },
    { path: '/api/auth/pwdreset', handler: '~/server/api/auth/pwdreset.js' },
    { path: '/api/auth/pwdchange', handler: '~/server/api/auth/pwdchange.js' },
    { path: '/api/auth/routes', handler: '~/server/api/auth/routes.js' },
    { path: '/api/user/update', handler: '~/server/api/user/update.js', auth: true },
    { path: '/api/user/uploadphoto', handler: '~/server/api/user/uploadphoto.js', auth: true },
    { path: '/api/help/getall', handler: '~/server/api/help/getall.js', auth: false },
    { path: '/api/explain/getall', handler: '~/server/api/explain/getall.js', auth: false },
    { path: '/api/templates/download', handler: '~/server/api/templates/download.js', auth: false },
    { path: '/api/user/notifications/get', handler: '~/server/api/user/notifications/get.js', auth: true },
    { path: '/api/user/notifications/getall', handler: '~/server/api/user/notifications/getall.js', auth: true },
    { path: '/api/admin/notifications/get', handler: '~/server/api/admin/notifications/get.js', auth: true, levels: [1] },
    { path: '/api/admin/notifications/getall', handler: '~/server/api/admin/notifications/getall.js', auth: true, levels: [1] },
    { path: '/api/admin/notifications/resend', handler: '~/server/api/admin/notifications/resend.js', auth: true, levels: [1] },
]);

exports.api = routes;

