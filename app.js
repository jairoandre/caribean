'use strict'
import Victor from 'victor';
import {debug, debugJson} from './utils';
import {Entity, Ship, State} from './model';

const SHIP = 'SHIP';
const BARREL = 'BARREL';
const CANNONBALL = 'CANNONBALL';

function gameLoop() {
  while(true) {
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
      if (entity.checkType(SHIP)) {
        if (entity.isMine()) {
          myShips.push(new Ship(inputs));  
        } else {
          enemyShips.push(new Ship(inputs));  
        }
      } else if (entity.checkType(BARREL)) {
        barrels.push(entity);
      } else if (entity.checkType(CANNONBALL)) {
        cannonBalls.push(entity);
      } else {
        mines.push(entity);
      }
    }
    myShips.forEach((s) => s.move(barrels));
  }
}

gameLoop();
