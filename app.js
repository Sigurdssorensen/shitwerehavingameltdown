/* A big portion of this app has been created with the framework socket.io, a reference to this framework can be found
along with the source for the first code snippet as can be seen below this text.*/

/*
The code snippet (1. What Socket.iO is, Express.js - Static Files) below has been adapted from
https://socket.io/docs/
AND
https://www.youtube.com/watch?v=8lY9u3JFr5I
The code has been adapted from these sources and mixed together.
*/

// App Setup
const express = require('express');
const app = express();
const server =  require('http').createServer(app);
const io = require('socket.io')(server);

/*
End code snippet (1. What Socket.IO is, Express.js - Static Files)
*/

/*The code snippet (2. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]) below has been
adapted from:
// https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs
The code has been altered to also take into consideration 'process.env.PORT' to allow for hosting on Heroku.
*/
// process.env.PORT
server.listen(3000, '0.0.0.0', function() {
    console.log('listening to requests on port 3000');
});

/*
End code snippet (2. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate])
*/

// Static files & Routing
/* The code snippet (3. 3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide) below
has been sourced from:
https://www.youtube.com/watch?v=_GioD4LpjMw
The code snippet appears in its original form.
*/

// https://www.youtube.com/watch?v=_GioD4LpjMw
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
/*
End code snippet (3. 3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide)
*/

// Constants
const dataPlayerOne = 'css/player_one.css';
const dataPlayerTwo = 'css/player_two.css';

// Shared Variables
let socketIdList = []; // backup socket id
let playerList = [];
let inLoopP1 = false;
let inLoopP2 = false;

// Player One Variables
let commandListP1 = ['Activate safety valve one', 'Activate sector 3 cooling system', 'Activate sector 1 cooling system',
    'Activate safety valve two', 'Activate safety valve four', 'Activate sector 2 cooling system',
    'Activate safety valve three', 'Activate sector 4 cooling system'];
let commandCriteriaP1 = ['safety valve one', 'sector 3 cooling system', 'sector 1 cooling system', 'safety valve two',
    'safety valve four', 'sector 2 cooling system', 'safety valve three', 'sector 4 cooling system'];
let commandsCompletedP1 = [];
let cmdIndexP1 = 0;

// Player Two Variables
let commandListP2 = ['Activate generator output level three', 'Activate top reserve', 'activate middle reserve',
    'Activate generator output level one', 'Activate bottom reserve', 'Activate generator output level four',
    'Activate generator output level two'];
let commandCriteriaP2 = ['generator output level three', 'top reserve', 'middle reserve', 'generator output level one',
    'bottom reserve', 'generator output level four', 'generator output level two'];
let commandsCompletedP2 = [];
let cmdIndexP2 = 0;


