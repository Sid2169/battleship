//src/core/Ship.js
export class Ship {
    constructor(length) {
        this.length = length;
        this.hits = new Set();
    }
    hit(index) { this.hits.add(index); }
    isSunk() { return this.hits.size >= this.lenght; }
}