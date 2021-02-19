module.exports = function(models) {
	const express = require('express');
	const router = express.Router();
    const util = require('../util')

    const {isolationModel, quarantineModel} = models;

    router.get('/', async (req, res) => {
        const filter = util.filter(req.params.filter)
        const isolations = await isolationModel.find(filter, '-_id value date').sort({date: 'desc'}).exec();
        const quarantines = await quarantineModel.find(filter, '-_id value date').sort({date: 'desc'}).exec();
		res.send({isolations, quarantines});
    });


	// get day by day history count of residential isolation
	router.get('/isolations', async (req, res) => {
        const filter = util.filter(req.params.filter)
        const docs = await isolationModel.find(filter, '-_id value date').sort({date: 'desc'}).exec();
		res.send(docs);
    });

	// get day by day history count of residential quarantine
	router.get('/quarantines', async (req, res) => {
        const filter = util.filter(req.params.filter)
		const docs = await quarantineModel.find(filter, '-_id value date').sort({date: 'desc'}).exec();
		res.send(docs);
	});

	// get count of residential isolations for a given day
	router.get('/isolations/:year/:month/:day', async (req, res) => {
        try{
            const isolation = await isolationModel.find({ date: util.getDate(req) }, '-_id value date').exec();

            res.send(isolation[0]);
        }catch(err){
            res.sendStatus(400);
        }
    });
    
    router.get('/isolations/:year/:month', async (req, res) => {
        try{
            const isolations = await isolationModel.find({ date: {$regex: `^${req.params['year']}-${req.params['month']}`} }, '-_id value date').exec();

            res.send(isolations);
        }catch(err){
            res.sendStatus(400);
        }
    });
    
    router.get('/isolations/:year', async (req, res) => {
        try{
            const isolations = await isolationModel.find({ date: {$regex: `^${req.params['year']}`} }, '-_id value date').exec();

            res.send(isolations);
        }catch(err){
            res.sendStatus(400);
        }
	});

	// get count of residential quarantines for a given day
	router.get('/quarantines/:year/:month/:day', async (req, res) => {
        try{
            const quarantine = await quarantineSchema.find({ date: util.getDate(req) }, '-_id value date').exec();

            res.send(quarantine[0]);
        }catch(err){
            res.sendStatus(400);
        }
    });

    router.get('/quarantines/:year/:month', async (req, res) => {
        try{
            const quarantines = await quarantineSchema.find({ date: {$regex: `^${req.params['year']}-${req.params['month']}`}  }, '-_id value date').exec();

            res.send(quarantines);
        }catch(err){
            res.sendStatus(400);
        }
    });

    router.get('/quarantines/:year', async (req, res) => {
        try{
            const quarantines = await quarantineSchema.find({ date: {$regex: `^${req.params['year']}`} }, '-_id value date').exec();

            res.send(quarantines);
        }catch(err){
            res.sendStatus(400);
        }
    });

	return router;
};
