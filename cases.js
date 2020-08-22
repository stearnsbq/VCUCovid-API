module.exports = function(models) {
	const express = require('express');
    const router = express.Router();
    const util = require('./util');

 
    const {studentModel, employeeModel} = models;


    
	// get current cases
	router.get('/', async (req, res) => {
        const students = await studentModel.find({}, '-_id date value').sort({ type: 'desc' }).exec();
        const employees = await employeeModel.find({}, '-_id date value').sort({ type: 'desc' }).exec();

		res.send({students, employees});
	});

	// get day by day history count of cases for students
	router.get('/students', async (req, res) => {
		const docs = await studentModel.find({ }, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});

	// get day by day history count of cases fir employees
	router.get('/employees', async (req, res) => {
		const docs = await employeeModel.find({ }, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(docs);
	});

	// get cases for students for a given day
	router.get('/students/:year/:month/:day', async (req, res) => {
        try {
			const docs = await studentModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(docs[0]);
		} catch (err) {
			res.sendStatus(400);
		}
    });

	// get cases for employees for a given day
	router.get('/employees/:year/:month/:day', async (req, res) => {
		try {
			const docs = await employeeModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(docs[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// get cases for a given day
	router.get('/:year/:month/:day', async (req, res) => {
		try {
            const date = util.getDate(req);
            const students = await studentModel.find({date}, '-_id date value').sort({ type: 'desc' }).exec();
            const employees = await employeeModel.find({date}, '-_id date value').sort({ type: 'desc' }).exec();

			res.send({students, employees});
		} catch (err) {
			res.sendStatus(400).send('Invalid Date');
		}
	});

	return router;
};
