// import States from '@/models/client/dgt/homologation/states.js'
import StatesTypes from '@/models/client/dgt/homologation/statesTypes.js'
import Requests from '@/models/client/dgt/homologation/requests.js'
import RequestsStatistics from '@/models/client/dgt/homologation/requestsStatistics.js'
import OfficalRequests from '@/models/client/dgt/homologation/official-requests.js'
import DiscountRequests from '@/models/client/dgt/homologation/discountRequests.js'
import CanceledProducers from '@/models/client/dgt/producers/canceled.js'
import InprogressProducers from '@/models/client/dgt/producers/inprogress.js'
import OfficialProducers from '@/models/client/dgt/producers/official.js'
import OfficialSupervisors from '@/models/client/dgt/producers/officialsupervisors.js'
import ActiveProducers from '@/models/client/dgt/producers/active.js'
import productTypes from '@/models/client/dgt/homologation/productTypes.js'
import dataVectorialTypes from '@/models/client/dgt/homologation/dataVectorialTypes.js'
import dataImageryTypes from '@/models/client/dgt/homologation/dataImageryTypes.js'
import dataStructureTypes from '@/models/client/dgt/homologation/dataStructureTypes.js'
import dataSpecificationCartopTypes from '@/models/client/dgt/homologation/dataSpecificationCartopTypes.js'
import dataSpecificationOthersTypes from '@/models/client/dgt/homologation/dataSpecificationOthersTypes.js'
import dataSpecificationTypes from '@/models/client/dgt/homologation/dataSpecificationTypes.js'
import dataSpecificationVersionTypes from '@/models/client/dgt/homologation/dataSpecificationVersionTypes.js'
import dataTypes from '@/models/client/dgt/homologation/dataTypes.js'
import ortoRadiometricTypes from '@/models/client/dgt/homologation/ortoRadiometricTypes.js'
import purposeVectorialTypes from '@/models/client/dgt/homologation/purposeVectorialTypes.js'
import purposeImageryTypes from '@/models/client/dgt/homologation/purposeImageryTypes.js'
import purposeTypes from '@/models/client/dgt/homologation/purposeTypes.js'
import acquisitionTypes from '@/models/client/dgt/homologation/acquisitionTypes.js'
import epsgTypes from '@/models/client/dgt/homologation/epsgTypes.js'
import evaluationTypes from '@/models/client/dgt/homologation/evaluationTypes.js'
import payments from '@/models/client/dgt/homologation/payments.js'
import ProducerStatesTypes from '@/models/client/dgt/producers/statesTypes.js'
import ProducerRequests from '@/models/client/dgt/producers/requests.js'
// import Evaluators from '@/models/client/dgt/homologation/evaluators.js'
import PossibleEvaluators from '@/models/client/dgt/homologation/possibleEvaluators.js'
import CAOP from '@/models/client/dgt/homologation/CAOP.js'
import GlobalLayers from '@/models/client/dgt/homologation/GlobalLayers.js'
import GlobalPrivateLayers from '@/models/client/dgt/homologation/GlobalPrivateLayers.js'
import PrivateLayers from '@/models/client/dgt/homologation/PrivateLayers.js'


const clientModels = Object.freeze([
    StatesTypes,
    Requests,
    RequestsStatistics,
    OfficalRequests,
    CanceledProducers,
    InprogressProducers,
    OfficialProducers,
    OfficialSupervisors,
    ActiveProducers,
    DiscountRequests,
    productTypes,
    dataVectorialTypes,
    dataImageryTypes,
    dataStructureTypes,
    dataSpecificationCartopTypes,
    dataSpecificationOthersTypes,
    dataSpecificationTypes,
    dataTypes,
    ortoRadiometricTypes,
    purposeVectorialTypes,
    purposeImageryTypes,
    purposeTypes,
    acquisitionTypes,
    epsgTypes,
    evaluationTypes,
    payments,
    ProducerStatesTypes,
    ProducerRequests,
    // Evaluators,
    PossibleEvaluators,
    CAOP,
    dataSpecificationVersionTypes,
    GlobalLayers,
    GlobalPrivateLayers,
    PrivateLayers
]);

export default clientModels;
