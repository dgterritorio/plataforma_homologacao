const pathHomologation = "~/server/api/client/dgt/homologation/";
const pathProducer = "~/server/api/client/dgt/producer/";

const baseHomologation = "/api/homologation/";
const baseProducer = "/api/producer/"

const routes = Object.freeze([
  { "path": "/api/applicant/register", "handler": pathHomologation + "applicant/register.js", "auth": false },

  // Producer Entity
  { "path": baseProducer + "entity/register", "handler": pathProducer + "entity/register.js", "auth": false },
  { "path": baseProducer + "entity/getall", "handler": pathProducer + "entity/getAll.js", "auth": true, levels: [4, 5, 6] },
  { "path": baseProducer + "entity/getofficial", "handler": pathProducer + "entity/getofficial.js", "auth": false },
  { "path": baseProducer + "entity/getactive", "handler": pathProducer + "entity/getactive.js", "auth": false },

  // Producer Staff
  { "path": baseProducer + "staff/get", "handler": pathProducer + "staff/get.js", "auth": true, levels: [4, 5] },

  // Producer Equipments
  { "path": baseProducer + "equipment/get", "handler": pathProducer + "equipment/get.js", "auth": true, levels: [4, 5] },

  // Producer Activities
  { "path": baseProducer + "activity/get", "handler": pathProducer + "activity/get.js", "auth": true, levels: [4, 5] },

  // Producer State Management
  { "path": baseProducer + "state/getall", "handler": pathProducer + "state/getall.js", "auth": true, "levels": [4, 5] },
  { "path": baseProducer + "state/gettypes", "handler": pathProducer + "state/gettypes.js", "auth": true, levels: [4, 5] },
  { "path": baseProducer + "state/change", "handler": pathProducer + "state/change.js", "auth": true, "levels": [4, 5] },
  { "path": baseProducer + "state/cancel", "handler": pathProducer + "state/cancel.js", "auth": true, "levels": [4] },
  // { "path": baseProducer + "state/revert", "handler": pathProducer + "state/revert.js", "auth": true, "levels": [4] },
  { "path": baseProducer + "state/predict", "handler": pathProducer + "state/predict.js", "auth": true, "levels": [4, 5] },

  // Producer Documents
  { "path": baseProducer + "document/getall", "handler": pathProducer + "document/getall.js", "auth": true, levels: [4, 5] },
  { "path": baseProducer + "document/getmissing", "handler": pathProducer + "document/getmissing.js", "auth": true, levels: [4, 5] },
  { "path": baseProducer + "document/download", "handler": pathProducer + "document/download.js", "auth": true, levels: [4, 5] },
  { "path": baseProducer + "document/upload", "handler": pathProducer + "document/upload.js", "auth": true, levels: [4, 5] },
  { "path": baseProducer + "document/setinvalid", "handler": pathProducer + "document/setinvalid.js", "auth": true, levels: [4] },

  // Producer Statistics
  { "path": baseProducer + "statistics/getactivity", "handler": pathProducer + "statistics/getactivity.js", "auth": true },
  { "path": baseProducer + "statistics/getgeneral", "handler": pathProducer + "statistics/getgeneral.js", "auth": false },

  // ------------------------------------------------------------------------------------

  // Homologation Applicant Info
  { "path": baseHomologation + "applicant/get", "handler": pathHomologation + "applicant/get.js", "auth": true, levels: [4, 6] },

  // Homologation Requests
  { "path": baseHomologation + "request/getcount", "handler": pathHomologation + "request/getCount.js", "auth": true, "levels": [2, 4, 6] },
  { "path": baseHomologation + "request/getall", "handler": pathHomologation + "request/getAll.js", "auth": true, "levels": [1, 2, 4, 6] },
  { "path": baseHomologation + "request/getallofficial", "handler": pathHomologation + "request/getAllofficial.js", "auth": false },
  { "path": baseHomologation + "request/getwithdiscount", "handler": pathHomologation + "request/getWithDiscount.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "request/new", "handler": pathHomologation + "request/new.js", "auth": true, "levels": [2] },
  { "path": baseHomologation + "request/settype", "handler": pathHomologation + "request/settype.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "request/setexceptional", "handler": pathHomologation + "request/setexceptional.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "request/setmetacontrol", "handler": pathHomologation + "request/setmetacontrol.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "request/setprotocol", "handler": pathHomologation + "request/setprotocol.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "request/gethassupervisory", "handler": pathHomologation + "request/gethassupervisory.js", "auth": true, "levels": [4] },

  // Homologation State Management
  { "path": baseHomologation + "state/getall", "handler": pathHomologation + "state/getall.js", "auth": true, "levels": [2, 4, 6] },
  { "path": baseHomologation + "state/gettypes", "handler": pathHomologation + "state/gettypes.js", "auth": true },
  { "path": baseHomologation + "state/change", "handler": pathHomologation + "state/change.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "state/cancel", "handler": pathHomologation + "state/cancel.js", "auth": true, "levels": [4] },
  // { "path": baseHomologation + "state/revert", "handler": pathHomologation + "state/revert.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "state/predict", "handler": pathHomologation + "state/predict.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "state/changetype", "handler": pathHomologation + "state/changetype.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "state/changeregime", "handler": pathHomologation + "state/changeregime.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "state/suspend", "handler": pathHomologation + "state/suspend.js", "auth": true, "levels": [4] },
  { "path": baseHomologation + "state/resume", "handler": pathHomologation + "state/resume.js", "auth": true, "levels": [4] },

  // Receipts
  { "path": baseHomologation + "receipt/get", "handler": pathHomologation + "receipt/get.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "receipt/getlast", "handler": pathHomologation + "receipt/getlast.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "receipt/getdocuments", "handler": pathHomologation + "receipt/getdocuments.js", "auth": true, "levels": [2, 4, 6] },
  // { "path": baseHomologation + "receipt/getall", "handler": pathHomologation + "receipt/getall.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "receipt/set", "handler": pathHomologation + "receipt/set.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "receipt/setaccepted", "handler": pathHomologation + "receipt/setaccepted.js", "auth": true, "levels": [2] },

  // Evaluators
  { "path": baseHomologation + "evaluators/getpossible", "handler": pathHomologation + "evaluator/getpossible.js", "auth": true, "levels": [1, 4] },
  { "path": baseHomologation + "evaluators/getall", "handler": pathHomologation + "evaluator/getall.js", "auth": true, "levels": [4, 6] },
  { "path": baseHomologation + "evaluator/assign", "handler": pathHomologation + "evaluator/assign.js", "auth": true, "levels": [1, 4] },

  // Evaluations
  { "path": baseHomologation + "evaluation/set", "handler": pathHomologation + "evaluation/set.js", "auth": true, "levels": [2, 4] },
  { "path": baseHomologation + "evaluation/get", "handler": pathHomologation + "evaluation/get.js", "auth": true, "levels": [2, 4, 6] },
  { "path": baseHomologation + "evaluation/getall", "handler": pathHomologation + "evaluation/getall.js", "auth": true, "levels": [2, 4, 6] },
  { "path": baseHomologation + "evaluation/getanalysis", "handler": pathHomologation + "evaluation/getanalysis.js", "auth": true, "levels": [2, 4, 6] },


  // Homologation Documents
  { "path": baseHomologation + "document/getall", "handler": pathHomologation + "document/getall.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "document/getmissing", "handler": pathHomologation + "document/getmissing.js", "auth": true, levels: [2, 4] },
  { "path": baseHomologation + "document/download", "handler": pathHomologation + "document/download.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "document/getallversions", "handler": pathHomologation + "document/getallversions.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "document/upload", "handler": pathHomologation + "document/upload.js", "auth": true, levels: [2] },
  { "path": baseHomologation + "document/setinvalid", "handler": pathHomologation + "document/setinvalid.js", "auth": true, levels: [4] },

  // Homologation Entities
  { "path": baseHomologation + "entities/get", "handler": pathHomologation + "entities/get.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "entities/getmembers", "handler": pathHomologation + "entities/getmembers.js", "auth": true, levels: [2, 4, 6] },

  { "path": baseHomologation + "owner/get", "handler": pathHomologation + "owner/get.js", "auth": true, levels: [2, 4, 6] },

  // Homologation Cartography
  { "path": baseHomologation + "cartography/get", "handler": pathHomologation + "cartography/get.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "cartography/getallversions", "handler": pathHomologation + "cartography/getallversions.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "cartography/getbbox", "handler": pathHomologation + "cartography/getbbox.js", "auth": true },
  { "path": baseHomologation + "cartography/getglobalbbox", "handler": pathHomologation + "cartography/getglobalbbox.js", "auth": false },
  { "path": baseHomologation + "cartography/ls", "handler": pathHomologation + "cartography/readdir.js", "auth": true, levels: [2, 4, 6] },
  { "path": baseHomologation + "cartography/setinvalid", "handler": pathHomologation + "cartography/setinvalid.js", "auth": true, levels: [4] },
  { "path": baseHomologation + "cartography/setworkarea", "handler": pathHomologation + "cartography/setworkarea.js", "auth": true, levels: [4] },

  // CAOP
  { "path": baseHomologation + "caop/getall", "handler": pathHomologation + "caop/getall.js", "auth": false },

  // Homologation Statistics
  { "path": baseHomologation + "statistics/getactivity", "handler": pathHomologation + "statistics/getactivity.js", "auth": true },
  { "path": baseHomologation + "statistics/getuseractivity", "handler": pathHomologation + "statistics/getuseractivity.js", "auth": true },
  { "path": baseHomologation + "statistics/getgeneral", "handler": pathHomologation + "statistics/getgeneral.js", "auth": false },

  // Homologation Types
  { "path": baseHomologation + "types/acquisition/get", "handler": pathHomologation + "types/acquisition/get.js", "auth": true },
  { "path": baseHomologation + "types/data/get", "handler": pathHomologation + "types/data/get.js", "auth": false },
  { "path": baseHomologation + "types/dataspecification/get", "handler": pathHomologation + "types/data_specification/get.js", "auth": false },
  { "path": baseHomologation + "types/dataspecificationversion/get", "handler": pathHomologation + "types/data_specification_version/get.js", "auth": false },
  { "path": baseHomologation + "types/datastructure/get", "handler": pathHomologation + "types/data_structure/get.js", "auth": true },
  { "path": baseHomologation + "types/ortoradiometric/get", "handler": pathHomologation + "types/orto_radiometric/get.js", "auth": true },
  { "path": baseHomologation + "types/product/get", "handler": pathHomologation + "types/product/get.js", "auth": false },
  { "path": baseHomologation + "types/purpose/get", "handler": pathHomologation + "types/purpose/get.js", "auth": true },
  { "path": baseHomologation + "types/epsg/get", "handler": pathHomologation + "types/epsg/get.js", "auth": false },
  { "path": baseHomologation + "types/evaluation/get", "handler": pathHomologation + "types/evaluation/get.js", "auth": true, "levels": [2, 4, 6] },

  // ------------------------------------------------------------------------------------

  // Nextcloud
  // { "path": baseHomologation + "nextcloud/user/create", "handler": pathHomologation + "nextcloud/user/create.js", "auth": true, levels: [4] },
  // { "path": baseHomologation + "nextcloud/user/delete", "handler": pathHomologation + "nextcloud/user/delete.js", "auth": true, levels: [4] },
  // { "path": baseHomologation + "nextcloud/folder/share", "handler": pathHomologation + "nextcloud/folder/share.js", "auth": true, levels: [4] },
  // { "path": baseHomologation + "nextcloud/folder/unshare", "handler": pathHomologation + "nextcloud/folder/unshare.js", "auth": true, levels: [4] }
])

exports.api = routes;