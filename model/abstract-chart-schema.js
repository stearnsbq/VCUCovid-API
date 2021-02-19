const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = class chartSchema extends Schema{

    constructor(){
        super({
            value: { type: Number, default: 0 },
            date: {
                type: Date,
                default: () => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    return d;
                },
                unique: true
            }
        })
    }

}
