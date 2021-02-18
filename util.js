module.exports = {
	getDate: (req) => {
		const moment = require('moment');
		const year = parseInt(req.params['year']);
		const month = parseInt(req.params['month']) - 1;
		const day = parseInt(req.params['day']);

		const date = new Date();

		date.setFullYear(year, month, day);
		date.setHours(0, 0, 0, 0);
		return moment(date).format('YYYY-MM-DD');
	},
	async exists(model, fields) {
		return !!await model.findOne(fields, '_id').lean();
	},
	growthFactor(data) {
		return (data[0].value / data[1].value).toFixed(2);
	},
	async create(model, date, value) {
		const entry = new model();
		if (!await this.exists(model, { date })) {
			entry.value = value;
			entry.date = date;
			await entry.save();
		}
	}
};
