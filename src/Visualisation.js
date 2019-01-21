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

    removeActiveAll() {
        let activeAll = this.document.querySelectorAll('.active');
        Array.prototype.forEach.call(activeAll, function(el) {
            el.classList.remove('active');
        });
    }

    toggleActive(position, callingChair) {

        let positionClass = this.positionToClass(position);
        let element = this.document.querySelector('.' + positionClass);
        let idClass = typeof callingChair !== 'undefined'
            ? 'chair-' + callingChair : '_';

        let classList = {...element.classList};

        // reset classList to remove previous chairs, etc.
        element.className = '';

        element.classList.add(positionClass);
        element.classList.add(idClass);
        element.classList.toggle('active');
    }

    toggleActiveAll(path, callingChair) {
        path.forEach(position => {
            this.toggleActive(position, callingChair);
        });
    }

    toggleObstacle(position, callingChair) {
        let positionClass = this.positionToClass(position);
        let element = this.document.querySelector('.' + positionClass);
        let idClass = typeof callingChair !== 'undefined'
            ? 'chair-' + callingChair : '_';

        let classList = {...element.classList};

        // reset classList to remove previous chairs, etc.
        element.className = '';

        element.classList.add(positionClass);
        element.classList.add(idClass);
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

    removeObstacleAll() {
        let activeAll = this.document.querySelectorAll('.obstacle');
        Array.prototype.forEach.call(activeAll, function(el) {
            el.parentNode.removeChild(el);
        });
    }

    positionToClass({x, y}) {
        return 'row-' + y + '_' + 'cell-' + x;
    }
}