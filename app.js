'use strict'
import {Entity, Ship, State, Coord, Move} from './model';
import {debugJson} from './utils';
import Population from './population';


const mineCooldowns = {};
const cannonCooldowns = {};

function checkCooldowns(obj, id) {
  if (obj[id]) {
    obj[id] = Math.max(0, obj[id] - 1);
  } else {
    obj[id] = 0;
  }
}

const center = new Coord(16,6);
const neighbors = center.neighbors();
const moves = neighbors.map((coord) => new Move('MOVE', coord));
let idx = 0;
let turns = 1;

function gameLoop() {
  while(true) {
    let b = new Date();
    let entities = [];
    let myShips = [];
    let enemyShips = [];
    let barrels = [];
    let mines = [];
    let cannonBalls = [];
    let myShipCount = +readline();
    let entityCount = +readline();
    for (let i = 0; i < entityCount; i++) {
      let inputs = readline().split(' ');
      let entity = new Entity(inputs);
      if (entity.checkType('SHIP')) {
        if (entity.isMyShip()) {
          let myShip = entity.createShip();
          myShips.push(myShip);
          checkCooldowns(mineCooldowns, myShip.id);
          checkCooldowns(cannonCooldowns, myShip.id);
          // SET COOLDOWNS
          myShip.mineCooldown = mineCooldowns[myShip.id];
          myShip.cannonCooldown = cannonCooldowns[myShip.id];
        } else {
          enemyShips.push(entity.createShip());  
        }
      } else if (entity.checkType('BARREL')) {
        barrels.push(entity);
      } else if (entity.checkType('CANNONBALL')) {
        cannonBalls.push(entity.createCannonBall());
      } else {
        mines.push(entity.createMine());
      }
    }
    let state = new State(myShips, enemyShips, barrels, mines, cannonBalls);
    let population = new Population(state, 150, 0.1, 2);
    population.generate();
    turns++;
    //population.stress(1);
    let best = population.best();
    printErr(`Turn ${turns}`);
    best.print();
    Object.keys(best.genes).forEach((id) => {
      let move = best.genes[id];
      if (move.type === 'FIRE') {
        cannonCooldowns[id] = 1;
      } else if (move.type === 'MINE') {
        mineCooldowns[id] = 4;
      }
      move.print();
    });
    let e = new Date();
    printErr(`Time: ${e.getTime() - b.getTime()} ms`);
  }
}

gameLoop();
