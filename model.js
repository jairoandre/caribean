import {debugJson, randomElement, portStarBoard} from './utils';

const DIRECTIONS_EVEN = [[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
const DIRECTIONS_ODD = [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]];

const GRID_WIDTH = 23;
const GRID_HEIGHT = 21;

const COORDS = generateCoords();

function randomX() {
  return Math.floor(Math.random() * GRID_WIDTH);
}

function randomY() {
  return Math.floor(Math.random() * GRID_HEIGHT);
}

export function randomCoord() {
  return new Coord(randomX(), randomY());
}

function generateCoords() {
  let coords = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      coords.push(new Coord(x, y));
    }
  }
  return coords;
}

/**
 * Coordinates structure
 **/
export function Coord(x, y) {
  this.x = x;
  this.y = y;
}

Coord.prototype.key = function() {
  return `${this.x}_${this.y}`;
}

Coord.prototype.isInsideMap = function() {
  return this.x >= 0 && this.x < GRID_WIDTH && this.y >= 0 && this.y < GRID_HEIGHT;
}

Coord.prototype.angle = function(target) {
  let dy = target.y - this.y * Math.sqrt(3) / 2;
  let dx = target.x - this.x + ((this.y - target.y) & 1) * 0.5;
  let angle = Math.round(-Math.atan2(dy, dx) * 3 / Math.PI);
  if (angle < 0) {
    angle += 6;
  } else if (angle >= 6) {
    angle -= 6;
  }
  return angle;
}

Coord.prototype.toCubeCoord = function() {
  let xp = this.x - (this.y - (this.y & 1)) / 2;
  let zp = this.y;
  let yp = -(xp + zp);
  return new CubeCoord(xp, yp, zp);
}

Coord.prototype.neighbor = function(orientation, distance) {
  let newX, newY;
  if (this.y & 1 === 1) {
    newX = this.x + DIRECTIONS_ODD[orientation][0];
    newY = this.y + DIRECTIONS_ODD[orientation][1];    
  } else{
    newX = this.x + DIRECTIONS_EVEN[orientation][0];
    newY = this.y + DIRECTIONS_EVEN[orientation][1];    
  }
  let result = new Coord(newX, newY);
  if (distance && distance > 1) {
    return result.neighbor(orientation, distance - 1);
  } else {   
    return result; 
  }
}

Coord.prototype.neighbors = function() {
  let neighbors = [];
  for (let i = 0; i < 6; i++) {
    neighbors.push(this.neighbor(i));
  }
  return neighbors;
}

Coord.prototype.distanceTo = function(target) {
  return this.toCubeCoord().distanceTo(target.toCubeCoord());
}

Coord.prototype.equals = function(target) {
  return this.x === target.x && this.y === target.y;
}

Coord.prototype.pickRandom = function(radius, maxRadius, orientations) {
  let coords = COORDS;
  let coord = this;
  if (radius) {
    coords = coords.filter((target) => coord.distanceTo(target) <= radius);
    if (maxRadius) {
      coords = coords.filter((target) => coord.distanceTo(target) >= maxRadius);
      if (orientations) {
        coords = coords.filter((target) => orientations[coord.angle(target)]);
      }
    }    
  }
  return randomElement(coords);
}

Coord.prototype.turnsToHit = function(target) {
  return Math.round(1 + (this.distanceTo(target)) / 3);
}

/**
CubeCood to calculate distances
 **/
