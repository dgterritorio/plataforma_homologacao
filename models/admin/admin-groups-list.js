import GroupsModel from './groups'

// This store will only be used in the admin panel
export default class AdminGroupsList extends GroupsModel {
    static entity = 'webapp.groups_list'
}