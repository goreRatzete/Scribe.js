/* jshint -W098 */
(function() {
    var scribe = require('../scribe')(),
        express = require('koa'),
        app = express(),
        console = process.console;

    app.set('port', (process.env.PORT || 5000));

    app.use(scribe.koa.logger()); //Log each request

    var port = app.get("port");

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();
