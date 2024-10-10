module.exports = function (server, session) {
    console.log("# Initializing websocket...")

    const { initialize, onConnection } = require('./middleware/client-api.js');

    const io = require('socket.io')(server);

    initialize(io);

    io.use((socket, next) => {
        session(socket.handshake, {}, next);
    });

    io.on('connection', onConnection);

    console.log("# done!")

    return io;
}