/**
 * Capabilities store draft
 */

// import { Model } from '@vuex-orm/core'
// import { parseStringPromise } from 'xml2js';
// import { DOMParser } from 'xmldom';

// export default class CapabilitiesModel extends Model {
//     // This is the name used as module name of the Vuex Store.
//     static entity = 'qgis_capabilities'

//     static state() {
//         return {
//             total: 0,

//             loaded: false,
//             ready: false,

//             sortBy: null,
//             sortOrder: true,
//             currSortBy: null,
//             currSortOrder: null,

//             readOnce: false,
//             reloadOnLogin: true
//         }
//     }

//     static isLoaded() {
//         const { loaded } = this.store().state.entities[this.entity]

//         return loaded;
//     }

//     static getTotal() {
//         const { total } = this.store().state.entities[this.entity]

//         return total;
//     }

//     static getMetadata() {
//         const { total, sortBy, sortOrder, currSortBy, currSortOrder, loaded, readOnce, reloadOnLogin } = this.store().state.entities[this.entity]

//         return { total, sortBy, sortOrder, currSortBy, currSortOrder, loaded, readOnce, reloadOnLogin };
//     }

//     static orderBy(property, direction) {
//         return this.query()
//             .orderBy(property, direction ? 'asc' : 'desc');
//     }

//     static checkNeedReload(options) {
//         const { currSortBy, currSortOrder, loaded } = this.store().state.entities[this.entity];

//         const changes = [];

//         if (!loaded) {
//             changes.push('init');
//         }

//         if (!(options.sortBy === currSortBy && options.sortOrder === currSortOrder)) {
//             changes.push('sort');
//         }

//         // return !loaded ||
//         //     !(options.sortBy === currSortBy &&
//         //         options.sortOrder === currSortOrder &&
//         //         options.start === currStart &&
//         //         options.limit === currLimit &&
//         //         !this.checkFiltersChange(options.filter));

//         return changes;
//     }

//     static async setAuthDirty() {
//         const { reloadOnLogin } = this.getMetadata();

//         if (reloadOnLogin) {
//             this.commit(state => {
//                 state.loaded = false;
//             });
//         }
//     }

//     static apiConfig = {
//         api: {
//             read: null,
//             create: null,
//             update: null,
//             delete: null
//         },

//         actions: {
//             async read(params = {}) {
//                 try {

//                     let model = this.model;

//                     let config = model.apiConfig;
//                     let metadata = model.getMetadata();

//                     let url = config.api.read;
//                     let res = null;

//                     let reqParams = params.hasOwnProperty('defParams') ? JSON.parse(JSON.stringify(params.defParams)) : {};

//                     // If read only once
//                     if (metadata.readOnce && metadata.loaded && !params.forceReload) {
//                         return;
//                     }

//                     // if (!!params.once === true && metadata.loaded) {
//                     //     return;
//                     // }

//                     await model.commit((state) => {
//                         state.ready = false;
//                     });

//                     // try {
//                     // -1 = all records
//                     let sortBy = params.sortBy && params.sortBy.length ? params.sortBy : metadata.sortBy;
//                     let sortOrder = typeof params.sortOrder === 'boolean' ? params.sortOrder : metadata.sortOrder;
//                     let clear = params.hasOwnProperty('clear') ? params.clear : false;

//                     let shouldClear = clear;

//                     // Sorting params
//                     // if (sortBy && sortBy.length) {
//                     //     reqParams['sortBy'] = sortBy;
//                     //     reqParams['sortOrder'] = sortOrder;
//                     // }

//                     const stateChanges = model.checkNeedReload(reqParams);

//                     if (!stateChanges.length && !params.forceReload) {
//                         await model.commit((state) => {
//                             state.ready = true;
//                         });
//                         return;
//                     }

//                     if (shouldClear) {
//                         // model.deleteAll();
//                         model.dispatch('deleteAll')
//                     }

//                     reqParams['save'] = false;

//                     res = await this.post(url, reqParams);

//                     console.log("BEFORE QUERY")