// SHARED
io.on('connection', function(socket){
    /* looks for connections to the server and saves the connecting socket id on connection. Upper level function that
    contains all other communications with the clients.

    param: 'connection'(str): listens to when clients emit that they have connected to the server.
    param: func(socket obj): the socket identifier of the unique connection to the server.
    */

    console.log('made socket connection: ', socket.id + '\n');

    socketIdList.push(socket.id);
    console.log('connected sockets: ' + socketIdList + '\n');

    socket.on('ready', function(data) {
        /* Receives message from client when the user clicks the ready button. Adds user data to player list, sends
        player information back to both clients, and when both players are listed sends data on which css file the
        individual client should use.

        param: 'ready'(str): listens to the clients emit on when the user clicks the ready button.
        param: func(data obj): contains the data playerName(str) and playerNumber(int).
        */

        console.log('\n' + playerList + '\n');

        playerList.push(new Player(socket.id, data.playerName, data.playerNumber));

        console.log(playerList);

        io.sockets.emit('addPlayerToOutput', data);

        if(playerList.length === 2) {

            for (let i in playerList) {
                if (playerList[i].playerNumber == 1) {
                    io.to(playerList[i].socketId).emit('runGame', dataPlayerOne);

                } else if (playerList[i].playerNumber == 2) {
                    io.to(playerList[i].socketId).emit('runGame', dataPlayerTwo);
                }
            }
        }
    });

    socket.on('disconnect', function(socket){
        /* When the client disconnects from the server. Removes the socket id from the socketIdList.
        FEATURE IDEA: Does not account for a game that has been finished yet.

        param: 'disconnect'(str): listens to when clients emit that they have disconnected from the server.
        param: func(socket obj): the socket identifier of the unique connection to the server that is to be disconnected.
        */

        let index = socketIdList.indexOf(socket.id);
        socketIdList.splice(index, 1);

        for (let i in playerList) {
            if (socket.id === playerList[i].socketId) {
                playerList.splice(i, 1);
            }
        }
    });

    socket.on('getFirstCommand', function() {
        /* Sends the first command to the clients after five seconds and checks back after five seconds if the task
        has been completed or not, if not emits that command has been failed.

        param: 'getFirstCommand'(str): listens to the clients emit of 'getFirstCommand'.
        param: func(no param): runs the code below.
        */

        setTimeout(function() { // starts the function content after five seconds.
            let playerIndex = checkPlayerNumber(socket.id);
            let playerId = playerList[playerIndex].socketId;

            if (playerList[playerIndex].playerNumber === 1) {
                let criteria = commandCriteriaP1[cmdIndexP1];
                io.to(playerId).emit('newCommandP1', commandListP1[cmdIndexP1], criteria);
                commandsCompletedP1[0] = 'initiated';

                setTimeout(function() { // checks if the task has been completed after five seconds.

                    if(commandsCompletedP1[cmdIndexP1] === 'initiated') {
                        io.to(playerId).emit('taskFailed');
                        commandsCompletedP1[cmdIndexP1] = 'failed';
                    } // else do nothing as the task has been completed.
                }, 5000);


            } else {
                let criteria = commandCriteriaP2[cmdIndexP2];
                io.to(playerId).emit('newCommandP2', commandListP2[cmdIndexP2], criteria);
                commandsCompletedP2[0] = 'initiated';

                setTimeout(function() { // checks if the task has been completed after five seconds.

                    if(commandsCompletedP2[cmdIndexP2] === 'initiated') {
                        io.to(playerId).emit('taskFailed');
                        commandsCompletedP2[cmdIndexP2] = 'failed';
                    } // else do nothing as the task has been completed.
                }, 5000);
            }
        },5000);
    });

    socket.on('commandCompleted', function() {
        /* function that filters through the tasks that have been completed by the clients and sends a new one after
        two seconds, and checks back if that very same task has been completed five seconds after that again.

        param: 'commandCompleted'(str): listens to emits from the clients of type 'commandCompleted'.
        param: func(no param): runs the code below.
        */

        let playerIndex = checkPlayerNumber(socket.id);
        let playerId = playerList[playerIndex].socketId;

        if (playerList[playerIndex].playerNumber === 1) {

            if(inLoopP1 === false) {
                inLoopP1 = true;

                if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                    commandsCompletedP1[cmdIndexP1] = 'completed';
                    io.to(playerId).emit('taskSucceeded');
                }

                cmdIndexP1 ++;
                if(cmdIndexP1 <= commandListP1.length -1) {

                    setTimeout(function(){ // gives the player a new task after two seconds.

                        let criteria = commandCriteriaP1[cmdIndexP1];
                        io.to(playerId).emit('newCommandP1', commandListP1[cmdIndexP1], criteria);
                        commandsCompletedP1[cmdIndexP1] = 'initiated';

                        setTimeout(function() { // checks if the task has been completed after five seconds.

                            if(commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                io.to(playerId).emit('taskFailed');
                                commandsCompletedP1[cmdIndexP1] = 'failed';
                            } // else do nothing as the task has been completed.
                        }, 5000);
                    }, 2000);
                } else {
                    io.to(playerId).emit('prototypeFinished');
                }
                inLoopP1 = false;
            }

        } else {
            if (inLoopP2 === false) {
                inLoopP2 = true;
                if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                    commandsCompletedP2[cmdIndexP2] = 'completed';
                    io.to(playerId).emit('taskSucceeded');
                }

                cmdIndexP2 ++;
                if (cmdIndexP2 <= commandListP2.length -1) {

                    setTimeout(function(){ // gives the player a new task after two seconds.

                        let criteria = commandCriteriaP2[cmdIndexP2];
                        io.to(playerId).emit('newCommandP2', commandListP2[cmdIndexP2], criteria);
                        commandsCompletedP2[cmdIndexP2] = 'initiated';

                        setTimeout(function() { // checks if the task has been completed after five seconds.

                            if(commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                io.to(playerId).emit('taskFailed');
                                commandsCompletedP2[cmdIndexP2] = 'failed';
                            } // else do nothing as the task has been completed.
                        }, 5000);
                    }, 2000);
                } else {
                    io.to(playerId).emit('prototypeFinished');
                }
            }
            inLoopP2 = false;
        }
    });

});

function Player(socketId, playerName, playerNumber) {
    /* Constructor for the object Player.

    param: socketId(str): unique identifier of that specific object.
    param: playerName(str): the name of which the user has written down.
    param: playerNumber(int): the selected player number of the user.
    */
    this.socketId = socketId;
    this.playerName = playerName;
    this.playerNumber = playerNumber;
}

function checkPlayerNumber(id) {
    /* Checks the player number of the incoming emit and returns said number.

    param: id(str): id number that needs to be checked with playerNumber.
    return: noName(int): returns playerNumber that belongs to id.
    */

    for (let i in playerList) {
        if(playerList[i].socketId === id) {
            return i;
        }
    }
}

/* REFERENCE LIST APP.JS

1. socket io(n.d)What Socket.iO is. Retrieved from:
https://socket.io/docs/

1. Nodecasts(2016)Express.js - Static Files. Retrieved from:
https://www.youtube.com/watch?v=8lY9u3JFr5I

2. Stackoverflow(2015)Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]. Retrieved from:
https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs

3. RainingChain(2016)3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide. Retrieved
from: https://www.youtube.com/watch?v=_GioD4LpjMw

*/