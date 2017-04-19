'use strict'
import Victor from 'victor';

function Entity(inputs) {
  this.id = +inputs[0];
  this.type = inputs[1];
  this.pos = new Victor(+inputs[2], +inputs[3]);
  this.arg1 = +inputs[4];
  this.arg2 = +inputs[5];
  this.arg3 = +inputs[6];
  this.arg4 = +inputs[7];
}

function Ship(inputs) {
  Entity.call(this, inputs);
}

Ship.prototype.move = function(barrels) {
  let closest, distanceSq;
  let compareBarrel = function(barrel) {
    let currDistanceSq = barrel.pos.distanceSq(this.pos);
    if(!closest || currDistanceSq > distanceSq) {
      closest = barrel;
      distanceSq = currDistanceSq;
    }
  };
  compareBarrel = compareBarrel.bind(this);
  barrels.forEach(compareBarrel);
  if (closest) {
    print(`MOVE ${closest.pos.x} ${closest.pos.y}`);
  } else {
    print('WAIT');
  }


}

function isMyShip(entity) {
  return entity.type === 'SHIP' && entity.arg4 === 1;
}

function isBarrel(entity) {
  return entity.type === 'BARREL';
}

function init() {
  while(true) {
    let entities = [];
    let myShips = [];
    let barrels = [];
    let myShipCount = +readline();
    let entityCount = +readline();
    for (let i = 0; i < entityCount; i++) {
      let inputs = readline().split(' ');
      let entity = new Entity(inputs);
      if (isMyShip(entity)) {
        myShips.push(new Ship(inputs));
      } else if (isBarrel(entity)) {
        barrels.push(entity);
      }
    }

    myShips.forEach((s) => s.move(barrels));
  }
}

init();
