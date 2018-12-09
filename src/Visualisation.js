export default class Visualisation {
    constructor(document) {
        this.document = document;
        this.simulation = this.document.querySelector('.simulation');
        this.grid = this.clone(this.document.querySelector('.grid'));
        this.rows = this.grid.querySelectorAll('tr');
    }

    clone(element) {
        let clone = element.cloneNode(true);
        clone.classList.add('overlay');

        this.simulation.appendChild(clone);

        return clone;
    }

    setClasses() {
        Array.prototype.forEach.call(this.rows, function(el, i) {
            Array.prototype.forEach.call(el.children, function(element, index) {
                element.classList.add('row-' + i + '_' + 'cell-' + index);
            });
        });
    }

    toggleActive(position, callingChair) {
        let element = this.document.querySelector('.' + this.positionToClass(position));
        let classList = {...element.classList};

        element.classList.toggle('active');
    }

    toggleObstacle(position, callingChair) {
        let element = this.document.querySelector('.' + this.positionToClass(position));
        let classList = {...element.classList};

        element.classList.toggle('obstacle');
    }

    removeObstacle(position, callingChair) {
        let element = this.document.querySelector('.' + this.positionToClass(position));
        let classList = {...element.classList};

        element.classList.remove('obstacle');
    }

    addObstacle(position, callingChair) {
        let element = this.document.querySelector('.' + this.positionToClass(position));
        let classList = {...element.classList};

        element.classList.add('obstacle');
    }

    positionToClass({x, y}) {
        return 'row-' + y + '_' + 'cell-' + x;
    }
}