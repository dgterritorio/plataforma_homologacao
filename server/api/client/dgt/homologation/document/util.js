const { ResultSet } = require("@cubejs-client/core");

const db = require(__basedir + 'modules/db/base');

// Forces the supervisory report as mandatory if there is a supervisory entity in this request
async function requireSupervisoryReport(requestId, documents) {
    // Check if the supervisory report is included
    const reportIdx = documents.findIndex(function (doc) {
        return doc.type === 14;
    });

    // If not, nothing to do
    if (reportIdx === -1) {
        return;
    }

    const report = documents[reportIdx];

    // Check if request has a supervisory entity
    const result = await db.query('select * from homologation.entity_members where supervisor = true and request_id = $1', [requestId]);

    if (result.error) {
        throw result.error;
    }

    // If it does, set the supervisory report as mandatory
    if (result.data.length) {
        report.mandatory = true;
    } else {
        // else remove from list
        documents.splice(reportIdx, 1);
    }
}

module.exports = {
    requireSupervisoryReport: requireSupervisoryReport
}