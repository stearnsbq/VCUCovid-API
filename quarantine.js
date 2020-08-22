module.exports = function(models) {
	const express = require('express');
	const router = express.Router();
    const util = require('./util')

    const {isolationModel, quarantineModel} = models;

    router.get('/', async (req, res) => {
        const isolations = await isolationModel.find({}, '-_id value date').sort({date: 'desc'}).exec();
        const quarantines = await quarantineModel.find({}, '-_id value date').sort({date: 'desc'}).exec();
		res.send({isolations, quarantines});
    });


	// get day by day history count of residential isolation
	router.get('/isolations', async (req, res) => {
        const docs = await isolationModel.find({}, '-_id value date').sort({date: 'desc'}).exec();
		res.send(docs);
    });

	// get day by day history count of residential quarantine
	router.get('/quarantines', async (req, res) => {
		const docs = await quarantineModel.find({}, '-_id value date').sort({date: 'desc'}).exec();
		res.send(docs);
	});

	// get count of residential isolations for a given day
	router.get('/isolations/:year/:month/:day', async (req, res) => {
        try{
            const docs = await isolationModel.find({ date: util.getDate(req) }, '-_id value date').exec();

            res.send(docs[0]);
        }catch(err){
            res.sendStatus(400);
        }
	});

	// get count of residential quarantines for a given day
	router.get('/quarantines/:year/:month/:day', async (req, res) => {
        try{
            const docs = await quarantineSchema.find({ date: util.getDate(req) }, '-_id value date').exec();

            res.send(docs[0]);
        }catch(err){
            res.sendStatus(400);
        }
    });

	return router;
};
