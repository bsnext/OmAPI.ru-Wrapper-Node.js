const fetch = (...args) => import(`node-fetch`).then(({ default: fetch }) => fetch(...args));
const gateway = `https://omapi.ru/api`;

////////////////

class OmAPI {
    constructor(username, token = `default`) {
        if (!username || !token) {
            throw new Error(`Token or Username in invalid`);
        };

        this.token = token;
        this.username = username;

        this.private = (token != `default`);

        this.fetch = async function (group, method, options) {
            try {
                const response = await fetch(`${gateway}/${group}/${method}?token=${this.token}&${options}`);
                const message = await response.json();

                if (!message.error) {
                    return message;
                } else {
                    throw new Error(message.error);
                };
            } catch (error) {
                throw new Error(error);
            };
        };
    }

    getName() {
        return this.username;
    }

    getUser(username) {
        return new OmAPIUser(this, username);
    }

    async getSocketAccess() {
        const response = await this.fetch(`user`, `getSocketAccess`, `username=${this.username}`);
        return response.result;
    }
}

class OmAPIUser {
    constructor(parentClass, username) {
        this.parent = parentClass;
        this.username = username;
    }

    getName() {
        return this.username;
    }

    getStreamSession(sessionID) {
        return new OmAPISession(this.parent, this.username, sessionID);
    }
}

class OmAPISession {
    constructor(parentClass, username, sessionID) {
        this.parent = parentClass;
        this.username = username;
        this.session = sessionID;
    }

    getID() {
        return this.session;
    }
};

////////////////

const OmAPIUserMethods = [
    `getFollowersCount`, `getFollowersList`, `getFollowsCount`, `getFollowsList`, `getFavorites`, `getModerators`, `getAvatar`, `getLevel`, `isLive`, `isVerified`, `isHasOmletCreator`, `isHasOmletPlus`, `getStreamViewers`, `getStreamHotness`, `getStreamSessionID`, `getFollowersCount`, `getFollowersList`, `getFollowsCount`,
];

const OmAPISessionMethods = [
    `getDuration`, `getName`, `getGame`, `getDonatesList`,
];

OmAPIUserMethods.fill = function() {
    for (let methodName of OmAPIUserMethods) {
        OmAPIUser.prototype[methodName] = async function () {
            const response = await this.parent.fetch(`user`, methodName, `username=${this.username}`);
            return response;
        }
    };
};


OmAPISessionMethods.fill = function() {
    for (let methodName of OmAPISessionMethods) {
        OmAPISession.prototype[methodName] = async function () {
            const response = await this.parent.fetch(`session`, methodName, `username=${this.username}&session=${this.session}`);
            return response;
        }
    };
};

OmAPIUserMethods.fill();
OmAPISessionMethods.fill();

////////////////

module.exports = OmAPI;