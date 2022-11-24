module.exports = {
    setUpLabels: (reqQuery) => {
        switch (reqQuery) {
            case 'size': {
                return {label1: 'Size US/UK', label2: 'Size Vietnam'}
            }
            default: {
                return {label1: 'Name', label2: 'Description'}

            }
        }
    },

    filterCategory: (arrayCategory) => {
        var k = 'value', i = 0;
        for(category in arrayCategory) {
            eval('var ' + k + i + ';');
        }
        var index = 0;
        for(category in arrayCategory) {
            if(index === 0) {
                value0 = arrayCategory[category];
            }
            else if(index === 1) {
                value1 = arrayCategory[category];
            }
            else {
                value2 = arrayCategory[category];
            }
            index++;
        }
        // const listBrand = arrayCategory.filter(brand => brand.type==='brand');
        // const listSize = arrayCategory.filter(size => size.type==='size');
        // const listStyle = arrayCategory.filter(style => style.type==='style');
        // return {listBrand, listSize, listStyle};
        return { value0, value1, value2 };
    },

    sortSize: (listSize) => {
        return listSize.sort((a, b) => a.cateName - b.cateName);
    },
}