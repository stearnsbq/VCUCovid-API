const jssoup = require('jssoup').default;
const axios = require('axios');
const fs = require('fs');

// basic scraper file to grab new cases / isolations / qurantines / positive tests / negative tests

module.exports = async function(models) {
	const moment = require('moment');
	const util = require('../util');


	async function create(model, date, value) {
        const entry = new model();
		if (!await util.exists(model, { date })) {
			entry.value = value;
			entry.date = date;
			await entry.save();
		}
	}

	const request = await axios.get('https://together.vcu.edu/dashboard/'); // grab the html from the dashboard site

	const html = request.data

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

		if(header.getText() === 'Prevalence'){
			ul.contents = ul.contents.slice(2, 3);
		}

		for (const li of ul.contents) {
			try {

				const text = li.getText().replace(/&nbsp;/g, ' ').trim().split(' '); // remove no break spaces, trim and split into tokens

				const count = parseInt(text[text.length - 1].replace(/,/g, '')); // get count from each statistic

                // depending on the type create new sections for each day
				switch (text[0]) {
					case 'Residential': {
						const type = text[4];
						await create(models[type + 'Model'], date_str, count);
						break;
					}
					case 'Positive':
					case 'Negative': {
						if(header.getText() === 'Prevalence'){
							await create(models[header.getText().toLowerCase() + text[0] + 'Model'], date_str, count);
						}else{
							await create(models[text[0].toLowerCase() + 'Model'], date_str, count);
						}
						break;
					}
					case 'Active': {
                        const type = text[1];
						await create(models[type + 'Model'], date_str, count);
						break;
					}
				}


			} catch (err) {
				console.log(err)
				continue;
			}
		}
	}
};
