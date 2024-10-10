import BaseModel from '@/models/base.js'

export default class GeoModel extends BaseModel {
    // This is the name used as module name of the Vuex Store.
    static entity = 'geomodel'

    static primaryKey = "id";

    static fields() {
        return {
            id: this.uid(),
            ord: this.number().nullable(),
            title: this.string(''),
            layer: this.string(''),
            url: this.string(),
            service: this.string(),
            layer_group: this.string().nullable(),
            active: this.boolean(false),
            visible: this.boolean(false),
            menu_id: this.number().nullable(),
            srid: this.number()
        }
    }

    static state() {
        return {
          ...super.state(),
          sortBy: ['ord'],
          sortOrder: [false]
        }
      }

    static apiConfig = {
        actions: {
            ...super.apiConfig.actions,

            toVuelayers: function () {
                const model = this.model;

                // Sort data
                const data = model.query().orderBy('ord', 'desc').get();

                const parsed = [];

                // For each layer, convert to vuelayers
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];

                    const { id, title, layer, url, service, layer_group, visible, ord, srid } = row;

                    const params = {
                        id: id,
                        title: title,
                        cmp: "vl-layer-tile",
                        visible: visible,
                        opacity: 1.0,
                        zIndex: 1000 - ord,
                        source: {
                            cmp: "vl-source-" + service.toLowerCase(),
                            projection: `EPSG:${srid}`,
                            url: url,
                            layers: layer,
                            extParams: { TRANSPARENT: true },
                            serverType: "qgis",
                        },
                    }

                    parsed.push(params);
                }

                return parsed;
            }
        }
    }
}
