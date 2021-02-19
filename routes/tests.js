module.exports = function(models) {
	const express = require('express');
	const router = express.Router();
	const util = require('../util');

	const { entryTestPositiveModel, entryTestNegativeModel, symptomaticPositiveModel, symptomaticNegativeModel, asymptomaticPositiveModel, asymptomaticNegativeModel } = models;

	router.get('/', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const entryTestPositive = await entryTestPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const entryTestNegative = await entryTestNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const symptomaticPositive = await symptomaticPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const symptomaticNegative = await symptomaticNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const asymptomaticPositive = await asymptomaticPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const asymptomaticNegative = await asymptomaticNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();


		res.send({entryTestPositive, entryTestNegative, symptomaticPositive, symptomaticNegative, asymptomaticPositive, asymptomaticNegative });
	});

	router.get('/entryTestPositive', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await entryTestPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});

	router.get('/entryTestNegative', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await entryTestNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});


	router.get('/positiveSymptomatic', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await symptomaticPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});

	router.get('/negativeSymptomatic', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await symptomaticNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});


	router.get('/asymptomaticPositive', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await asymptomaticPositiveModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});

	router.get('/asymptomaticNegative', async (req, res) => {
		const filter = util.filter(req.params.filter)
		const docs = await asymptomaticNegativeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});


	router.get('/positive/:year/:month/:day', async (req, res) => {
		try {
			const positive = await positiveModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(positive[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	router.get('/positive/:year/:month', async (req, res) => {
		try {
			const positives = await positiveModel.find({ date: {$regex: `^${req.params['year']}-${req.params['month']}`} }, '-_id value date').exec();

			res.send(positives);
		} catch (err) {
			res.sendStatus(400);
		}
	});


	router.get('/positive/:year', async (req, res) => {
		try {
			const positives = await positiveModel.find({ date: {$regex: `^${req.params['year']}`} }, '-_id value date').exec();

			res.send(positives);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	router.get('/negative/:year/:month/:day', async (req, res) => {
		try {
			const negative = await negativeModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(negative[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	router.get('/negative/:year/:month', async (req, res) => {
		try {
			const negatives = await negativeModel.find({ date: {$regex: `^${req.params['year']}-${req.params['month']}`} }, '-_id value date').exec();

			res.send(negatives);
		} catch (err) {
			res.sendStatus(400);
		}
	});


	router.get('/negative/:year', async (req, res) => {
		try {
			const negatives = await negativeModel.find({ date: {$regex: `^${req.params['year']}`} }, '-_id value date').exec();

			res.send(negatives);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	return router;
};
