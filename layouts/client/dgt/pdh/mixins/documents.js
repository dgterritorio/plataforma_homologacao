export default {
    props: {
        options: {
            type: Object,
            default: function () {
                return {
                    allDocuments: false,
                    onlyInvalid: false,
                    onlyInvalidEval: false,
                    onlyLast: false,
                    baseUrl: '/api/homologation/'
                }
            }
        }
    },

    data() {
        return {
            selected: null,
        }
    },

    methods: {
        requestDocuments: async function (record) {
            const requestId = record.id;
            const stateId = record.state_id;

            let formData = {};

            let { allDocuments, onlyInvalid, onlyInvalidEval, onlyLast, baseUrl } = this.options;

            if (allDocuments) {
                formData = {
                    requestId: requestId,
                };
            } else if (onlyLast) {
                formData = {
                    lastState: true,
                    requestId: requestId,
                };
            } else if (onlyInvalidEval) {
                formData = {
                    onlyInvalid: true,
                    requestId: requestId,
                };
            } else {
                formData = {
                    stateId: stateId,
                    requestId: requestId,
                };
            }

            if (!baseUrl) {
                baseUrl = '/api/homologation/';
            }

            try {
                const result = await this.$axios.post(
                    baseUrl + "document/getall",
                    formData
                );

                if (result.error) {
                    throw error;
                }

                return result.data;
            } catch (e) {
                return null;
            }
        },

        requestMissingDocuments: async function (record) {
            const requestId = record.id;
            const stateId = record.state_id;

            let { onlyInvalid, baseUrl } = this.options;

            let formData = {
                requestId: requestId,
                onlyInvalid: onlyInvalid
            };

            if (!baseUrl) {
                baseUrl = '/api/homologation/';
            }

            try {
                const result = await this.$axios.post(
                    baseUrl + "document/getmissing",
                    formData
                );

                if (result.error) {
                    throw error;
                }

                return result.data;
            } catch (e) {
                return null;
            }
        },

        onDownload: async function (item) {
            try {

                let { baseUrl } = this.options;

                const formData = {
                    documentId: item.id
                };

                if (!baseUrl) {
                    baseUrl = '/api/homologation/';
                }

                const result = await this.$axios.post(
                    baseUrl + "document/download",
                    formData
                );

                if (result.error) {
                    throw result.error;
                }

                const data = result.data;
                const file = data[0];

                const name = file.name;
                const stream = file.stream;
                const mime = file.mime ? file.mime : 'application/pdf';

                const a = document.createElement("a");
                a.href = "data:" + mime + ";base64," + escape(stream);
                a.download = name ? name : 'document.pdf';
                a.click();
            } catch (e) {
                console.log("Error downloading pdf: ");
            }
        },

        onUpload: function (item) {
            const file = this.$refs.file;

            const expectedMime = item && item.mime_type ? item.mime_type.split('/')[1] : 'pdf';

            if (file) {
                file.value = '';
                file.accept = '.' + expectedMime;
            }

            this.selected = item;

            file.click();
        },

        onModify: function (item) {
            const file = this.$refs.file;

            const expectedMime = item && item.mime_type ? item.mime_type.split('/')[1] : 'pdf';

            if (file) {
                file.value = '';
                file.accept = '.' + expectedMime;
            }

            this.selected = item;

            file.click();
        },

        uploadDocument: async function () {
            const item = this.selected;
            const type = this.selected.type;
            const stateId = this.record.state_id;
            const requestId = this.record.id;

            const file = this.$refs.file.files[0];
            const original_name = file.name;

            const extension = file.type;

            const mimeType = item.mime_type;

            if (extension !== mimeType) {
                console.log("Unsupported mime type");
                return;
            }

            let { baseUrl } = this.options;

            let formData = new FormData();

            formData.append("requestId", requestId);
            formData.append("documentType", type);
            formData.append("document", file);
            formData.append("stateId", stateId);

            if (!baseUrl) {
                baseUrl = '/api/homologation/';
            }

            try {
                const result = await this.$axios.post(
                    baseUrl + "document/upload",
                    formData,
                    { progress: true }
                );

                if (result.error) {
                    throw result.error;
                }

                const data = result.data;

                const document = data[0];


                // data.forEach(function (dataEntry) {
                const newItem = {
                    id: document.id,
                    type: type,
                    mime_type: item.mime_type,
                    description: item.name,
                    mandatory: item.mandatory,
                    signed: document.signed,
                    signer_name: document.signer_name,
                    version: document.version,//item.version ? item.version + 1 : 1,
                    creation_date: new Date().toISOString(),
                    original_name: document.original_name
                    // original_name: original_name
                };
                // documents.push(newDoc);
                // }, this);

                this.$emit('upload', { old: item, new: newItem });

                this.$store.commit('SET_SYSTEMMSG', {
                    text: this.$t('Document Uploaded!'),
                    icon: 'mdi-check',
                    color: 'green',
                    alert: true,
                });
            } catch (e) {
                this.$store.commit('SET_SYSTEMMSG', {
                    text: this.$t('Error Uploading Document!'),
                    icon: 'mdi-close',
                    color: 'red',
                    alert: true,
                });
                console.log("Error downloading pdf: ");
            }
        },
    },

    // watch: {
    //     record: {
    //         deep: true,
    //         handler: function (newRecord) {
    //             this.loadDocuments(newRecord);
    //         },
    //     },
    // },
};