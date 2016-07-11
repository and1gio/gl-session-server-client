var errorCodes = require('gl-clients-error-codes');
var moment = require('moment');

module.exports = function () {

    var sessionManager = {};

    sessionManager.getData = function (req) {
        if (!req || !req.session) {
            return null;
        }
        return req.session;
    };

    /*
     * open session
     */
    sessionManager.openSessionWithSessionActiveTime = function (req, userToken, sessionActiveMinutes, objectToSaveInSession, cb) {
        var me = this;
        objectToSaveInSession.expireAt = moment().add(sessionActiveMinutes, 'm') ;
        me.openSession(req, userToken, objectToSaveInSession, cb);
    };


    sessionManager.openSession = function (req, userToken, objectToSaveInSession, cb) {
        req.session.regenerate(function (sessionRegenerateError) {
            if (sessionRegenerateError) {
                return cb(errorCodes('ERROR_WHILE_REGENERATE_SESSION', null), null);
            }

            /*
             * fill session user object
             */
            for(var i in objectToSaveInSession){
                req.session[i] = objectToSaveInSession[i];
            }

            req.session.userToken = userToken;

            /*
             * save session user object
             */
            req.session.save(function (sessionSaveError) {
                if (sessionSaveError) {
                    return cb(errorCodes('ERROR_WHILE_SAVING_THE_SESSION', null), null);
                }

                req.session.reload(function(){
                    cb(null, req.session);
                });
            });
        });
    };

    sessionManager.closeSession = function (req, cb) {
        req.session.destroy(function (sessionDestroyError) {
            if (sessionDestroyError) {
                return cb(errorCodes('ERROR_WHILE_DESTROYING_THE_SESSION', null), null);
            }
            cb(null, true);
        });
    };

    return sessionManager;
};