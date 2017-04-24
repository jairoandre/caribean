import {Move, Coord, randomCoord} from './model';
import {debugJson, randomElement, portStarBoard} from './utils';

export default function DNA(state, genes) {
	if (genes) {
		this.genes = genes;
	} else {
		this.genes = {};	
	}
	this.initialState = state;
	this.state = state;
	this.fitness = 0;	
}

DNA.prototype.evaluate = function() {
	this.state = this.state.nextState(this.genes);
	this.fitness = this.state.fitness();
}

DNA.prototype.crossover = function(anotherDNA) {
	let newGenes = {};
	Object.keys(this.genes).forEach((id) => {
		let thisMove = this.genes[id];
		let anotherMove = anotherDNA.genes[id];
		newGenes[id] = Math.random() < 0.5 ? thisMove : anotherMove;
	});
	return new DNA(this.initialState, newGenes);
}

function orderKey(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}

DNA.prototype.print = function() {
	printErr(`Fitness: ${this.fitness}`);
	Object.keys(this.genes).sort(orderKey).forEach((key) => {
		let move = this.genes[key];
		if (move.coord) {
			printErr(`Move for ship[${key}]: ${move.type} - (${move.coord.x}, ${move.coord.y})`);	
		} else {
			printErr(`Move for ship[${key}]: ${move.type}`);	
		}
	});
}