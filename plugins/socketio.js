
// import io from 'socket.io-client'

//console.log(process.env.WS_URL)
// const socket = io(process.env.WS_URL)

//export default socket

import io from 'socket.io-client'

export default ({ app }, inject) => {

    // Default to window location if no url is sent
    const socket = io({
        autoConnect: false,
        reconnection: false
    })

    inject('notifications', socket);
}
