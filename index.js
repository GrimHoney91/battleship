let audio = {
    waves: new Audio('audio/waves.wav'),
    music: new Audio('audio/music.mp3'),
    key: new Audio('audio/key.wav'),
    drum: new Audio('audio/start.wav'),
    shipDrop: new Audio('audio/splash.wav'),
    explosion: new Audio('audio/explosion.wav'),
    sunk: new Audio('audio/sunk.wav'),
    whoosh: new Audio('audio/whoosh.wav'),
    win: new Audio('audio/lose2.wav'),
    lose: new Audio('audio/lose.wav')
}
audio.music.volume = 0.15;
audio.music.loop = true;
audio.explosion.volume = 0.5;
audio.shipDrop.volume = 0.2;
audio.whoosh.volume = 0.6;
audio.drum.volume = 0.8;
audio.key.volume = 0.6;

const musicBtn = document.querySelector('#music');
musicBtn.addEventListener('click', () => {
    if (audio.music.paused) {
        audio.music.play();
        musicBtn.style.backgroundImage = "url('images/play.png')";
    }
    else {
        audio.music.pause();
        musicBtn.style.backgroundImage = "url('images/mute.png')";
    }
});

function createShip(coordinates) {
    let ship = Object.create(shipActions);
    ship.type = shipType(coordinates.length);
    ship.positions = coordinates;
    ship.shotsHit = [];
    ship.sunk = false;
    return ship;
}

function shipType(length) {
    if (length == 5) {
        return 'Carrier';
    }
    else if (length == 4) {
        return 'Battleship';
    }
    else if (destroyerExists() && length == 3) {
        return 'Submarine';
    }
    else if (length == 3) {
        return 'Destroyer';
    }
    else if (length == 2) {
        return 'Patrol Boat';
    } 
}

function destroyerExists() {
    let obj = player;
    if (player.gameboard.ships == 0) {
        obj = computer;
    }
    for (i = 0; i < obj.gameboard.ships.length; i++) {
        if (obj.gameboard.ships[i].type == 'Destroyer') {
            return true;
        }
    }
}

let shipActions = {
    hit(coordinates) {
        for (i = 0; i < this.positions.length; i++) {
            if (this.positions[i] == coordinates) {
                this.positions.splice(i, 1);
                this.shotsHit.push(coordinates);
                if (this.positions.length === 0) {
                    this.sunk = true;
                }
            }
        }
    },
    isSunk() {
        if (this.positions.length === 0) {
            this.sunk = true;
        }
    },
};

function createGameboard() {
    let gameboard = Object.create(gameboardActions);
    gameboard.ships = [];
    gameboard.missedShots = [];
    gameboard.shotsHit = [];
    return gameboard;
}

let gameboardActions = {
    placeShip(coordinates) {
        let ship = createShip(coordinates);
        this.ships.push(ship);
    },
    receiveAttack(coordinates) {
        for (i = 0; i < this.ships.length; i++) {
            if (this.ships[i].positions.includes(coordinates)) {
                this.ships[i].hit(coordinates);
                this.shotsHit.push(coordinates); 
            }
        }
        if (!this.shotsHit.includes(coordinates)) {
            this.missedShots.push(coordinates);
        }
    },
    gameStatus() {
        let shipsSunk = 0;
        for(i = 0; i < this.ships.length; i++) {
           if (this.ships[i].sunk) {
            shipsSunk += 1;
           }
        }
        if (shipsSunk == this.ships.length) {
            return true;
        }
        else {
            return false;
        }
    }
};

function createPlayer(name) {
   return {
       name,
       gameboard: createGameboard(),
   }
}

// (Comment suggestions to be implemented directly above this)
// Perhaps create a second function like create player that is createComputerPlayer() which inherits
// (continued...) a computer actions object that will have functions that makes playes automatically and randomly,
// (continued...) such as making plays around hits on player ships, knowing not to hit the same place twice, etc.

// DOM SECTION///
const startBtn = document.querySelector('#startBtn');
startBtn.addEventListener('click', () => {
    if (nameInput.value !== '') {
        audio.music.volume = 0.2;
        audio.drum.play();
        gameLoop();
        setTimeout(() => {
            audio.waves.play();
            audio.waves.volume = 0.2;
        }, 500);
        audio.waves.loop = true;
    }
});
const nameInput = document.querySelector('#nameInput');
nameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && nameInput.value !== '') {
        startBtn.click();
    }
    else {
        audio.key.pause();
        audio.key.currentTime = 0;
        audio.key.play();
    }
});

let player;
let computer;

