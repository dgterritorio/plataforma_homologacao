import GroupsModel from './groups'

// This store will only be used in the admin panel
export default class AdminGroups extends GroupsModel {
    static entity = 'webapp.groups'
}
