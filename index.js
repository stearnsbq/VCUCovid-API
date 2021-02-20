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




app.get(`${api_ver}lastUpdated`, async (req, res) => {
	const select = '-_id date';
	const isolations = await models.isolationModel.findOne({}, select).sort({ date: -1 }).exec();

	res.send({success: true, message: "Last Updated Retireved", data: `${ isolations.date.getMonth() + 1}-${isolations.date.getDate() + 1}-${isolations.date.getFullYear()}`})
})


app.get(`${api_ver}totals`, async (req, res) => {
	const select = '-_id value';
	const isolations = await models.isolationModel.findOne({}, select).sort({ date: 1 }).exec();
	const quarantines = await models.quarantineModel.findOne({}, select).sort({ date: 1 }).exec();
	const students = await models.studentModel.findOne({}, select).sort({ date: 1 }).exec();
	const employees = await models.employeeModel.findOne({}, select).sort({ date: 1 }).exec();
	const symptomaticPositives = await models.symptomaticPositiveModel.findOne({}, select).sort({ date: 1 }).exec();
	const symptomaticNegatives = await models.symptomaticNegativeModel.findOne({}, select).sort({ date: 1 }).exec();
	const asymptomaticPositives = await models.asymptomaticPositiveModel.findOne({}, select).sort({ date: 1 }).exec();
	const asymptomaticNegatives = await models.asymptomaticNegativeModel.findOne({}, select).sort({ date: 1 }).exec();
	const entryTestPositives = await models.entryTestPositiveModel.findOne({}, select).sort({ date: 1 }).exec();
	const entryTestNegatives = await models.entryTestNegativeModel.findOne({}, select).sort({ date: 1 }).exec();



	res.send({success: true, message: "Totals Retrieved", data: {
		studentsInIsolation: isolations.value,
		studentsInQuarantine: quarantines.value,
		studentCases: students.value,
		employeeCases: employees.value,
		symptomaticPositives: symptomaticPositives.value,
		symptomaticNegatives: symptomaticNegatives.value,
		asymptomaticPositives: asymptomaticPositives.value,
		asymptomaticNegatives: asymptomaticNegatives.value,
		entryTestPositives: entryTestPositives.value,
		entryTestNegatives: entryTestNegatives.value

	}});
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




