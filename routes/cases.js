module.exports = function(models) {
	const express = require('express');
	const router = express.Router();
	const util = require('../util');

	const { studentModel, employeeModel } = models;

	/**
 * @swagger
 *
 * /api/v1/cases:
 *   get:
 *     description: Get all of student and employee cases
 *     produces:
 *       - application/json
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the cases
 */

	router.get('/', async (req, res) => {
		const filter = util.filter(req.query.filter)

		const students = await studentModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();
		const employees = await employeeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send({ success: true, message: "Student and Employee Cases Retrieved", data: [ students, employees ]});
	});



	/**
 * @swagger
 *
 * /api/v1/cases/employees:
 *   get:
 *     description: Get all of employees cases
 *     produces:
 *       - application/json
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the employees cases
 */

	router.get('/employees', async (req, res) => {
		const filter = util.filter(req.query.filter)
		const employees = await employeeModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(employees);
	});


		/**
 * @swagger
 *
 * /api/v1/cases/students:
 *   get:
 *     description: Get all of student cases
 *     produces:
 *       - application/json
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the student cases
 */

	// get day by day history count of cases for students
	router.get('/students', async (req, res) => {
		const filter = util.filter(req.query.filter)
		const students = await studentModel.find(filter, '-_id date value').sort({ type: 'desc' }).exec();

		res.send(students);
	});


			/**
 * @swagger
 *
 * /api/v1/cases/students/{year}/{month}/{day}:
 *   get:
 *     description: Get all of student cases
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: year
 *         description: The year
 *         required: true
 *       - in: path
 *         name: month
 *         description: The month
 *         required: true
 *       - in: path
 *         name: day
 *         description: The day
 *         required: true
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the student cases
 */



	// get cases for students for a given day
	router.get('/students/:year/:month/:day', async (req, res) => {
		try {
			const students = await studentModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(students[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});


				/**
 * @swagger
 *
 * /api/v1/cases/students/{year}/{month}:
 *   get:
 *     description: Get all of student cases
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: year
 *         description: The year
 *         required: true
 *       - in: path
 *         name: month
 *         description: The month
 *         required: true
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the student cases
 */



	router.get('/students/:year/:month', async (req, res) => {
		try {
			const students = await studentModel
				.find({ date: { $regex: `^${req.params['year']}-${req.params['month']}` } }, '-_id value date')
				.exec();

			res.send(students[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});



				/**
 * @swagger
 *
 * /api/v1/cases/students/{year}:
 *   get:
 *     description: Get all of student cases
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: year
 *         description: The year
 *         required: true
 *     tags:
 *       - cases
 *     responses:
 *       200:
 *         description: all of the student cases
 */



	router.get('/students/:year', async (req, res) => {
		try {
			const students = await studentModel
				.find({ date: { $regex: `^${req.params['year']}` } }, '-_id value date')
				.exec();

			res.send(students[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// get cases for employees for a given day
	router.get('/employees/:year/:month/:day', async (req, res) => {
		try {
			const employees = await employeeModel.find({ date: util.getDate(req) }, '-_id value date').exec();

			res.send(employees[0]);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	router.get('/employees/:year/:month', async (req, res) => {
		try {
			const employees = await employeeModel
				.find({ date: { $regex: `^${req.params['year']}-${req.params['month']}` } }, '-_id value date')
				.exec();

			res.send(employees);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	router.get('/employees/:year', async (req, res) => {
		try {
			const employees = await employeeModel
				.find({ date: { $regex: `^${req.params['year']}` } }, '-_id value date')
				.exec();

			res.send(employees);
		} catch (err) {
			res.sendStatus(400);
		}
	});

	// get cases for a given day
	router.get('/:year/:month/:day', async (req, res) => {
		try {
			const date = util.getDate(req);
			const students = await studentModel.find({ date }, '-_id date value').sort({ type: 'desc' }).exec();
			const employees = await employeeModel.find({ date }, '-_id date value').sort({ type: 'desc' }).exec();

			res.send({ student: students[0], employee: employees[0] });
		} catch (err) {
			res.sendStatus(400).send('Invalid Date');
		}
	});

	// get cases for a given year and month
	router.get('/:year/:month', async (req, res) => {
		try {
			const date = `^${req.params['year']}-${req.params['month']}`;
			const students = await studentModel
				.find({ date: { $regex: date } }, '-_id date value')
				.sort({ type: 'desc' })
				.exec();
			const employees = await employeeModel
				.find({ date: { $regex: date } }, '-_id date value')
				.sort({ type: 'desc' })
				.exec();

			res.send({ students, employees });
		} catch (err) {
			res.sendStatus(400).send('Invalid Date');
		}
	});

	router.get('/:year', async (req, res) => {
		try {
			const date = `^${req.params['year']}`;
			const students = await studentModel
				.find({ date: { $regex: date } }, '-_id date value')
				.sort({ type: 'desc' })
				.exec();
			const employees = await employeeModel
				.find({ date: { $regex: date } }, '-_id date value')
				.sort({ type: 'desc' })
				.exec();

			res.send({ students, employees });
		} catch (err) {
			res.sendStatus(400).send('Invalid Date');
		}
	});

	return router;
};
