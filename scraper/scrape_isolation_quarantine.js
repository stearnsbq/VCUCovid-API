const util = require('../util');
module.exports = function(model, ul, date) {
	const contents = ul.contents;

	for (const li of contents.slice(0, 2)) {
		const strong = li.find('strong');
		const type = li.getText().replace(/&nbsp;/g, ' ').split(' ')[4];
		const count = parseInt(strong.text);
		util.create(model[type + 'Model'], date, count);
	}
};
