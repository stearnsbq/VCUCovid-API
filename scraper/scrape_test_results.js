const util = require('../util');
module.exports = function (model, ul, date) {
	const contents = ul.contents;

	for (const li of contents) {
        const strong = li.find('strong');
		const type = li.getText().replace(/&nbsp;/g, ' ').split(' ')[0];
        const count = parseInt(strong.text.replace(',', ''));
		util.create(model[type.toLowerCase() + 'Model'], date, count);
	}
}