function gameLoop() {
    const centerBlockContainer = document.querySelector('.center-block-container');
    const nameInput = document.querySelector('#nameInput');
    const playerName = nameInput.value[0].toUpperCase() + nameInput.value.slice(1);
    player = createPlayer(playerName);
    computer = createPlayer('computer');
    console.log(computer);
    console.log(player);
    centerBlockContainer.remove();
    renderTextBox();
    renderGameboards(playerName);
    generateBtn();
    placePlayerShips();
    placeComputerShips();
}

function renderTextBox() {
    const main = document.querySelector('main');
    const gameText = document.createElement('p');
    gameText.id = 'gameText';
    gameText.textContent = 'Place your Carrier (5 units)';
    main.appendChild(gameText);
}
function generateText(num, text) {
    const gameText = document.querySelector('#gameText');
    if (player.gameboard.ships.length < 5) {
        gameText.textContent = `Place your ${shipType(num)} (${num} units)`;
    }
    else {
        gameText.textContent = text;
    }
}

function renderGameboards(playerName) {
    const main = document.querySelector('main');
    const gameboardContainer = document.createElement('div');
    gameboardContainer.id = 'gameboardContainer';
    const playerGameboard = document.createElement('div');
    playerGameboard.id = 'playerGameboard';
    playerGameboard.classList.add('gameboards');
    let array = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I', 'J'];

    cellCreation(playerGameboard, array);

    const computerGameboard = playerGameboard.cloneNode(true);
    computerGameboard.id = "computerGameboard";

    const playerLabel = document.createElement('p');
    playerLabel.classList.add('gameboardLabels');
    playerLabel.id = 'playerLabel';
    playerLabel.textContent = playerName;

    const computerLabel = playerLabel.cloneNode(true);
    computerLabel.id = 'computerLabel';
    computerLabel.textContent = 'Computer';
    
    playerGameboard.appendChild(playerLabel);
    computerGameboard.appendChild(computerLabel);
    gameboardContainer.append(playerGameboard, computerGameboard);
    main.appendChild(gameboardContainer);
}

function cellCreation(gameboard, array) {
    for (num = 1; num < 11; num++) {
        for(i = 0; i < array.length; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add(array[i] + num);
            if (num == 1) {
                const cellLabel = document.createElement('p');
                cellLabel.classList.add('cellLabel');
                cellLabel.textContent = array[i];
                cell.appendChild(cellLabel);
            }
            if (array[i] == 'A') {
                const cellNumber = document.createElement('p');
                cellNumber.classList.add('cellNumber');
                cellNumber.textContent = num;
                cell.appendChild(cellNumber);
            }
            gameboard.appendChild(cell);
        }
    }
}

let vert = 1;

function generateBtn() {
    const btnContainer = document.createElement('div');
    btnContainer.id = 'btn-container';
    const rotateBtn = document.createElement('button');
    rotateBtn.id = 'rotate-btn';
    rotateBtn.textContent = 'Rotate Ship';
    rotateBtn.addEventListener('click', () => {
       if (vert == 1) {
           vert = 10;
       }
       else {
           vert = 1;
       }
    });

    btnContainer.appendChild(rotateBtn);
    const gameboardContainer = document.querySelector('#gameboardContainer');
    gameboardContainer.appendChild(btnContainer);
}


function placePlayerShips() {
    let num = 5;
    let invalid = false;
    const playerGameboardCells = document.querySelectorAll('#playerGameboard div.cell');
    playerGameboardCells.forEach((cell) => {
        cell.addEventListener('mouseenter', () => {
            if (validityCheck(cell, num)) {
                invalid = true;
            }
            highlight(cell, invalid, num);
        });

        cell.addEventListener('mouseout', () => {
            unhighlight(cell, num);
            invalid = false;
        });

        cell.addEventListener('click', () => {
            if (!invalid && player.gameboard.ships.length < 5) {
                if (markShip(cell, invalid, num)) {
                    if (player.gameboard.ships.length == 3) {
                        num = 3;
                    }
                    else {
                        num -= 1;
                    }
                    if (player.gameboard.ships.length == 5) {
                        const btnContainer = document.querySelector('#btn-container');
                        btnContainer.remove();
                        allowAttacks();
                    }
                    generateText(num, text.attack);
                    console.log(num);
                    console.log(player);
                }
            }
        });
       
    });
}
/////////////////go back until vert is gone//////////////
function validityCheck(cell, num) {
    const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
    let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
    let row = cell.classList[1].slice(1);
    if (vert == 10) {
        row = cell.classList[1].slice(0, 1);
    }
    let array = [];
    for (i = 0; i < num && num !== 1; i++) {
        if (playerGameboardCells[indy + i * vert] === undefined) {
            return true;
        }
        else if (playerGameboardCells[indy + i * vert].classList[1].slice(1) !== row) {
            if (vert == 1) {
                return true;
            }
        }
        array.push(playerGameboardCells[indy + i * vert].classList[1]);
    }
    if (stacked(array)) {
        return true;
    }
}

