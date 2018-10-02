/* A big portion of this app has been created with the framework socket.io, a reference to this framework can be found
along with the source for the first code snippet in the file APP.JS*/

/*The code snippet (1. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]) below has been
sourced from:
https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs
The code snippet appears in its original form.
*/

// Make connection
//http://localhost:3000
let socket = io.connect('http://192.168.43.234:3000');

/*
End code snippet (1. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate])
*/

// Query DOM
let playerName = document.getElementById('player-name'),
    btnReady = document.getElementById('btn-ready'),
    output = document.getElementById('output'),
    cssFile = document.getElementById('css-file'),
    cmdWinTextP1 = document.getElementById('command-window-textfield-p1'),
    coolingBtnOne = document.getElementById('cooling-system-one-btn'),
    coolingBtnTwo = document.getElementById('cooling-system-two-btn'),
    coolingBtnThree = document.getElementById('cooling-system-three-btn'),
    coolingBtnFour = document.getElementById('cooling-system-four-btn'),
    coolingLampOne = document.getElementById('cooling-lamp-one'),
    coolingLampTwo = document.getElementById('cooling-lamp-two'),
    coolingLampThree = document.getElementById('cooling-lamp-three'),
    coolingLampFour = document.getElementById('cooling-lamp-four'),
    cmdWinTextP2 = document.getElementById('command-window-textfield-p2'),
    genLampOne = document.getElementById('generator-lamp-one'),
    genLampTwo = document.getElementById('generator-lamp-two'),
    genLampThree = document.getElementById('generator-lamp-three'),
    genLampFour = document.getElementById('generator-lamp-four'),
    genBtnOne = document.getElementById('generator-level-one-btn'),
    genBtnTwo = document.getElementById('generator-level-two-btn'),
    genBtnThree = document.getElementById('generator-level-three-btn'),
    genBtnFour = document.getElementById('generator-level-four-btn'),
    reserveLampOne = document.getElementById('reserve-lamp-one'),
    reserveLampTwo = document.getElementById('reserve-lamp-two'),
    reserveLampThree = document.getElementById('reserve-lamp-three');

let gameIsRunning = false;
let taskCriteriaP1 = '';
let taskCriteriaP2 = '';
let playerNumber = 0;
let checkingP1 = false;
let checkingP2 = false;

// LANDING PAGE
btnReady.addEventListener('click', function() {
    /* When the 'ready' button is clicked by a user, the player number is checked and details consisting of player name
    and player number are sent to the server.

    param: 'click'(str): checks if the event is a click event.
    param: func(no param): on click executes the following function.
    */

    let checkedOption = '';
    try {
        /*
        The code snippet (2. How to get the selected radio button’s value?) below has been adapted from:
        https://stackoverflow.com/questions/9618504/how-to-get-the-selected-radio-button-s-value
        I have altered the name="options" part of this code to fit with this code's names.
        */

        checkedOption = document.querySelector('input[name="options"]:checked').value.toString();

        /*
        End of code snippet (2. How to get the selected radio button’s value?)
        */

    } catch {
        checkedOption = 'player-one';
    }

    if(checkedOption === 'player-one') {
        socket.emit('ready', {
            playerNumber: 1,
            playerName: playerName.value
        });
        playerNumber = 1;
    } else {
        socket.emit('ready', {
            playerNumber: 2,
            playerName: playerName.value
        });
        playerNumber = 2;
    }
});

socket.on('addPlayerToOutput', function(data){
    /* When the server emits 'addPlayerToOutput' to the clients, the clients disable the player option that has already
    been chosen and appends the player number and name to the screen for all clients to see.

    param: 'addToPlayers'(str): checks if emit from server is 'addPlayerToOutput'.
    param: func(data obj): includes playerNumber(int) and playerName(str) key value pairs.
    */

    if(data.playerNumber === 1) {
        document.getElementById('player-option-one').disabled = true;
    } else {
        document.getElementById('player-option-two').disabled = true;
    }

    output.innerHTML += '<p><strong>' + 'Player ' + data.playerNumber + ': ' + data.playerName + '</strong></p>';

});

socket.on('runGame', function(data) {
    /* Sets the index file to use a css file appropriate to the users chosen player number, starts the game countdown
    and emits a request for the game to start.

    param: 'runGame'(str): checks if emit from server is 'runGame'.
    param: func(data str): contains a string with a reference to the specific css file of which the client is supposed
    to use.
    */

    cssFile.setAttribute("href", data);
    gameIsRunning = true;
    /* The code snippet (3. Javascript, setTimeout loops?) below has been adapted from:
    https://stackoverflow.com/questions/22154129/javascript-settimeout-loops
    The if statement and counter variable has been changed to fit this particular case.
    */

    function start(counter){
        if(counter > 0){
            setTimeout(function(){
                cmdWinTextP1.innerHTML += '<p><strong>' + counter + ', ' + '</strong></p></br>';
                cmdWinTextP2.innerHTML += '<p><strong>' + counter + ', ' + '</strong></p></br>';
                counter--;
                start(counter);
            }, 1000);
        }
    }

    let counter = 4;
    start(counter);

    /*
    End of code snippet (3. Javascript, setTimeout loops?)
    */

    socket.emit('getFirstCommand');
});


