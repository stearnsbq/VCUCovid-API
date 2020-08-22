module.exports = {
    getDate: (req) => {
        const year = parseInt(req.params['year']);
		const month = parseInt(req.params['month']) - 1;
		const day = parseInt(req.params['day']);

		const date = new Date();

		date.setFullYear(year, month, day);
		date.setHours(0, 0, 0, 0);
		return date;
    },
    async exists(model, fields){
        return !!await model.findOne(fields, '_id').lean()
    }



}