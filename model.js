import Victor from 'victor';

export function Entity(inputs) {
  this.id = +inputs[0];
  this.type = inputs[1];
  this.pos = new Victor(+inputs[2], +inputs[3]);
  this.arg1 = +inputs[4];
  this.arg2 = +inputs[5];
  this.arg3 = +inputs[6];
  this.arg4 = +inputs[7];
}

Entity.prototype.checkType = function(type) {
  return this.type === type;
}

Entity.prototype.isMine = function() {
  return this.arg4 === 1;
}

Entity.prototype.clone = clone;

export function Ship(inputs) {
  Entity.call(this, inputs);
}

Ship.prototype.direction = function(target) {
  let pos = this.pos;
  if (pos.y === target.y) {
    return pos.x > target.x ? 3 : 0;
  } else if (pos.y > target.y) {
    return pos.x > target.x ? 4 : 5;
  } else {
    return pos.x > target.x ? 2 : 1;
  }
}

Ship.prototype.move = function(barrels) {
  let closest, distanceSq;
  let compareBarrel = function(barrel) {
    let currDistanceSq = barrel.pos.distanceSq(this.pos);
    if(!closest || currDistanceSq < distanceSq) {
      closest = barrel.pos;
      distanceSq = currDistanceSq;
    }
  };
  compareBarrel = compareBarrel.bind(this);
  barrels.forEach(compareBarrel);
  if (closest) {
    if (this.arg1 === this.direction(closest) || this.arg2 <= 1) {
      print(`MOVE ${closest.x} ${closest.y}`);  
    } else {
      print('SLOWER');
    }
  } else {
    print('WAIT');
  }
}

export function State(myShips, enemyShips, barrels, mines, cannonBalls) {
	this.myShips = myShips;
	this.enemyShips = enemyShips;
	this.barrels = barrels;
	this.mines = mines;
	this.cannonBalls = cannonBalls;
}

function clone() {

  var classScope = this;

  // Get the prototype of your class. This will create an object that has one key for every method in your class. I'm not sure if this will go up the prototype chain if you have subclasses. Someone ought to edit this answer to clarify that.
  var miniMe = Object.getPrototypeOf(this);

  // Iterate the properties of your class--all the internal key-value pairs that do get duplicated in RAM each time you instantiate the class.
  Object.keys(this).forEach(iterate);

  function iterate(key, index, list) {

      // Add each property to your clone
      miniMe[key] = classScope[key];
    }
    // Return the clone
  return miniMe;
}