// GAME SCREEN PLAYER ONE
socket.on('newCommandP1', function(command, criteria) {
    /* Receives a new command and a criteria to fulfill that command from the server and renders it to the player one
    screen.

    param: 'newCommandP1'(str): checks if emit from server is newCommandP1'.
    param: func(command str, criteria str): function with two string params that include a string that contains the
    information of which the player is about to do, and a string that includes the correct answer to the command.
    */

    cmdWinTextP1.innerHTML += '<p class="blue"> > ' + command + '</p><br/>';
    scrollP1();
    taskCriteriaP1 = criteria;
});

function checkCriteriaP1(actionEvent) {
    /* Checks to see if the button pressed was the correct one in regards to solving the given command.

    param: 'actionEvent'(str): the string element from the button clicked to be compared with the solution.
    */

    if (checkingP1 === false) {
        checkingP1 = true;
        if (actionEvent === taskCriteriaP1) {
            socket.emit('commandCompleted');
            setTimeout(function(){
                checkingP1 = false;
            }, 2000);
        } else {
            checkingP1 = false;
            // increase heat level or something for being wrong.
        }
    }
}


// GAME SCREEN PLAYER TWO
socket.on('newCommandP2', function(command, criteria) {
    /* Receives a new command and a criteria to fulfill that command from the server and renders it to the player two
    screen.

    param: 'newCommandP2'(str): checks if emit from server is newCommandP1'.
    param: func(command str, criteria str): function with two string params that include a string that contains the
    information of which the player is about to do, and a string that includes the correct answer to the command.
    */

    cmdWinTextP2.innerHTML += '<p class="blue"> > ' + command + '</p><br/>';
    scrollP2();
    taskCriteriaP2 = criteria;
});

function checkCriteriaP2(actionEvent) {
    /* Checks to see if the button pressed was the correct one in regards to solving the given command.

    param: 'actionEvent'(str): the string element from the button clicked to be compared with the solution.
    */

    if (checkingP2 === false) {
        checkingP2 = true;
        if(actionEvent === taskCriteriaP2) {
            socket.emit('commandCompleted');
            setTimeout(function(){
                checkingP2 = false;
            }, 2000);
        } else {
            checkingP2 = false;
            // increase heat level or something for being wrong.
        }
    }
}

socket.on('taskFailed', function() {
    /* Renders a string in red 'Task failed' to the appropriate player's screen.

    param: 'taskFailed'(str): listening to when the server emits 'taskFailed'.
    param: func(no param): function as a parameter, where the code underneath is run whenever socket.on('taskFailed) is
    emitted from the server.
    */

    // FEATURE IDEA: Set fail condition, e.g., increase heat level or something
    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p class="red wide-text"> > Task failed </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p class="red wide-text"> > Task failed </p><br/>';
        scrollP2();
    }

    socket.emit('commandCompleted');
});

socket.on('taskSucceeded', function() {
    /* Renders a string in green when a task has been successfully completed.

    param: 'taskSucceeded'(str): listens to the server for it's emit of 'taskSucceeded'.
    param: func(no param): runs the code beneath.
    */

    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p class="green wide-text"> > Task successful </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p class="green wide-text"> > Task successful </p><br/>';
        scrollP2();
    }

});

socket.on('prototypeFinished', function() {
    /* Renders a string in black to inform the user when the prototyping is completed.

    param: 'prototypeFinished(str): listens to the server for it's emit of 'prototypeFinished'.
    param: func(no param): runs the code beneath.
    */

    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p> > Prototype Finished </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p> > Prototype Finished </p><br/>';
        scrollP2();
    }

});

// ACTION LISTENERS PLAYER 1
coolingBtnOne.addEventListener('click', function() {
    /* Listens to click events on 'coolingBtnOne'.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

   checkCriteriaP1('safety valve one');
});

coolingBtnTwo.addEventListener('click', function() {
    /* Listens to click events on 'coolingBtnTwo'.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP1('safety valve two');
});

coolingBtnThree.addEventListener('click', function() {
    /* Listens to click events on 'coolingBtnThree'.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP1('safety valve three');
});

coolingBtnFour.addEventListener('click', function() {
    /* Listens to click events on 'coolingBtnFour'.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP1('safety valve four');
});


// ACTION LISTENERS PLAYER 2
genBtnOne.addEventListener('click', function() {
    /* Listens to click events on 'getBtnOne' and changes color of signal lamp.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP2('generator output level one');
    if (genLampOne.src.match("-grey")) {
        /* the grey lamp has been altered from its original form using photoshop. To see the reference to the original
        lamp img, see the sources section in the file index.html. */
        genLampOne.src = genLampOne.src.replace("-grey", "-yellow");
    } else {
        genLampOne.src = genLampOne.src.replace("-yellow", "-grey");
    }
});

