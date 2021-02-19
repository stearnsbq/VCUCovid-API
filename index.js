const express = require('express');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const db = mongoose.connection;
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const scraper = require('./scraper/scraper');
const config = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const chartSchema = require('./model/abstract-chart-schema')

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
	isolationModel: mongoose.model('isolation', new chartSchema()),
	quarantineModel: mongoose.model('quarantine', new chartSchema()),
	studentModel: mongoose.model('studentCase', new chartSchema()),
	employeeModel: mongoose.model('employeeCase', new chartSchema()),
	symptomaticPositiveModel: mongoose.model('symptomaticPositive', new chartSchema()),
	symptomaticNegativeModel: mongoose.model('symptomaticNegative', new chartSchema()),
	asymptomaticPositiveModel: mongoose.model('asymptomaticPositive', new chartSchema()),
	asymptomaticNegativeModel: mongoose.model('asymptomaticNegative', new chartSchema()),
	entryTestPositiveModel: mongoose.model('entryTestPositive', new chartSchema()),
	entryTestNegativeModel: mongoose.model('entryTestNegative', new chartSchema()),
};

const cases = require('./routes/cases')({ studentModel: models.studentModel, employeeModel: models.employeeModel });
const quarantine = require('./routes/quarantine')({ isolationModel: models.isolationModel, quarantineModel: models.quarantineModel });
const tests = require('./routes/tests')({ entryTestPositiveModel: models.entryTestPositiveModel, entryTestNegativeModel: models.entryTestNegativeModel, symptomaticPositiveModel: models.symptomaticPositiveModel, symptomaticNegativeModel: models.symptomaticNegativeModel, asymptomaticPositiveModel: models.asymptomaticPositiveModel, asymptomaticNegativeModel: models.asymptomaticNegativeModel   });

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




