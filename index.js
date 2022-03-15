let ships = [];

function createShip(length) {
    let ship = Object.create(shipActions);
    ship.type = shipType();
    ship.positions = [];
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
    else if (length == 3) {
        return 'Destroyer';
    }
    else if (destroyerExists && length == 3) {
        return 'Submarine';
    }
    else {
        return 'Patrol Boat';
    } 
}

function destroyerExists() {
    for (i = 0; i < ships.length; i++) {
        if (ships[i].type == 'Destroyer') {
            return true;
        }
    }
}

let shipActions = {
    hit(coordinates, positions) {
        positions.forEach((position) => {
            if (coordinates == position) {
                positions.splice(position, 1);
            }
        });
    },
    isSunk() {
        if (positions.length == 0) {
            sunk = true;
        }
    },
};