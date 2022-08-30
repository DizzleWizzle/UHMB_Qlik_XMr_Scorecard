define(['qlik', 'qvangular'], function (qlik, qv) {

    /**
     * Returns a Promise of an array of Sheets within the app.
     */
    var Promise = qv.getService('$q');

    return function () {
        return new Promise(function(resolve, reject) {
            var app = qlik.currApp();

            app.getList('sheet').then(function(model) {

                // Close the model to prevent any updates.
                app.destroySessionObject(model.layout.qInfo.qId);

                // This is a bit iffy, might be smarter to reject and handle empty lists on the props instead.  May no longer be needed for Sheets
                if(!model.layout.qAppObjectList.qItems) return resolve({value: '', label: 'No Sheets'});

                // Resolve an array with master objects.
                return resolve( model.layout.qAppObjectList.qItems.map(function(item) {
                    return {
                        value: item.qInfo.qId,
                        label: item.qMeta.title
                    };
                }).sort(function(a, b) {
					return a.label < b.label ? 1 : -1;
				}) );

            });

        });
    };

});
