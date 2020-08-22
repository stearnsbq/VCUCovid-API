module.exports = function(models) {
    const express = require('express');
	const router = express.Router();
    const util = require('./util')

    const {positiveModel, negativeModel} = models;

    

    router.get("/", async (req, res) => {

        const positive = await positiveModel.find({}, '-_id date value').sort({ type: 'desc' }).exec();
        const negative = await negativeModel.find({}, '-_id date value').sort({ type: 'desc' }).exec();

		res.send({positive, negative});
    })

    router.get("/positive", async (req, res) => {
        const docs = await positiveModel.find({}, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
    })

    router.get("/negative", async (req, res) => {
        const docs = await negative.find({}, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
    })

    router.get("/positive/:year/:month/:day", async (req, res) => {
        try {
			const docs = await positiveModel.find({ date: util.getDate(req)}, '-_id value date').exec();

			res.send(docs[0]);
		} catch (err) {
			res.sendStatus(400);
		}
    })

    router.get("/negative/:year/:month/:day", async (req, res) => {
        try {
			const docs = await negativeModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(docs[0]);
		} catch (err) {
			res.sendStatus(400);
		}
    })

    return router;


}