export function CubeCoord(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

CubeCoord.prototype.distanceTo = function(target) {
  return (Math.abs(this.x - target.x) + Math.abs(this.y - target.y) + Math.abs(this.z - target.z)) / 2;
}

/**
Entidades
 **/
export function Entity(inputs) {
  this.id = +inputs[0];
  this.type = inputs[1];
  this.coord = new Coord(+inputs[2], +inputs[3]);
  this.arg1 = +inputs[4];
  this.arg2 = +inputs[5];
  this.arg3 = +inputs[6];
  this.arg4 = +inputs[7];
  this.inputs = inputs;
  this.remove = false;
  this.checked = false;
}

Entity.prototype.clone = function() {
  return new Entity(this.inputs);
}

Entity.prototype.checkType = function(type) {
  return this.type === type;
}

Entity.prototype.isMyShip = function() {
  return this.arg4 === 1;
}

Entity.prototype.createShip = function() {
  return new Ship(this.id, this.coord, this.arg1, this.arg2, this.arg3, this.arg4);
}

Entity.prototype.createMine = function() {
  return new Mine(this.coord);
}

Entity.prototype.createCannonBall = function() {
  return new CannonBall(this.coord, this.arg1, this.arg2);
}


/** MINE CLASS **/
export function Mine(coord) {
  this.coord = coord;
  this.remove = false;
}

Mine.prototype.clone = function() {
  return new Mine(this.coord);
}

/** CANNON BALL **/
export function CannonBall(coord, owner, time) {
  this.coord = coord;
  this.owner = owner;
  this.time = time;
}

CannonBall.prototype.clone = function() {
  return new CannonBall(this.coord, this.owner, this.time);
}
/** SHIP CLASS **/
export function Ship(id, coord, orientation, speed, rum, owner) {
  this.id = id;
  this.coord = coord;
  this.orientation = orientation;
  this.speed = speed;
  this.rum = rum;
  this.owner = owner;
  this.mineCooldown = 0;
  this.cannonCooldown = 0;
  this.barrels = undefined;
}


Ship.prototype.clone = function() {
  let clone = new Ship(this.id, this.coord, this.orientation, this.speed, this.rum, this.owner);
  clone.mineCooldown = this.mineCooldown;
  clone.cannonCooldown = this.cannonCooldown;
  return clone;
}

Ship.prototype.frontCoord = function() {
  return this.coord.neighbor(this.orientation);
}

Ship.prototype.backCoord = function() {
  return this.coord.neighbor((this.orientation + 3) % 6);
}

export function arrayToCoordsMap(array) {
  let result = {};
  array.forEach((item) => {
    result[item.coord.key()] = item;
  });
  return result;
}

export function State(myShips, enemyShips, barrels, mines, cannonBalls) {
  this.myShips = myShips;
  this.enemyShips = enemyShips;
  this.barrels = barrels;
  this.mines = mines;
  this.cannonBalls = cannonBalls;
  this.barrelsMap = arrayToCoordsMap(barrels);
  this.minesMap = arrayToCoordsMap(mines);
  this.cannonBallsMap = arrayToCoordsMap(cannonBalls);
}

State.prototype.clone = function() {
  let myShips = this.myShips.map(s => s.clone());
  let enemyShips = this.enemyShips.map(s => s.clone());
  let barrels = this.barrels.map(b => b.clone());
  let mines = this.mines.map(m => m.clone());
  let cannonBalls = this.cannonBalls.map(c => c.clone());
  return new State(myShips, enemyShips, barrels, mines, cannonBalls);
}

/*
One game turn is computed as follows:

- The amount of rum each ship is carrying is decreased by 1 unit.
- The players' commands are applied (spawning of cannon balls, mines and ship movement).
- Ships move forward by the same number of cells as their speed.
- Ships turn.
- Damage from cannon balls is computed.
- Elimination of ships with no more rum.

*/

function updateShip(ship) {
  ship.mineCooldown = Math.max(0, ship.mineCooldown - 1);
  ship.cannonCooldown = Math.max(0, ship.cannonCooldown - 1);
  if (ship.speed > 0) {
      let currFrontCoord = ship.coord.neighbor(ship.orientation);
      for (let i = ship.speed; i > 0; i--) {
        // Take the next front coords
        let nextCoord = currFrontCoord.neighbor(ship.orientation);
        if (nextCoord.isInsideMap()) {
          // THIS ACCESS
          let barrel = this.barrelsMap[nextCoord.key()];
          if (barrel) {
            // WOW BARREL CAPTURED!!!!
            barrel.remove = true; // SET TO REMOVE FROM ARRAY
            ship.rum = Math.min(100, ship.rum + barrel.arg1); // UPDATE 
          } else {
            let mine = this.minesMap[nextCoord.key()];
            if (mine) {
              // THAT'S TOO BAD!!!
              ship.rum -= 25;
              mine.remove = true;
            }
          }
          currFrontCoord = nextCoord;          
        } else {
          // INTERRUPS THE LOOP
          break;
        }
      }
      // UPDATES THE SHIP COORDINATES
      ship.coord = currFrontCoord.neighbor((ship.orientation + 3) % 6);
    }
}

function checkAfterDamages(ship) {
  let frontCoord = ship.frontCoord().key();
  let backCoord = ship.backCoord().key();
  let fullHitCannonBall = this.cannonBallsMap[ship.coord];
  if (fullHitCannonBall && fullHitCannonBall.time === 1) {
    ship.rum -= 50;
  }
  let frontHitCannonBall = this.cannonBallsMap[frontCoord];
  if (frontHitCannonBall && frontHitCannonBall.time === 1) {
    ship.rum -= 25;
  }
  let backHitCannonBall = this.cannonBallsMap[backCoord];
  if (backHitCannonBall && backHitCannonBall.time === 1) {
    ship.rum -= 25;
  }
  let frontBarrel = this.barrelsMap[frontCoord];
  if (frontBarrel && !frontBarrel.remove) {
    ship.rum = Math.min(100, ship.rum + frontBarrel.arg1);
    frontBarrel.remove = true;
  }
  let backBarrel = this.barrelsMap[backCoord];
  if (backBarrel && !backBarrel.remove) {
    ship.rum = Math.min(100, ship.rum + backBarrel.arg1);
    backBarrel.remove = true;
  }
  let frontMine = this.minesMap[frontCoord];
  if (frontMine && !frontMine.remove) {
    ship.rum -= 25;
    frontMine.remove = true;
  }
  let backMine = this.minesMap[backCoord];
  if (backMine && !backMine.remove) {
    ship.rum -= 25;
    backMine.remove = true;
  }
}

function normalizeOrientation(orientation) {
  return Math.abs(orientation) % 6;
}

State.prototype.nextState = function(moves) {
  let clone = this.clone();
  let newMines = [];
  let newFires = [];
  // THIS FUNCTION UPDATES SHIPS COORDINATES AND VERIFIES BARRELS CAPTURES AND MINES COLLISIONS
  let _updateShip = updateShip.bind(clone);
  let _checkAfterDamages = checkAfterDamages.bind(clone);

  clone.myShips.forEach((ship) => {
    // DECREASE THE AMMOUNT OF RUM
    ship.rum -= 1;
    let move = moves[ship.id];
    if (move) {
        // APPLY PLAYER COMMAND
      switch (move.type) {
        case 'SLOWER':
          ship.speed = Math.max(0, ship.speed - 1);
          break;
        case 'MOVE':
          if (!move.coord) {
            debugJson(move);
          }
          let targetOrientation = ship.coord.angle(move.coord);
          if (targetOrientation === ship.orientation) {
            ship.speed = Math.min(2, ship.speed + 1);  
          } else {
            let psOrientations = portStarBoard(ship.orientation);
            let port = ship.coord.neighbor(psOrientations[0]);
            let starBoard = ship.coord.neighbor(psOrientations[1]);
            if (port.distanceTo(move.coord) <= starBoard.distanceTo(move.coord)) {
              ship.orientation = psOrientations[0];
            } else {
              ship.orientation = psOrientations[1];
            }
          }
          break;
        case 'MINE':
          if (ship.mineCooldown === 0) {
            let backOrientation = (ship.orientation + 3) % 6;
            let backCoords = ship.coord.neighbor(backOrientation, 2);
            newMines.push(new Mine(backCoords));
            ship.mineCooldown = 5;
          }
          break;
        case 'FIRE':
          ship.cannonCooldown = 2;
          let frontCoord = ship.frontCoord();
          newFires.push(new CannonBall(frontCoord, ship.id, frontCoord.turnsToHit(move.coord) + 1));
          break;
        default:
          break;
      }
      // UPDATE SHIP POSITION AND VERIFY BARREL CAPTURE
      _updateShip(ship);
      if (move.type === 'PORT') {
        ship.orientation = (ship.orientation + 1) % 6;
      }
      if (move.type === 'STARBOARD') {
       ship.orientation = (ship.orientation + 5) % 6; 
      }
    }
  });
  clone.myShips.forEach(_checkAfterDamages);
  clone.updateBarrels();
  clone.updateMines(newMines);
  clone.updateCannonBalls(newFires);
  return clone;
}

State.prototype.updateBarrels = function() {
  this.barrels = this.barrels.filter((barrel) => !barrel.remove);
  this.barrelsMap = arrayToCoordsMap(this.barrels);
}

State.prototype.updateMines = function(newMines) {
  this.mines = this.mines.filter((mine) => !mine.remove);
  this.mines = this.mines.concat(newMines);
  this.minesMap = arrayToCoordsMap(this.mines);
}

State.prototype.updateCannonBalls = function(newCannons) {
  this.cannonBalls = this.cannonBalls.filter((cannonBall) => cannonBall.time > 1);
  this.cannonBalls = this.cannonBalls.concat(newCannons);
  this.cannonBalls.forEach((cannonBall) => cannonBall.time--);
  this.cannonBallsMap = arrayToCoordsMap(this.cannonBalls);
}

function sumRum(acc, curr) {
  return acc + (curr.rum <= 0 ? - 1000 : curr.rum);
}

function sumSpeed(acc, ship) {
  return acc + ship.speed;
}

function sumBarrelsDistances(acc, ship) {
  let distance = 0;
  this.barrels.forEach((barrel) => {
    distance += ship.coord.distanceTo(barrel.coord);
  });
  return acc + distance;
}

function sumMinesDistances(acc, ship) {
  let distance = 0;
  this.mines.forEach((mine) => {
    distance += ship.coord.distanceTo(mine.coord);
  });
  return acc + distance;
}

function checkFires(acc, ship) {
  let count = 0;
  this.cannonBalls.forEach((ball) => {
    if (ball.owner === ship.id) {
      count++
    }
  });
  return acc + count;
}

State.prototype.fitness = function() {
  let myRum = this.myShips.reduce(sumRum, 0);
  let mySpeed = this.myShips.reduce(sumSpeed, 0);
  let enemyRum = this.enemyShips.reduce(sumRum, 0);
  let _sumBarrelsDistances = sumBarrelsDistances.bind(this);
  let _sumMinesDistances = sumMinesDistances.bind(this);
  let _checkFires = checkFires.bind(this);
  let barrelsDist = this.myShips.reduce(_sumBarrelsDistances, 0);
  let minesDist = this.myShips.reduce(_sumMinesDistances, 0);
  let fires = this.myShips.reduce(_checkFires, 0);
  return myRum * 2 - enemyRum * 2 + mySpeed * 10 - barrelsDist + minesDist + fires * 2;
}


/**
 * MOVEMENTS
 **/

export function Move(type, coord) {
  this.type = type; // MOVEMENTS
  this.coord = coord;
}

Move.prototype.print = function() {
  print((this.coord) ? `${this.type} ${this.coord.x} ${this.coord.y}` : this.type);
}
