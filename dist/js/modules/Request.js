"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Api_1 = require("./Api");
const Request_1 = __importDefault(require("./Request"));
exports.default = {
    async new(url, method, headers, body, auth) {
        if (!url)
            throw new Error("Unable to create new request. (missing url<string>)");
        if (auth)
            headers["Authorization"] = Request_1.default.CreateBearerAuthObject(auth);
        headers["Accept"] = "application/json";
        headers["access-control-allow-origin"] = Api_1.DAKI_HOST;
        return fetch(url, { headers: headers, body: body, method: method });
    },
    CreateBearerAuthObject(string) {
        return `Bearer ${string}`;
    },
    FormatApiError(error) {
        return `${error.code}: ${error.status} - ${error.detail}`;
    }
};
