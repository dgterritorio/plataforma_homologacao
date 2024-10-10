const events = require('events');

const sendTo = '';
const notifyTplFolder = 'templates/notifications/'

let intervalFn = null;
let qeue = [];

let eventEmitter = null;
let onPGNotify = null;

/**
 * Initializer
 */
function initialize(channel, interval){

    initializeEvents();

    intervalFn = setInterval(notifyRecipients, interval);

    listenService(channel);
}

function initializeEvents(){
    eventEmitter = new events.EventEmitter();

    eventEmitter.addListener('notify', onPGNotify);
}

/**
 * Listener
 */
function listenService(channel, interval){

}

function onPGNotify(){
    
}

/**
 * Notify recipients
 */

function notifyRecipients(){

    qeue.forEach(function(entry){
        console.log("TODO: Notify recipeint :" , entry);
    })
}







module.exports = {
    initialize: initialize
}