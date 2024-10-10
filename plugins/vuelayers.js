import Vue from 'vue'
import VueLayers from 'vuelayers'
import 'vuelayers/lib/style.css' // needs css-loader
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4'

// TODO: make this an request to https://epsg.io/?format=json&q=epsgcode
proj4.defs("EPSG:3763", "+proj=tmerc +lat_0=39.66825833333333 +lon_0=-8.133108333333334 +k=1 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:5016", "+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

register(proj4);

Vue.use(VueLayers);

import { createStyle } from 'vuelayers/lib/ol-ext'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Stroke'

Vue.use(createStyle)

Vue.prototype.$createStyle = (args) => {
    return createStyle(args)
}

Vue.prototype.$olStyleFactory = (type, params) => {
    let style = null;

    switch (type) {
        case 'style':
            style = new Style(params)
            break;
        case 'stroke':
            style = new Stroke(params)
            break;
        case 'fill':
            style = new Fill(params);
            break;
        default:
            style = null;
            break;
    }

    return style;
}
