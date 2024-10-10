export default ({ app }, inject) => {
    /**
     * Default unit categories
     */
    const MASS_KEY = 'mass',
        VOLUME_KEY = 'volume',
        VOLUME_FLOW_KEY = 'flows';

    /**
     * Supported units
     */
    const units = ['g', 'Kg', 'Ton', 'mg',
        'l', 'm3', 'hm3', 'Mm3',
        'l/s', 'm3/s', 'l/h', 'm3/h', 'l/dia', 'm3/dia', 'm3/ano'
    ];

    /**
     * Default floating precision for each unit
     */
    const defaultPrecision = {
        'g': 0, 'Kg': 0, 'Ton': 0, 'mg': 0,
        'l': 0, 'm3': 0, 'hm3': 0, 'Mm3': 0,
        'l/s': 2, 'm3/s': 2, 'l/h': 2, 'm3/h': 2, 'l/dia': 0, 'm3/dia': 0, 'm3/ano': 0
    }

    /**
     * Mapping for unit's categories
     */
    const categories = {
        'mg': MASS_KEY,
        'g': MASS_KEY,
        'Kg': MASS_KEY,
        'Ton': MASS_KEY,

        'l': VOLUME_KEY,
        'm3': VOLUME_KEY,
        'hm3': VOLUME_KEY,
        'Mm3': VOLUME_KEY,

        'l/s': VOLUME_FLOW_KEY,
        'l/h': VOLUME_FLOW_KEY,
        'l/dia': VOLUME_FLOW_KEY,
        'l/ano': VOLUME_FLOW_KEY,
        'm3/s': VOLUME_FLOW_KEY,
        'm3/h': VOLUME_FLOW_KEY,
        'm3/dia': VOLUME_FLOW_KEY,
        'm3/ano': VOLUME_FLOW_KEY,
    }

    /**
     * Checks if the conversion from->to is supported
     * @param {String} from: from unit
     * @param {String} to: to unit
     * @returns 
     */
    function validate(from, to) {
        return from && units.includes(from) && to && units.includes(to);
    }

    /**
     * Formats number
     * @param {Number} value 
     * @param {Object} params 
     * @returns 
     */
    function format(value, params) {
        let retValue = value.toLocaleString(params.locale,
            {
                minimumFractionDigits: params.precision,
                maximumFractionDigits: params.precision
            });

        if (value !== 0 && parseFloat(retValue.replace(",", ".")) == 0) {
            retValue = value.toExponential(2);
        }

        return `${retValue}${params.unit}`.replace(/,/g, '.');
    }

    /**
     * Translates value from->to unit
     * @param {Number} value 
     * @param {String} from 
     * @param {String} to 
     * @returns 
     */
    function translate(value, from, to) {
        let conv = value;

        switch (from) {
            case 'Ton':
                switch (to) {
                    case 'g':
                        conv = value * 1000000;
                        break;
                    case 'Kg':
                        conv = value * 1000;
                        break;
                    case 'mg':
                        conv = value * 1e+9;
                        break;
                    default:
                        break;
                }
                break;
            case 'Kg':
                switch (to) {
                    case 'g':
                        conv = value * 1000;
                        break;
                    case 'Ton':
                        conv = value * 0.001;
                        break;
                    case 'mg':
                        conv = value * 1000000;
                        break;
                    default:
                        break;
                }
                break;
            case 'g':
                switch (to) {
                    case 'Kg':
                        conv = value * 0.001;
                        break;
                    case 'Ton':
                        conv = value * 0.000001;
                        break;
                    case 'mg':
                        conv = value * 1000;
                        break;
                    default:
                        break;
                }
                break;
            case 'm3':
                switch (to) {
                    case 'l':
                        conv = value * 1000;
                        break;
                    case 'hm3':
                        conv = value * 0.000001;
                        break;
                    case 'Mm3':
                        conv = value * 1000000000;
                        break;
                    default:
                        break;
                }
                break;
            case 'm3/ano':
                switch (to) {
                    case 'l/s':
                        conv = value * 0.00003171;// 1 / 31536;
                        break;
                    case 'm3/s':
                        conv = value * 0.000000032;// 1 / 31536000;
                        break;
                    case 'l/h':
                        conv = value * 0.114155;
                        break;
                    case 'm3/h':
                        conv = value * 0.000114155;
                        break;
                    case 'l/dia':
                        conv = value * 2.73973;
                        break;
                    case 'm3/dia':
                        conv = value * 0.00273973;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        return conv;
    }

    /**
     * 
     * @param {float} value: value to convert
     * @param {String} from: original unit
     * @param {String} to: output unit
     * @param {Number} places: output floating precision
     * @param {String} locale: output locale
     * @param {Boolean} showUnit: show/hide output unit symbol
     * @returns 
     */
    function convert(value, from, to, places = -1, locale = 'pt', showUnit = false) {
        const showPlaces = places != -1 ? places : defaultPrecision[to];

        let conv = null,
            unit = null;

        // Validates from->to
        if (validate(from, to)) {
            // If valid, translate unit
            conv = translate(value, from, to);
            unit = showUnit ? ' ' + to : ''
        } else {
            // else, return the original value
            conv = value;
            unit = showUnit ? ' ' + from : '';
        }

        // Format output value
        return format(conv, {
            locale: locale,
            precision: showPlaces,
            unit: unit
        });
    }

    /**
     * Gets the input unit category
     * @param {String} unit 
     * @returns 
     */
    function getCategory(unit) {
        return categories[unit];
    }

    /**
     * Plugin namespace
     */
    inject('u', {
        validate: validate,
        convert: convert,
        getCategory: getCategory
    });
}
