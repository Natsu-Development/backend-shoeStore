const moment = require("moment-timezone");

class commonHelp {
	formatDateTime(date) {
		moment.tz.setDefault("Asia/Ho_Chi_Minh");
		moment.locale("vn");
		return moment(date).format("MM-DD-YYYY HH:mm:ss A");
	}

	formatDateNow() {
		moment.tz.setDefault("Asia/Ho_Chi_Minh");
		moment.locale("vn");
		const date = new Date();
		return moment(date).format("MM-DD-YYYY HH:mm:ss A");
	}
}

module.exports = new commonHelp();
