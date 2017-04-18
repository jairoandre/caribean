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

function init() {
  while(true) {
    var myShipCount = +readline();
    var entityCount = +readline();
    for (var i = 0; i < entityCount; i++) {
      var inputs = readline().split(' ');
      entities.push(new Entity(inputs));
    }

    for (var i = 0; i < myShipCount; i++) {
      print('MOVE 11 10');
    }
  }
}

init();