genBtnTwo.addEventListener('click', function() {
    /* Listens to click events on 'getBtnTwo' and changes color of signal lamp.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP2('generator output level two');
    if (genLampTwo.src.match("-grey")) {
        genLampTwo.src = genLampTwo.src.replace("-grey", "-yellow");
    } else {
        genLampTwo.src = genLampTwo.src.replace("-yellow", "-grey");
    }
});

genBtnThree.addEventListener('click', function() {
    /* Listens to click events on 'getBtnThree' and changes color of signal lamp.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP2('generator output level three');
    if (genLampThree.src.match("-grey")) {
        genLampThree.src = genLampThree.src.replace("-grey", "-yellow");
    } else {
        genLampThree.src = genLampThree.src.replace("-yellow", "-grey");
    }
});

genBtnFour.addEventListener('click', function() {
    /* Listens to click events on 'getBtnFour' and changes color of signal lamp.

    param: 'click'(str): listening to button click.
    param. func(no param): runs the code below.
    */

    checkCriteriaP2('generator output level four');
    if (genLampFour.src.match("-grey")) {
        genLampFour.src = genLampFour.src.replace("-grey", "-yellow");
    } else {
        genLampFour.src = genLampFour.src.replace("-yellow", "-grey");
    }
});


// SHARED ACTION LISTENER
document.addEventListener('keydown', function(e) {
    /* Listens to keydown events on for all keyboard buttons for player one and player two and changes the signal lamp
     color of the correct button light.

    param: 'keydown'(str): listening to button press.
    param. func(e string): runs the code below and uses the event (e) to find the correct code for the correct keypress.
    */

    if (gameIsRunning) {
        let key = e.key;

        // player one keys start here
        if (key === '1') {
            checkCriteriaP1('sector 1 cooling system');
            if (coolingLampOne.src.match("-grey")) {
                coolingLampOne.src = coolingLampOne.src.replace("-grey", "-yellow");
            } else {
                coolingLampOne.src = coolingLampOne.src.replace("-yellow", "-grey");
            }

        } else if (key === '2') {
            checkCriteriaP1('sector 2 cooling system');
            if (coolingLampTwo.src.match("-grey")) {
                coolingLampTwo.src = coolingLampTwo.src.replace("-grey", "-yellow");
            } else {
                coolingLampTwo.src = coolingLampTwo.src.replace("-yellow", "-grey");
            }

        } else if (key === '3') {
            checkCriteriaP1('sector 3 cooling system');
            if (coolingLampThree.src.match("-grey")) {
                coolingLampThree.src = coolingLampThree.src.replace("-grey", "-yellow");
            } else {
                coolingLampThree.src = coolingLampThree.src.replace("-yellow", "-grey");
            }

        } else if (key === '4') {
            checkCriteriaP1('sector 4 cooling system');
            if (coolingLampFour.src.match("-grey")) {
                coolingLampFour.src = coolingLampFour.src.replace("-grey", "-yellow");
            } else {
                coolingLampFour.src = coolingLampFour.src.replace("-yellow", "-grey");
            }

            // Player two keys start here
        } else if (key === 'q') {
            checkCriteriaP2('top reserve');
            if (reserveLampOne.src.match("-grey")) {
                reserveLampOne.src = reserveLampOne.src.replace("-grey", "-yellow");
            } else {
                reserveLampOne.src = reserveLampOne.src.replace("-yellow", "-grey");
            }
        } else if (key === 'w') {
            checkCriteriaP2('middle reserve');
            if (reserveLampTwo.src.match("-grey")) {
                reserveLampTwo.src = reserveLampTwo.src.replace("-grey", "-yellow");
            } else {
                reserveLampTwo.src = reserveLampTwo.src.replace("-yellow", "-grey");
            }
        } else if (key === 'e') {
            checkCriteriaP2('bottom reserve');
            if (reserveLampThree.src.match("-grey")) {
                reserveLampThree.src = reserveLampThree.src.replace("-grey", "-yellow");
            } else {
                reserveLampThree.src = reserveLampThree.src.replace("-yellow", "-grey");
            }
        }
    }
    // Doesn't do anything when the game has yet to start.
});

function scrollP1() {
    /* Scrolls the command window of player one down to the bottom.*/

    /* The code snippet (4. Scroll to bottom of div?) below has been altered from:
    https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
    The variables calling the scrollTop has been altered from the original example.
    */

    cmdWinTextP1.scrollTop = cmdWinTextP1.scrollHeight - cmdWinTextP1.clientHeight;
}

function scrollP2() {

    cmdWinTextP2.scrollTop = cmdWinTextP2.scrollHeight - cmdWinTextP2.clientHeight;
}

/*
End of code snippet (4. Scroll to bottom of div?)
*/

/* REFERENCE LIST MAIN.JS

1. Stackoverflow(2015)Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]. Retrieved from:
https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs

2. stackoverflow(2016) 2. How to get the selected radio button’s value?. Retrieved from:
https://stackoverflow.com/questions/9618504/how-to-get-the-selected-radio-button-s-value

3. stackoverflow(2015)3. Javascript, setTimeout loops?. Retrieved from:
    https://stackoverflow.com/questions/22154129/javascript-settimeout-loops

4. stackoverflow(2015)Scroll to bottom of div?. Retrieved from:
https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div

*/