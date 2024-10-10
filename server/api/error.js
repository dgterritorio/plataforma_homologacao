const { v4 } = require('uuid');
const consola = require('consola')

function parseStack(stack) {

    let fileName = null, lineNumber = null;

    try {
        if (typeof stack !== 'string') {
            throw 'not a string'
        }

        const split = stack.split("\n");
        const len = split.length;

        if (len < 2) {
            throw 'stack too short'
        }

        const entry = split[1];

        const match = entry.match(/\(.*(server\/.*)\)/);

        if (!match) {
            throw 'could not match server file'
        }

        const capture = match[1];

        const parts = capture.split(':');

        fileName = parts[0];
        lineNumber = parts[1]; // ignore char number
    } catch (e) {
        // do nothing
    }

    return { fileName, lineNumber }
}

// Generic error handler
export default function (err, req, res, next) {
    let message = 'Server Error';
    let status = 500;
    let uuid = null;
    let stackTrace = null;
    let lineNumber = null;
    let fileName = null;
    let errRoute = req.originalUrl;
    let timestamp = new Date().getTime();
    let user = res.locals.user;
    let userID = user ? user.id : null;

    if (err instanceof VError) {
        message = err.message;
        status = err.status;

        console.warn("[VError]")
        console.warn("   status: ", status);
        console.warn("   message:", message);
        console.warn("   route:", errRoute);
    } else {
        uuid = v4();

        // Debug only
        console.error("[Error]", typeof err);

        if (err && err instanceof Error) {
            const parsed = parseStack(err.stack);

            stackTrace = err.stack;
            // lineNumber = err.lineNumber;
            lineNumber = parsed.lineNumber;
            fileName = parsed.fileName;

            console.error("   file: ", fileName);
            console.error("   line: ", lineNumber);
        }

        console.error("   uuid: ", uuid);
        // TODO: api call to insert in DB

        console.error("   route:", errRoute);
        console.error("   stack:", err);
    }


    res.status(status);
    res.send({
        error: {
            'msg': message,
            'time': timestamp,
            'uuid': uuid
        }
    });
}