function stacked(array) {
    let invalid = false;
    array.forEach((element) => {
        for(i = 0; i < player.gameboard.ships.length; i++) {
            player.gameboard.ships[i].positions.forEach((position) => {
                if (element == position) {
                    invalid = true;
                }
            });
        }
    });
    return invalid;
}

function highlight(cell, invalid, num) {
    const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
    let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
    if (invalid) {
        for (i = 0; i < num && num !== 1; i++) {
            if (playerGameboardCells[indy + i * vert] === undefined || playerGameboardCells[indy + i * vert].classList.contains('marked')) {
                break;
            }
            else {
                playerGameboardCells[indy + i * vert].style.backgroundColor = 'tomato';
            }
        }
    }
    else {
        for (i = 0; i < num && num !== 1; i++) {
            playerGameboardCells[indy + i * vert].style.backgroundColor = 'lightGreen';
        }
    }
}

function unhighlight(cell, num) {
    const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
    let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
    for (i = 0; i < num && num !== 1; i++) {
        if (playerGameboardCells[indy + i * vert] === undefined || playerGameboardCells[indy + i * vert].classList.contains('marked')) {
            break;
        }
        else {
            playerGameboardCells[indy + i * vert].style.backgroundColor = 'white';
        }
    }
}

function markShip(cell, invalid, num) {
    const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
    let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
    if (!invalid) {
        let array = [];
        for (i = 0; i < num && num !== 1; i++) {
            array.push(playerGameboardCells[indy + i * vert].classList[1]);
            playerGameboardCells[indy + i * vert].classList.add('marked');
            playerGameboardCells[indy + i * vert].style.backgroundColor = 'grey';
        }
        player.gameboard.placeShip(array);
        audio.shipDrop.pause();
        audio.shipDrop.currentTime = 0;
        audio.shipDrop.play();
        return true;
    } 
}

function placeComputerShips() {
    let possibilities = [
        {carrier: ['A3', 'A4', 'A5', 'A6', 'A7'], battlship: ['D2', 'E2', 'F2', 'G2'], destroyer: ['D8', 'E8', 'F8'], submarine: ['H5', 'H6', 'H7'], patrolBoat: ['F9', 'G9']},
        {carrier: ['E10', 'F10', 'G10', 'H10', 'I10'], battlship: ['I3', 'I4', 'I5', 'I6'], destroyer: ['B2', 'C2', 'D2'], submarine: ['C5', 'D5', 'E5'], patrolBoat: ['A10', 'B10']},
        {carrier: ['E6', 'E7', 'E8', 'E9', 'E10'], battlship: ['G9', 'H9', 'I9', 'J9'], destroyer: ['B2', 'B3', 'B4'], submarine: ['A10', 'B10', 'C10'], patrolBoat: ['H5', 'H6']},
        {carrier: ['H4', 'H5', 'H6', 'H7', 'H8'], battlship: ['C4', 'C5', 'C6', 'C7'], destroyer: ['F1', 'G1', 'H1'], submarine: ['B2', 'C2', 'D2'], patrolBoat: ['A5', 'A6']},
        {carrier: ['A2', 'A3', 'A4', 'A5', 'A6'], battlship: ['B1', 'C1', 'D1', 'E1'], destroyer: ['G3', 'G4', 'G5'], submarine: ['G10', 'H10', 'I10'], patrolBoat: ['C8', 'C9']},
    ];

    let num = generateRandomNumber(0, 4);

    Object.keys(possibilities[num]).forEach((key) => {
        computer.gameboard.placeShip(possibilities[num][key]);
    });

    console.log(computer);
}

