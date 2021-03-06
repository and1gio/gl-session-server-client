var ZApiRequestHelper = require("z-api-request-helper");
var ZSessionManager = require("./z-session-manager");

/**
 * Return the `SessionStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */
var ZSessionServerClient = function (session) {
    var Store = session.Store;

    function SessionStore(config) {
        var me = this;
        me.api = new ZApiRequestHelper(config);
    }

    /**
     * Inherit from `Store`.
     */
    SessionStore.prototype.__proto__ = Store.prototype;
    SessionStore.zSessionManager = ZSessionManager();

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {String} sid
     * @param {Function} fn
     * @api public
     */
    SessionStore.prototype.get = function (sid, fn) {
        me = this;

        var params = {
            data: {
                sessionToken: sid
            }
        };

        me.api.post("session/get/by/session-token", params, function (err, res) {
            if (err) {
                return fn(null, null);
            }
            if (!res || !res.data || !res.data.sessionData) {
                return fn(null, null);
            }
            return fn(null, res.data.sessionData);
        });
    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */
    SessionStore.prototype.set = function (sid, session, cb) {
        var me = this;

        if (!sid) {
            return cb(null, -1);
        }

        if (!session || !session.userToken) {
            return cb(null, -1);
        }

        var params = {
            data: {
                sessionToken: sid,
                userToken: session.userToken,
                sessionData: session
            }
        };

        me.api.post("session/add-edit", params, function (err, res) {
            err ? cb(err, null) : cb(null, 'OK');
        });
    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @api public
     */
    SessionStore.prototype.destroy = function (sid, cb) {
        var me = this;

        var params = {
            data: {
                sessionToken: sid
            }
        };

        me.api.post("session/delete/by/session-token", params, function (err, res) {
            err ? cb(err, null) : cb(null, 1);
        })
    };

    /**
     * Refresh the time-to-live for the session with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */
    SessionStore.prototype.touch = function (sid, sess, fn) {
        // TODO - our api anyway refreshes time-to-live for the session when we get the session
        return fn(0, 1);
    };

    return SessionStore;
};

module.exports = ZSessionServerClient;
