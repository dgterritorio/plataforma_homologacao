export const state = () => ({
    key_value: {},
});

export const getters = {
    values: function (state) {
        // if (state.key_value.hasOwnProperty(key)) {
        //     return state.key_value[key];
        // }
        return state.key_value;
    },
}

export const actions = {
    async updatevalue(context, keyvalue) {
        context.commit("SET_PREFERENCE", keyvalue);
    },
}

export const mutations = {
    SET_PREFERENCE(state, keyvalue) {
        state.key_value[keyvalue.k] = keyvalue.v;
    },
}
