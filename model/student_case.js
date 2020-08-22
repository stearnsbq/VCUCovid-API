const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = function() {
	const schema = new Schema({
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
	});

	return mongoose.model('studentCase', schema);
};
