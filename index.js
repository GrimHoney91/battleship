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
    console.log('hello');
    for (i = 0; i < player.gameboard.ships.length; i++) {
        if (player.gameboard.ships[i].type == 'Destroyer') {
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

///////////////(Comment suggestions to be implemented directly above this)/////////////////////////
//Perhaps create a second function like create player that is createComputerPlayer() which inherits
//(continued...) a computer actions object that will have functions that makes playes automatically and randomly,
//(continued...) such as making plays around hits on player ships, knowing not to hit the same place twice, etc.

//////DOM SECTION////////
const startBtn = document.querySelector('#startBtn');
startBtn.addEventListener('click', gameLoop);
const nameInput = document.querySelector('#nameInput');
nameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});
let player;
let computer;
function gameLoop() {
    const centerBlockContainer = document.querySelector('.center-block-container');
    const playerName = document.querySelector('#nameInput').value;
    player = createPlayer(playerName);
    computer = createPlayer('computer');
    console.log(computer);
    console.log(player);
    centerBlockContainer.remove();
    renderGameText();
    renderGameboards(playerName);
    ///////////////////////////////////////Continue Below/////////////////////////
    placeShips();
    
}
function renderGameText() {
    const main = document.querySelector('main');
    const gameText = document.createElement('p');
    gameText.id = 'gameText';
    gameText.textContent = 'Place your ships!';
    main.appendChild(gameText);
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

function placeShips() {
    let num = 5;
    const playerGameboardCells = document.querySelectorAll('#playerGameboard .cell');
    playerGameboardCells.forEach((cell) => {
        let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
        let row = cell.classList[1].slice(1);
        let invalid = false;
        cell.addEventListener('mouseenter', () => { /////yooooooo
            for (i = 0; i < num && num !== 1; i++) {
                if (playerGameboardCells[indy + i].classList[1].slice(1) !== row) {
                    invalid = true;
                }
            }
            if (invalid) {
                for (i = 0; i < num && num !== 1; i++) {
                    playerGameboardCells[indy + i].style.backgroundColor = 'tomato';
                }
            }
            else {
                for (i = 0; i < num && num !== 1; i++) {
                    playerGameboardCells[indy + i].style.backgroundColor = 'lightGreen';
                }
            }
        });
        cell.addEventListener('mouseout', () => {
            let indy = Array.prototype.indexOf.call(playerGameboardCells, cell);
            for (i = 0; i < num && num !== 1; i++) {
                playerGameboardCells[indy + i].style.backgroundColor = 'white';
            }
        });
        cell.addEventListener('click', () => {
            if (!invalid && player.gameboard.ships.length < 5) {
                let array = [];
                for (i = 0; i < num && num !== 1; i++) {
                    array.push(playerGameboardCells[indy + i].classList[1]);
                    playerGameboardCells[indy + i].style.backgroundColor = 'white';
                }
                
                player.gameboard.placeShip(array);
                if (player.gameboard.ships.length == 3) {
                    num = 3;
                }
                else {
                    num -= 1;
                }
                console.log(player);
            }
        });
    });
}

