//src/core/Ship.js
export class Ship {
    constructor(length, name = 'Ship') {
        this.length = length;
        this.name = name;
        this.hits = new Set();
    }
    hit(index) { this.hits.add(index); }
    isSunk() { return this.hits.size >= this.length; }
}