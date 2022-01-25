const util = require('../util');
module.exports = function(model, ul, date) {
	const contents = ul.contents;

	for (const li of contents.slice(0, 2)) {
		const strong = li.find('strong');
		const type = li.getText().split(' ')[1];
		const count = parseInt(strong.text);
		util.create(model[type + 'Model'], date, count);
	}
};
