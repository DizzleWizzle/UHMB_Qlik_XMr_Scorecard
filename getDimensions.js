define(['qlik', 'qvangular'], function (qlik, qv) {

    /**
     * Returns a Promise of an array of Sheets within the app.
     */
    var Promise = qv.getService('$q');

    return function () {
        return new Promise(function(resolve, reject) {
            var app = qlik.currApp();

            app.getList('FieldList').then( function(model) {

                // Close the model to prevent any updates.
                app.destroySessionObject(model.layout.qInfo.qId);
				console.log(model);

                // This is a bit iffy, might be smarter to reject and handle empty lists on the props instead.
                if(!model.layout.qFieldList.qItems) return resolve({value: '', label: 'No Dimensions'});

                // Resolve an array of Fields.
                return resolve( model.layout.qFieldList.qItems.map(function(item) {
                    return {
                        value: item.qName,
                        label: item.qName
                    };
                }).sort(function(a, b) {
					return a.label < b.label ? 1 : -1;
				}) );

            });

        });
    };

});
