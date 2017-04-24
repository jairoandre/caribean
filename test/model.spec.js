'use strict'
import {Coord} from '../model.js';
import assert from 'assert';

describe('Coordinates', () => {
	describe('Constructor', () => {
		it('should get a new instance of Coord', () => {
			let coord = new Coord(2, 2);
			assert.equal(2, coord.x);
			assert.equal(2, coord.y);
		});
		it('should transform to cube coordinates: (2,2) equals (1, -3, 2)', () => {
			let coord = new Coord(2, 2);
			let cubeCoord = coord.toCubeCoord();
			assert.equal(1, cubeCoord.x);
			assert.equal(-3, cubeCoord.y);
			assert.equal(2, cubeCoord.z);
		});
	});
	describe('Distances', () => {		
		it('should distance between (0,0) and (1,0) equals 1', () => {
			let coord1 = new Coord(0,0);
			let coord2 = new Coord(1,0);
			assert.equal(1, coord1.distanceTo(coord2));
		});
		it('should distance between (0,0) and (0,1) equals 1', () => {
			let coord1 = new Coord(0,0);
			let coord2 = new Coord(0,1);
			assert.equal(1, coord1.distanceTo(coord2));
		});
		it('should distance between (1,1) and (3,0) equals 2', () => {
			let coord1 = new Coord(1,1);
			let coord2 = new Coord(3,0);
			assert.equal(2, coord1.distanceTo(coord2));
		});
	});
	describe('Angles', () => {
		it('should angle between (3,2) and (4,2) equals 0', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(4,2);
			assert.equal(0, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (3,1) equals 1', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(3,1);
			assert.equal(1, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (2,1) equals 2', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(2,1);
			assert.equal(2, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (2,2) equals 3', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(2,2);
			assert.equal(3, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (2,3) equals 4', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(2,3);
			assert.equal(4, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (3,3) equals 5', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(3,3);
			assert.equal(5, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (5,6) equals 5', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(5,6);
			assert.equal(5, coord1.angle(coord2));
		});
		it('should angle between (3,2) and (3,6) equals 5', () => {
			let coord1 = new Coord(3,2);
			let coord2 = new Coord(3,6);
			assert.equal(5, coord1.angle(coord2));
		});		
	});
	describe('Random Target', () => {
		it('should pick a random coordinate from an origin within 3 units of distance', () => {
			let coord1 = new Coord(3,2);
			let random = coord1.pickRandom(3);
			console.log(JSON.stringify(random));
			assert.ok(random.distanceTo(coord1) <= 3);
		});
	});
});