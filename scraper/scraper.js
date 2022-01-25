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

	const general = soup.find('div', 'plugin-general-content');

	const last_update = general.nextElement.nextSibling;

	const date = new Date(Date.parse(last_update.text.replace(/["'()]/g, '').replace(/&nbsp;/gi, '').split('updated')[1].trim())); // parse the last updated date

	const date_str = moment(date).format('YYYY-MM-DD');

	const cards = soup.find('div', 'cwf-grid').findAll("div", "plugin-card");

	fs.writeFileSync(`${__dirname}/history/${date_str}.html`, soup.text); // save a history html file

	// loop through grid headers to save needed information

	for (const card of cards) {

		const body = card.find("div", "plugin-card__body")

		const header = body.find("h2")

		const ul = body.find("ul")

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
				case 'Asymptomatic testing':{
					scrape_asympomatic_tests({asymptomaticPositiveModel: models.asymptomaticPositiveModel, asymptomaticNegativeModel: models.asymptomaticNegativeModel, entryTestPositiveModel: models.entryTestPositiveModel, entryTestNegativeModel: models.entryTestNegativeModel}, body, date_str)
					break
				}
				case 'On-campus isolation and quarantine':{
					isolation_quarantines({ isolationModel: models.isolationModel, quarantineModel: models.quarantineModel }, ul, date_str);
					break;
				}



			}
		} catch (err) {
			console.log(err)
			continue;
		}
	}

	// because isolation and quarantines are seperate now we gotta do this






};
