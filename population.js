import {State, Move} from './model';
import DNA from './dna';
import {randomElement, debugJson} from './utils';

export default function Population(state, popmax, mutationRate, dnaSize) {
  this.state = state;
  this.popmax = popmax;
  this.mutationRate = mutationRate;
	this.items = [];
}

const _PORT_ = new Move('PORT');
const _STARBOARD_ = new Move('STARBOARD');
const _SLOWER_ = new Move('SLOWER');
const _WAIT_ = new Move('WAIT');
const _MINE_ = new Move('MINE');

function possibleMoves(ship, state) {
  let movements = [];
  movements.push(_PORT_)
  movements.push(_STARBOARD_);  
  if (ship.speed > 0) {
    movements.push(_WAIT_);
    movements.push(_SLOWER_);
  }
  if (state.barrels.length > 0) {
    let closeBarrels = state.barrels.filter((barrel) => ship.coord.distanceTo(barrel.coord) <= 5 && !barrel.checked);
    closeBarrels.forEach((barrel) => {
      barrel.checked = true;
      movements.push(new Move('MOVE', barrel.coord))
    }); 
    if (closeBarrels.length === 0) {
      state.barrels.forEach((barrel) => movements.push(new Move('MOVE', barrel.coord)));
    }
  }
  movements.push(new Move('MOVE', ship.coord.pickRandom(10, 3, [ship.orientation, (ship.orientation + 1) % 6, (ship.orientation - 1) % 6])));
  if (ship.mineCooldown === 0) {
    movements.push(_MINE_);
  }
  if (ship.cannonCooldown === 0) {
    let frontCoord = ship.frontCoord();
    state.enemyShips.forEach((enemy) => {
      if (frontCoord.turnsToHit(enemy.coord) <= 1) {
        movements.push(new Move('FIRE', enemy.coord));
      }
      for (let i = 1; i < 5; i++) {
        let possibleCoord = enemy.coord.neighbor(enemy.orientation, i * enemy.speed);
        if (frontCoord.turnsToHit(possibleCoord) <= i) {
          movements.push(new Move('FIRE', possibleCoord));
        }
      }

    });    
  }
  return movements;
}


function cartesianProduct(arr)
{
    return arr.reduce(function(a,b){
        return a.map(function(x){
            return b.map(function(y){
                return x.concat(y);
            })
        }).reduce(function(a,b){ return a.concat(b) },[])
    }, [[]])
}


Population.prototype.generate = function() {
  this.items = [];
  let _movesMap = {};
  let _state = this.state;
  _state.myShips.forEach((ship) => {
    _movesMap[ship.id] = possibleMoves(ship, _state);
  });
  let genes = new Array(this.popmax).fill().map(() => {
    let _gene = {};
    Object.keys(_movesMap).forEach((id) => {
      _gene[id] = randomElement(_movesMap[id]);
    });
    return _gene;
  });
  genes.forEach((gene) => {
    let dna = new DNA(this.state, gene);
    dna.evaluate();
    this.items.push(dna);
  });  
}

Population.prototype.generate2 = function() {
  let gene = {};
  let _state = this.state;
  let bestGene = {};
  let dnaMap = {};
  _state.myShips.forEach((ship) => {
    let moves = possibleMoves(ship, _state);
    moves.forEach((move) => {
      let gene = {};
      gene[ship.id] = move;
      let dna = new DNA(_state, gene);
      dna.evaluate();
      if (!dnaMap[ship.id] || dnaMap[ship.id].fitness < dna.fitness) {
        bestGene[ship.id] = move;
        dnaMap[ship.id] = dna;
      }
    });
  });
  let bestDNA = new DNA(_state, bestGene);
  bestDNA.evaluate();
  this.items = [bestDNA];
}

Population.prototype.selection = function() {
  let matingPool = [];
  this.items.forEach((dna) => {
    if (dna.fitness > 0) {
      matingPool = matingPool.concat(new Array(Math.floor(dna.fitness)).fill(dna));  
    } else {
      matingPool.push(dna);
    }
  });
  for (let i = 0, len = this.items.length; i < len; i++) {
    let parentA = randomElement(matingPool);
    let parentB = randomElement(matingPool);
    this.items[i] = parentA.crossover(parentB);
    this.items[i].evaluate();
  }
}

Population.prototype.stress = function(ammount) {
  for (let i = 0; i < ammount; i++) {
    this.selection();
  }
}

Population.prototype.best = function() {
  let best = this.items[0];
  for (let i = 1, len = this.items.length; i < len; i++) {
    let curr = this.items[i];
    if (best.fitness < curr.fitness) {
      best = curr;
    }
  }
  return best;
}