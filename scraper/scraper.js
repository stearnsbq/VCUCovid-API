const jssoup = require('jssoup').default;
const axios = require('axios');
const fs = require('fs');
const active_cases = require('./scrape_active_case');
const isolation_quarantines = require('./scrape_isolation_quarantine');
const prevalence = require('./scrape_prevalence');
const test_results = require('./scrape_test_results');

// basic scraper file to grab new cases / isolations / qurantines / positive tests / negative tests

module.exports = async function(models) {
	const moment = require('moment');
	const util = require('../util');

	const request = await axios.get('https://together.vcu.edu/dashboard/'); // grab the html from the dashboard site

	const html = request.data;

	const soup = new jssoup(html);

	const general = soup.find('div', 'plugin-general-content');

	const last_update = general.nextElement.nextSibling;

	const date = new Date(Date.parse(last_update.text.replace(/["'()]/g, '').split('updated')[1].trim())); // parse the last updated date

	const date_str = moment(date).format('YYYY-MM-DD');

	const wrapper = soup.find('div', 'gridwrapper');

	fs.writeFileSync(`${__dirname}/history/${date_str}.html`, wrapper); // save a history html file

	const headers = wrapper.findAll('div', 'gridheader');

	// loop through grid headers to save needed information

	for (const header of headers) {
		const body = header.findNextSibling('div');

		let ul = body.find('ul');

		try {
			switch (header.getText().replace(/&nbsp;/g, '')) {
				case 'Active cases': {
					active_cases(
						{ studentModel: models.studentModel, employeeModel: models.employeeModel, totalStudentModel: models.totalStudentModel, totalEmployeeModel: models.totalEmployeeModel },
						ul,
						date_str
					);
					break;
				}
				case 'On-campus isolation and quarantine*': {
					isolation_quarantines(
						{ isolationModel: models.isolationModel, quarantineModel: models.quarantineModel },
						ul,
						date_str
					);
					break;
				}
				case 'Prevalence': {
					prevalence(
						{
							prevalencePositiveModel: models.prevalencePositiveModel,
							prevalenceNegativeModel: models.prevalenceNegativeModel
						},
						ul,
						date_str
					);
					break;
				}
				case 'Entry test results': {
					test_results(
						{ positiveModel: models.positiveModel, negativeModel: models.negativeModel },
						ul,
						date_str
					);
					break;
				}
			}
		} catch (err) {
			console.log(err)
			continue;
		}
	}
};
