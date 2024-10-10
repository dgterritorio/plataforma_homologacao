export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        record: {
            type: Object,
            handler: function () {
                return {};
            },
        },

        valid: {
            type: Boolean,
            default: false,
        },

        payload: {
            type: Object,
            default: function () {
                return {
                    advance: false,
                };
            },
        },

        options: {
            type: Object,
            default: function () {
                return {};
            }
        }
    },

    model: {
        prop: "valid",
        event: "updatevalid",
    },

    data() {
        return {
            loading: false,
            count: 0,
            userValid: false,
        };
    },

    methods: {
        getResult: function () {
            return { valid: true };
        },

        getReport: function () {
            return null;
        },

        save: function () {
            return true;
        }
    }
};