function generateRandomNumber(num1, num2) {
    let min = Math.ceil(num1);
    let max = Math.floor(num2);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function allowAttacks() {
    let playerTurn = true;

    const computerGameboardCells = document.querySelectorAll('#computerGameboard .cell');
    computerGameboardCells.forEach((cell) => {
        cell.addEventListener('click', () => {
            let coordinates = cell.classList[1];
            if (noRepeat(computer, coordinates) && playerTurn) {
                computer.gameboard.receiveAttack(coordinates);
                markGameboard(computer);
                determineHit(player, coordinates);
                playerTurn = false;
                flowControl();
                setTimeout(() => {
                    if (!determineWinner()) {
                        playerTurn = true;
                    }
                }, 3650);
            }
        });
    });
}

function noRepeat(obj, coordinates) {
    if (!obj.gameboard.missedShots.includes(coordinates) && !obj.gameboard.shotsHit.includes(coordinates)) {
        return true;
    }
}

function markGameboard(obj) {
    let enemy;
    if (obj.name == 'computer') {
        enemy = obj.name;
    }
    else {
        enemy = 'player';
    }

    obj.gameboard.missedShots.forEach((coordinate) => {
        document.querySelector(`#${enemy}Gameboard .${coordinate}`).style.backgroundColor = 'tomato';
    });
    obj.gameboard.shotsHit.forEach((coordinate) => {
        document.querySelector(`#${enemy}Gameboard .${coordinate}`).style.backgroundColor = 'lightGreen';
    });
}

function performEnemyAttack() {
    let coordinates = generatePlayerCoordinates();

    while (!noRepeat(player, coordinates)) {
        coordinates = generatePlayerCoordinates();
    }

    player.gameboard.receiveAttack(coordinates);
    markGameboard(player);
    determineHit(computer, coordinates);
    generatePotentialHits();
    generatePotentialHits();
    console.log(coordinatesHit);
    console.log(potentialHits);
}

let coordinatesHit = [];
let potentialHits = [];

function generatePlayerCoordinates() {
    const playerGameboardCells = document.querySelectorAll(`#playerGameboard .cell`);
    let randomInteger = generateRandomNumber(0, 99);

    if (potentialHits.length == 1) {
        randomInteger = potentialHits[0];
    }
    else if (potentialHits.length > 1) {
        let randomIndex = generateRandomNumber(0, potentialHits.length - 1);
        randomInteger = potentialHits[randomIndex];
    } 

    let coordinates = playerGameboardCells[randomInteger].classList[1];

    return coordinates;
}

function generatePotentialHits() {
    if (coordinatesHit.length > 0) {
        const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
        const cell = document.querySelector(`#playerGameboard .${coordinatesHit[0]}`);
        let index = Array.prototype.indexOf.call(playerGameboardCells, cell);
        let array = [index + 10, index - 10, index + 1, index - 1];

        for (i = 0; i < array.length; i++) {
            if (playerGameboardCells[array[i]] !== undefined) {
                let coordinates = playerGameboardCells[array[i]].classList[1];
                if (i == 0 || i == 1) {
                    if (player.gameboard.shotsHit.includes(coordinates)) {
                        array.splice(2);
                        break;
                    }
                }
                else if (i == 2 || i == 3) {
                    if (player.gameboard.shotsHit.includes(coordinates)) {
                        array.splice(0, 2);
                        break;
                    }
                }
            }
        }

        let newArray = [];

        for(i = 0; i < array.length; i++) {
            if (playerGameboardCells[array[i]] !== undefined) {
                let coordinates = playerGameboardCells[array[i]].classList[1];
                if (noRepeat(player, coordinates)) {
                    newArray.push(array[i]);
                }
            }
        }

        if (newArray.length == 0) {
            coordinatesHit.splice(0, 1);
        }

        potentialHits = newArray;
    }
}

function moveOn(coordinates) {
    for(i = 0; i < player.gameboard.ships.length; i++) {
        if (player.gameboard.ships[i].shotsHit.includes(coordinates) && player.gameboard.ships[i].sunk) {
            coordinatesHit.splice(0);
            potentialHits.splice(0);
        }
    }
}

function determineHit(obj, coordinates) {
    if (obj.name == 'computer') {
        if (player.gameboard.shotsHit.includes(coordinates)) {
            generateSunkOrHitText(player, coordinates);
            coordinatesHit.push(coordinates);
            moveOn(coordinates);
        }
        else if (player.gameboard.missedShots.includes(coordinates)) {
            generateText(null, text.missedPlayer);
            audio.whoosh.pause();
            audio.whoosh.currentTime = 0;
            audio.whoosh.play();
        }
    }
    else {
        if (computer.gameboard.shotsHit.includes(coordinates)) {
            generateSunkOrHitText(computer, coordinates);
        }
        else if (computer.gameboard.missedShots.includes(coordinates)) {
            generateText(null, text.missedComputer);
            audio.whoosh.pause();
            audio.whoosh.currentTime = 0;
            audio.whoosh.play();
        }
    }
}

function generateSunkOrHitText(obj, coordinates) {
    let sunkText = false;
    let shipType = '';
    for (i = 0; i < obj.gameboard.ships.length; i++) {
        if (obj.gameboard.ships[i].sunk && obj.gameboard.ships[i].shotsHit.includes(coordinates)) {
            sunkText = true;
            shipType = obj.gameboard.ships[i].type;
            break;
        }
    }

    if (sunkText) {
        if (obj.name !== 'computer') {
            generateText(null, text.computerSunkShip(shipType));
        }
        else {
            generateText(null, text.playerSunkShip(shipType));
        }
        audio.sunk.volume = 0.3;
        audio.sunk.pause();
        audio.sunk.currentTime = 0;
        audio.sunk.play();
    }
    else {
        if (obj.name !== 'computer') {
            generateText(null, text.hitPlayer);
        }
        else {
            generateText(null, text.hitComputer);
        }
        audio.explosion.pause();
        audio.explosion.currentTime = 0;
        audio.explosion.play();
    }
}

let text = {
    attack: 'Attack the enemy ship!',
    hitComputer: 'You hit the enemy ship!' ,
    missedComputer: 'You missed.',
    playerShipsSunk: 'The enemy sunk all of your ships!',
    playerWins: 'YOU WIN',
    playerSunkShip: (shipType) => {
        return `You sunk the enemy's ${shipType}!`;
    },

    
    enemyAttack: 'The enemy is preparing an attack...',
    hitPlayer: 'The enemy hit your ship!',
    missedPlayer: 'The enemy missed.',
    computerShipsSunk: `You destroyed all of the enemy's ships!`,
    computerWins: 'YOU LOSE',
    computerSunkShip: (shipType) => {
        return `The enemy sunk your ${shipType}!`;
    },
}

function flowControl() {
    if (!determineWinner()) {
        setTimeout(() => {
            generateText(null, text.enemyAttack);
        }, 1000);
        setTimeout(() => {
            performEnemyAttack();
        }, 2400);
        setTimeout(() => {
            if (!determineWinner()) {
                generateText(null, text.attack);
            }
            else {
                endGame();
            }
        }, 3600);
    }
    else {
        endGame()
    }
}

function determineWinner() {
    if (player.gameboard.gameStatus()) {
        generateText(null, text.playerShipsSunk);
        return true;
    }
    else if (computer.gameboard.gameStatus()) {
        generateText(null, text.computerShipsSunk);
        return true;
    }
}

function endGame() {
    setTimeout(() => {
        declareWinner();
    }, 3500);
}

function declareWinner() {
    const main = document.querySelector('main');
    while (main.firstChild) {
        main.firstChild.remove();
    }

    const endGameDiv = document.createElement('div');
    endGameDiv.id = 'end-game-div';

    const endGameText = document.createElement('p');
    endGameText.id = 'end-game-text';

    if (player.gameboard.gameStatus()) {
        endGameText.textContent = text.computerWins;
        endGameText.style.color = 'crimson';
        endGameText.style.textShadow = '0 0 1.25rem crimson';
        console.log('yo');
        audio.lose.play();
    }
    else if (computer.gameboard.gameStatus()) {
        console.log('baby');
        endGameText.textContent = text.playerWins;
        endGameText.style.color = '#9FE2BF';
        endGameText.style.textShadow = '0 0 1.25rem #9FE2BF';
        audio.win.play();
    }

    const restartBtnContainer = document.createElement('div');
    restartBtnContainer.id = 'restart-btn-container';

    const restartBtn = document.createElement('button');
    restartBtn.id = 'restart-btn';
    restartBtn.textContent = 'Restart';
    restartBtn.addEventListener('click', restartGame);

    restartBtnContainer.appendChild(restartBtn);

    endGameDiv.append(endGameText, restartBtnContainer);
    main.appendChild(endGameDiv);
    audio.waves.pause();
    audio.music.pause();
}

function restartGame() {
    const main = document.querySelector('main');
    const endGameDiv = document.querySelector('#end-game-div');
    endGameDiv.remove();

    const centerBlockContainer = document.createElement('div');
    centerBlockContainer.classList.add('center-block-container');

    const centerBlock = document.createElement('div');
    centerBlock.classList.add('center-block');

    const nameInputLabel = document.createElement('label');
    nameInputLabel.id = 'name-input-label';
    nameInputLabel.textContent = 'Enter Your Name';

    nameInput.value = '';

    const centerBlockBreak = document.createElement('br');

    centerBlock.append(nameInputLabel, centerBlockBreak, nameInput);

    const blockContainerBreak = document.createElement('br');

    centerBlockContainer.append(centerBlock, blockContainerBreak, startBtn);

    main.append(centerBlockContainer, musicBtn);
}