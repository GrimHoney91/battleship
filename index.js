function createShip(coordinates) {
    let ship = Object.create(shipActions);
    ship.type = shipType(coordinates.length);
    ship.positions = coordinates;
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
            }
            else {
                this.missedShots.push(coordinates);
            }
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
            return 'Game Over';
        }
        else {
            return 'Game On';
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
startBtn.addEventListener('click', gameLoop);
const nameInput = document.querySelector('#nameInput');
nameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && nameInput.value !== '') {
        startBtn.click();
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
function generateText(num) {
    const gameText = document.querySelector('#gameText');
    if (player.gameboard.ships.length < 5) {
        gameText.textContent = `Place your ${shipType(num)} (${num} units)`;
    }
    else {
        gameText.textContent = 'Attack the enemy ship!';
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
                    }
                    generateText(num);
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

    let num = generateRandomNumber();

    Object.keys(possibilities[num]).forEach((key) => {
        computer.gameboard.placeShip(possibilities[num][key]);
    });

    console.log(computer);
}

function generateRandomNumber() {
    let min = Math.ceil(0);
    let max = Math.floor(4);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