//                     res = {
//                         response: {
//                             body:
//                                 '<WMS_Capabilities xsi:schemaLocation="http://www.opengis.net/wms http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd http://www.qgis.org/wms https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?SERVICE=WMS&REQUEST=GetSchemaExtension" version="1.3.0"> <Service> <Name>WMS</Name> <Title>untitled</Title> <KeywordList> <Keyword vocabulary="ISO">infoMapAccessService</Keyword> </KeywordList> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi" xlink:type="simple"/> <Fees>conditions unknown</Fees> <AccessConstraints>None</AccessConstraints> </Service> <Capability> <Request> <GetCapabilities> <Format>text/xml</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </GetCapabilities> <GetMap> <Format>image/jpeg</Format> <Format>image/png</Format> <Format>image/png; mode=16bit</Format> <Format>image/png; mode=8bit</Format> <Format>image/png; mode=1bit</Format> <Format>application/dxf</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </GetMap> <GetFeatureInfo> <Format>text/plain</Format> <Format>text/html</Format> <Format>text/xml</Format> <Format>application/vnd.ogc.gml</Format> <Format>application/vnd.ogc.gml/3.1.1</Format> <Format>application/json</Format> <Format>application/geo+json</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </GetFeatureInfo> <sld:GetLegendGraphic> <Format>image/jpeg</Format> <Format>image/png</Format> <Format>application/json</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </sld:GetLegendGraphic> <sld:DescribeLayer> <Format>text/xml</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </sld:DescribeLayer> <qgs:GetStyles> <Format>text/xml</Format> <DCPType> <HTTP> <Get> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?" xlink:type="simple"/> </Get> </HTTP> </DCPType> </qgs:GetStyles> </Request> <Exception> <Format>XML</Format> </Exception> <sld:UserDefinedSymbolization UserStyle="1" SupportSLD="1" UserLayer="0" RemoteWCS="0" RemoteWFS="0" InlineFeature="0"/> <Layer queryable="1"> <KeywordList> <Keyword vocabulary="ISO">infoMapAccessService</Keyword> </KeywordList> <CRS>CRS:84</CRS> <CRS>EPSG:3763</CRS> <EX_GeographicBoundingBox> <westBoundLongitude>-14.82773</westBoundLongitude> <eastBoundLongitude>-0.923466</eastBoundLongitude> <southBoundLatitude>36.6447</southBoundLatitude> <northBoundLatitude>42.284038</northBoundLatitude> </EX_GeographicBoundingBox> <BoundingBox maxx="596952.711" miny="-314817.019" CRS="EPSG:3763" minx="-554015.037" maxy="290495.982"/> <Layer queryable="1"> <Name>cartografia_homologada</Name> <Title>cartografia_homologada</Title> <CRS>CRS:84</CRS> <CRS>EPSG:3763</CRS> <EX_GeographicBoundingBox> <westBoundLongitude>-9.571778</westBoundLongitude> <eastBoundLongitude>-6.172036</eastBoundLongitude> <southBoundLatitude>36.948018</southBoundLatitude> <northBoundLatitude>42.15432</northBoundLatitude> </EX_GeographicBoundingBox> <BoundingBox maxx="162129.082" miny="-300404.804" CRS="EPSG:3763" minx="-118924.53" maxy="276083.77"/> <Style> <Name>default</Name> <Title>default</Title> <LegendURL> <Format>image/png</Format> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=cartografia_homologada&FORMAT=image/png&STYLE=default&SLD_VERSION=1.1.0" xlink:type="simple"/> </LegendURL> </Style> </Layer> <Layer queryable="1"> <Name>Ortos2018-RGB</Name> <Title>Ortos2018-RGB</Title> <CRS>CRS:84</CRS> <CRS>EPSG:3763</CRS> <EX_GeographicBoundingBox> <westBoundLongitude>-10.193392</westBoundLongitude> <eastBoundLongitude>-5.951714</eastBoundLongitude> <southBoundLatitude>36.723283</southBoundLatitude> <northBoundLatitude>42.279598</northBoundLatitude> </EX_GeographicBoundingBox> <BoundingBox maxx="180000" miny="-325000" CRS="EPSG:3763" minx="-170000" maxy="290000"/> <Style> <Name>default</Name> <Title>default</Title> <LegendURL> <Format>image/png</Format> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=Ortos2018-RGB&FORMAT=image/png&STYLE=default&SLD_VERSION=1.1.0" xlink:type="simple"/> </LegendURL> </Style> </Layer> <Layer queryable="1"> <Name>concelhos</Name> <Title>concelhos</Title> <CRS>CRS:84</CRS> <CRS>EPSG:3763</CRS> <EX_GeographicBoundingBox> <westBoundLongitude>-9.575005</westBoundLongitude> <eastBoundLongitude>-6.172036</eastBoundLongitude> <southBoundLatitude>36.948018</southBoundLatitude> <northBoundLatitude>42.15432</northBoundLatitude> </EX_GeographicBoundingBox> <BoundingBox maxx="162129.082" miny="-300404.804" CRS="EPSG:3763" minx="-119191.408" maxy="276083.768"/> <Style> <Name>default</Name> <Title>default</Title> <LegendURL> <Format>image/png</Format> <OnlineResource xlink:href="https://homologacao.geomaster.pt:443/postgresql/homologation/homologation/homologation/cgi-bin/qgis_mapserv.fcgi?&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=concelhos&FORMAT=image/png&STYLE=default&SLD_VERSION=1.1.0" xlink:type="simple"/> </LegendURL> </Style> </Layer> </Layer> </Capability> </WMS_Capabilities>'
//                         }
//                     }

//                     const response = res.response;

//                     // if (response.body) {
//                     //     throw response.body;
//                     // }

//                     const data = response.body;

//                     // Not async
//                     const xml = new DOMParser().parseFromString(data, "text/xml");

//                     // This one is async
//                     const result = await parseStringPromise(xml);

//                     console.log(result);

//                     const root = result.WMS_Capabilities;

//                     const capabilityArr = root.Capability;

//                     const capability = capabilityArr[0];

//                     const requestLayerArr = capability.Layer;

//                     const requestLayer = requestLayerArr[0];

//                     const layerArr = requestLayer.Layer;

//                     const layers = [];

//                     for (let i = 0; i < layerArr.length; i++) {
//                         const { Name, Title, CRS, BoundingBox, Style } = layerArr[i];

//                         const bbox = BoundingBox[0];

//                         layers.push({
//                             name: Name[0],
//                             title: Title[0],
//                             CRS: CRS,
//                             bbox: [bbox.minx, bbox.miny, bbox.maxx, bbox.maxy]
//                         });
//                     }

//                     console.log(layers)

//                     const total = 0;//response.total ? response.total : data.length;

//                     // await model.commit((state) => {
//                     //     state.total = total;
//                     //     state.loaded = true;
//                     //     state.ready = true;
//                     //     state.currSortBy = sortBy;
//                     //     state.currSortOrder = sortOrder;
//                     // });

//                     return res;
//                 } catch (e) {
//                     console.log("Error querying capabilities")
//                     console.log(e);
//                 }

//             }
//         }
//     }
// }
