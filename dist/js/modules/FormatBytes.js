"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(b, d = 2) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (!+b)
        return `0 ${sizes[0]}`;
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(d)} ${sizes[i]}`;
}
