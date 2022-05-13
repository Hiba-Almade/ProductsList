//Save and get were used because there will be only one object or instance of this class
const Design = {
    save: (design) => {
        return new Promise((resolve, reject) => {
            Constants.db.save(design, Constants.Collections.DESIGN, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    get: () => {
        return new Promise((resolve, reject) => {
            Constants.db.get(Constants.Collections.DESIGN, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
};