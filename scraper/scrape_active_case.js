const util = require('../util');
module.exports = function(model, ul, date) {
	const contents = ul.contents;

	for (const li of contents) {
		const strong = li.find('strong');
		const type = li.getText().split(' ')[1];
        const count = parseInt(strong.text);
        const totalEmployeesOrStudents = li.find('ul');
        const total_count = parseInt(totalEmployeesOrStudents.find('strong').text.replace(/,/g, ''))
        const total_type = totalEmployeesOrStudents.getText().split(' ')[3].replace(':', '');

        if(total_type === 'students'){  
            util.create(model.totalStudentModel, date, total_count)
        }else if (total_type === 'employees'){
            util.create(model.totalEmployeeModel, date, total_count)
        }

		util.create(model[type + 'Model'], date, count);
	}
};
