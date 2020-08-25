const util = require('../util');
module.exports = function (model, ul, date) {
	const contents = ul.contents;

	for (const li of contents.slice(1, 3)) {
        const strong = li.find('strong');
		const type = li.getText().replace(/&nbsp;/g, ' ').split(' ')[0];
        const count = parseInt(strong.text);
		util.create(model['prevalence' + type + 'Model'], date, count);
	}
}