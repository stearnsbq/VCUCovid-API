const express = require('express');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const db = mongoose.connection;
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const scraper = require('./scraper/scraper');
const model_path = './model';
const studentModel = require(`${model_path}/student_case`)();
const employeeModel = require(`${model_path}/employee_case`)();
const positiveModel = require(`${model_path}/positive_test`)();
const negativeModel = require(`${model_path}/negative_test`)();
const isolationModel = require(`${model_path}/isolation`)();
const quarantineModel = require(`${model_path}/quarantine`)();
const prevalencePositiveModel = require(`${model_path}/prevalence_positive`)();
const prevalenceNegativeModel = require(`${model_path}/prevalence_negative`)();
const totalStudentModel = require(`${model_path}/students`)();
const totalEmployeeModel = require(`${model_path}/employees`)();
const config = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

let options = {
    swaggerDefinition: {
        info: {
			title: 'VCUCOVID API',
            description: 'test',
			version: '1.0.0',
			servers: ["projects.quinn50.dev", "localhost:8084"],
			tags: ['dome']
        },
	},
	swagger: "2.0",
    basedir: __dirname, //app absolute path
	apis: ['./routes/**/*.js', 'index.js'] //Path to the API handle folder
};




const models = {
	positiveModel,
	negativeModel,
	isolationModel,
	quarantineModel,
	studentModel,
	employeeModel,
	prevalencePositiveModel,
	prevalenceNegativeModel,
	totalStudentModel,
	totalEmployeeModel
};

const cases = require('./routes/cases')({ studentModel, employeeModel });
const quarantine = require('./routes/quarantine')({ isolationModel, quarantineModel });
const tests = require('./routes/tests')({ positiveModel, negativeModel });

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 100
});

const api_ver = '/api/v1/';

app.use(limiter);
app.use(cors({}));
app.set('trust proxy', 1);
app.use(helmet());
app.use(`${api_ver}cases`, cases);
app.use(`${api_ver}residential`, quarantine);
app.use(`${api_ver}tests`, tests);

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect(config.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('open', console.log.bind(console, 'Connected to MongoDB instance'));



/**
 * @swagger
 *
 * /api/v1:
 *   get:
 *     description: Get all of the data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: all of the cases, tests, quarantines/isolations
 */

app.get(api_ver, async (req, res) => {
	const select = '-_id date value';
	const positives = await positiveModel.find({}, select).sort({ date: 1 }).exec();
	const negatives = await negativeModel.find({}, select).sort({ date: 1 }).exec();
	const isolations = await isolationModel.find({}, select).sort({ date: 1 }).exec();
	const quarantines = await quarantineModel.find({}, select).sort({ date: 1 }).exec();
	const students = await studentModel.find({}, select).sort({ date: 1 }).exec();
	const employees = await employeeModel.find({}, select).sort({ date: 1 }).exec();
	const prevalenceNegative = await prevalenceNegativeModel.find({}, select).sort({ date: 1 }).exec();
	const prevalencePositive = await prevalencePositiveModel.find({}, select).sort({ date: 1 }).exec();

	res.send({
		positives,
		negatives,
		isolations,
		quarantines,
		students,
		employees,
		prevalenceNegative,
		prevalencePositive
	});
});

scraper(models);

const job = schedule.scheduleJob('0 * * * *', () => {
	console.log(`[${new Date().toISOString()}] Running Scraper`);
	scraper(models);
});

app.listen(config.PORT, () => {
	console.log(`[${new Date().toISOString()}] VCUCovid API started on port ${config.PORT}`);
});

process.on('exit', function() {
	job.cancel();
});




