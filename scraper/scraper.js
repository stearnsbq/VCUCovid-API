const jssoup = require('jssoup').default;
const axios = require('axios');
const fs = require('fs');
const active_cases = require('./scrape_active_case');
const isolation_quarantines = require('./scrape_isolation_quarantine');
const scrape_entry_tests = require('./scrape_entry_tests');
const scrape_asympomatic_tests = require('./scrape_asympomatic_tests');
const scrape_sympomatic_tests = require('./scrape_sympomatic_tests');

// basic scraper file to grab new cases / isolations / qurantines / positive tests / negative tests

module.exports = async function(models) {
	const moment = require('moment');

	const request = await axios.get('https://together.vcu.edu/dashboard/'); // grab the html from the dashboard site

	const html = request.data;

	const soup = new jssoup(html);

	const today = new Date(); // today's date

	const date_str = moment(today).format('YYYY-MM-DD');

	const wrapper = soup.find('div', 'gridwrapper');

	fs.writeFileSync(`${__dirname}/history/${date_str}.html`, soup); // save a history html file

	const headers = wrapper.findAll('div', 'gridheader');

	// loop through grid headers to save needed information

	for (const header of headers) {
		const body = header.findNextSibling('div');

		let ul = body.find('ul');


		try {
			switch (header.getText().replace(/&nbsp;/g, ' ')) {
				case 'Active cases': {
					active_cases(
						{ studentModel: models.studentModel, employeeModel: models.employeeModel },
						ul,
						date_str
					);
					break;
				}
				case 'Symptomatic testing':{
					scrape_sympomatic_tests({symptomaticPositiveModel: models.symptomaticPositiveModel, symptomaticNegativeModel: models.symptomaticNegativeModel}, ul, date_str)
					break
				}
				case 'Asymptomatic surveillance testing':{
					scrape_asympomatic_tests({asymptomaticPositiveModel: models.asymptomaticPositiveModel, asymptomaticNegativeModel: models.asymptomaticNegativeModel}, ul, date_str)
					break
				}
				case 'Entry testing':{
					scrape_entry_tests({entryTestPositiveModel: models.entryTestPositiveModel, entryTestNegativeModel: models.entryTestNegativeModel}, ul, date_str)
					break;
				}

			}
		} catch (err) {
			console.log(err)
			continue;
		}
	}

	// because isolation and quarantines are seperate now we gotta do this

	const isolationAndQuarantineHeader = wrapper.nextSibling;
	const isolationAndQuarantineBody = isolationAndQuarantineHeader.nextElement;

	isolation_quarantines(
			{ isolationModel: models.isolationModel, quarantineModel: models.quarantineModel },
			isolationAndQuarantineBody.nextElement.contents[0],
			date_str
	);




};
