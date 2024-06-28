"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._submit_input_setup = exports._input_setup_api_key = exports._setup_panel = void 0;
const jquery_1 = __importDefault(require("jquery"));
const Panel_1 = __importDefault(require("./Panel"));
const Setup_1 = __importDefault(require("./Setup"));
const Api_1 = __importStar(require("./Api"));
const LocalStorage_1 = __importDefault(require("./LocalStorage"));
const _setup_panel = (0, jquery_1.default)(".setup-panel");
exports._setup_panel = _setup_panel;
const _input_setup_api_key = (0, jquery_1.default)("#input_setup_api_key");
exports._input_setup_api_key = _input_setup_api_key;
const _submit_input_setup = (0, jquery_1.default)("#submit_input_setup");
exports._submit_input_setup = _submit_input_setup;
exports.default = {
    Init() {
        if (!LocalStorage_1.default.GetKey("_dakicontrolpanel", "apikey")) {
            LocalStorage_1.default.Create("_dakicontrolpanel", {});
            Panel_1.default.SetVisible(_setup_panel, true);
        }
        else {
            const _dakicontrolpanelApiKey = LocalStorage_1.default.GetKey("_dakicontrolpanel", "apikey");
            Api_1.default.Connect(_dakicontrolpanelApiKey);
        }
        _submit_input_setup.on("click", () => {
            const _apiKeyInput = Setup_1.default.GetApiKeyInput().toString();
            if (Setup_1.default.CheckApiKeyInput(_apiKeyInput)) {
                _submit_input_setup.prop("disabled", true).text("...");
                _input_setup_api_key.prop("disabled", true);
                _setup_panel.addClass("blurbg");
                _input_setup_api_key.val("");
                _input_setup_api_key.prop("placeholder", "");
                Api_1.default.Connect(_apiKeyInput);
            }
            else {
                M.toast({
                    html: "Please enter a valid api key."
                });
            }
        });
    },
    ResetSetupPanel() {
        Panel_1.default.SetVisible(_setup_panel, true);
        Panel_1.default.SetVisible(Api_1._servers_panel, false);
        _submit_input_setup.prop("disabled", false).text("CONNECT");
        _input_setup_api_key.prop("disabled", false);
        _input_setup_api_key.val("");
        _setup_panel.removeClass("blurbg");
        _input_setup_api_key.prop("placeholder", "ptlc_umG...ar3");
    },
    GetApiKeyInput() {
        return _input_setup_api_key.val();
    },
    CheckApiKeyInput(apiKeyInput) {
        return /^ptlc\_\w+/gm.test(apiKeyInput);
    }
};
