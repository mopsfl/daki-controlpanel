"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    SetVisible(_setup_panel, state) {
        _setup_panel.toggleClass("hide", !state);
    }
};
