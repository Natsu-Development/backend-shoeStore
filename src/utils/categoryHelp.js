module.exports = {
	setUpLabels: (reqQuery) => {
		switch (reqQuery) {
			case "size": {
				return { label1: "Size US/UK", label2: "Size Vietnam" };
			}
			default: {
				return { label1: "Name", label2: "Description" };
			}
		}
	},

	getCateSize: (arrayCategory) => {
		let listSize = [];

		for (category in arrayCategory) {
			if (Number(arrayCategory[category][0].cateName)) {
				listSize = arrayCategory[category];
				delete arrayCategory[category];
			}
		}

		return { listSize };
	},

	sortSize: (listSize) => {
		return listSize.sort((a, b) => a.cateName - b.cateName);
	},
};
