export default {
    methods: {
        requestReaddir: async function (record, cartography) {
            const id = record.id;
            const version = cartography.version;
            const vectorial = record.vectorial;

            try {
                const result = await this.$axios.post(
                    "/api/homologation/cartography/ls",
                    {
                        requestId: id,
                        version: version,
                        vectorial: vectorial,
                    }
                );

                if (result.error) {
                    throw error;
                }

                return result;
            } catch (e) {
                return null;
            }
        },

        requestCartography: async function (record) {
            const requestId = record.id;
            const state = record.code;
            const vectorial = record.vectorial;

            try {
                const result = await this.$axios.post(
                    "/api/homologation/cartography/get",
                    {
                        requestId: requestId,
                        state: state,
                        vectorial: vectorial,
                    }
                );

                if (result.error) {
                    throw error;
                }

                return result.data;
            } catch (e) {
                return null;
            }
        },

    }
};