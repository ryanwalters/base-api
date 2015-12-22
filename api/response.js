'use strict';

module.exports = class WFResponse {

    constructor() {

        this.data = null;
        this.error = null;
    }

    set(property, value) {

        if (property in this) {
            return this[property] = value;
        }

        else {
            throw new Error(`"${property}" is not a valid property`);
        }
    }
};