const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = function() {
	const schema = new Schema({
		value: { type: Number, default: 0 },
		date: {
			type: String,
			default: () => {
				const d = new Date();
				return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
			},
			unique: true
		}
	});

	return mongoose.model('quarantine', schema);
};
