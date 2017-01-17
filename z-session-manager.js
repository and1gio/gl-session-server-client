module.exports = function () {

    var zSessionManager = {};

    zSessionManager.getData = function (req) {
        if (!req || !req.session) {
            return null;
        }
        return req.session;
    };

    /*
     * open session
     */
    zSessionManager.openSessionWithSessionActiveTime = function (req, userToken, inactiveMinutesBeforeSessionDies, objectToSaveInSession, cb) {
        var me = this;
        objectToSaveInSession.inactiveMinutesBeforeSessionDies = inactiveMinutesBeforeSessionDies;
        me.openSession(req, userToken, objectToSaveInSession, cb);
    };

    zSessionManager.openSession = function (req, userToken, objectToSaveInSession, cb) {
        req.session.regenerate(function (sessionRegenerateError) {
            if (sessionRegenerateError) {
                return cb([{keyword: 'ERROR_WHILE_REGENERATE_SESSION'}], null);
            }

            /*
             * fill session user object
             */
            for (var i in objectToSaveInSession) {
                req.session[i] = objectToSaveInSession[i];
            }

            req.session.userToken = userToken;

            /*
             * save session user object
             */
            req.session.save(function (sessionSaveError) {
                if (sessionSaveError) {
                    return cb([{keyword: 'ERROR_WHILE_SAVING_THE_SESSION'}], null);
                }

                req.session.reload(function () {
                    cb(null, req.session);
                });
            });
        });
    };

    zSessionManager.closeSession = function (req, cb) {
        req.session.destroy(function (sessionDestroyError) {
            if (sessionDestroyError) {
                return cb([{keyword: 'ERROR_WHILE_DESTROYING_THE_SESSION'}], null);
            }
            cb(null, true);
        });
    };

    return zSessionManager;
};