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
exports.DAKI_API_ENDPOINTS = exports.DAKI_API_URL = exports.DAKI_HOST = exports._servers_panel = void 0;
const Api_1 = __importDefault(require("./Api"));
const FormatBytes_1 = __importDefault(require("./FormatBytes"));
const LocalStorage_1 = __importDefault(require("./LocalStorage"));
const Panel_1 = __importDefault(require("./Panel"));
const Request_1 = __importDefault(require("./Request"));
const Setup_1 = __importStar(require("./Setup"));
const Time_1 = __importDefault(require("./Time"));
let apiKey = undefined;
const DAKI_HOST = "https://portal.daki.cc";
exports.DAKI_HOST = DAKI_HOST;
const DAKI_API_URL = "https://portal.daki.cc/api/";
exports.DAKI_API_URL = DAKI_API_URL;
const DAKI_API_ENDPOINTS = {
    ListServers: `${DAKI_API_URL}client`,
    ShowPermissions: `${DAKI_API_URL}client/permissions`,
    Resources: `${DAKI_API_URL}client/servers/%UUID%/resources`,
};
exports.DAKI_API_ENDPOINTS = DAKI_API_ENDPOINTS;
const _servers_panel = jQuery(".servers-panel");
exports._servers_panel = _servers_panel;
exports.default = {
    Connect(_apiKey) {
        if (apiKey !== undefined)
            return console.warn("Api already connected.");
        apiKey = _apiKey;
        Request_1.default.new(DAKI_API_ENDPOINTS.ListServers, "GET", {}, undefined, apiKey).then(_res => _res.json()).then((res) => {
            if (res.errors) {
                res.errors.forEach(err => {
                    M.toast({
                        html: Request_1.default.FormatApiError(err)
                    });
                });
                Setup_1.default.ResetSetupPanel();
                apiKey = undefined;
                return;
            }
            Panel_1.default.SetVisible(Setup_1._setup_panel, false);
            Panel_1.default.SetVisible(_servers_panel, true);
            res.data?.forEach(_server => {
                const [serverItem, serverItemName, serverItemBody, serverItemStatus, serverItemResources] = Api_1.default.CreateServerItem(_server, _servers_panel);
                async function UpdateServerResources(ignoreFocusCheck) {
                    if ((document.visibilityState === "hidden" || !document.hasFocus()) && !ignoreFocusCheck)
                        return;
                    await Api_1.default.GetServerResources(_server).then(resource => {
                        const _resources = {
                            memory_bytes: (0, FormatBytes_1.default)(resource.attributes.resources.memory_bytes),
                            disk_bytes: (0, FormatBytes_1.default)(resource.attributes.resources.disk_bytes),
                            network_rx_bytes: (0, FormatBytes_1.default)(resource.attributes.resources.network_rx_bytes),
                            network_tx_bytes: (0, FormatBytes_1.default)(resource.attributes.resources.network_tx_bytes),
                            cpu_absolute: resource.attributes.resources.cpu_absolute + "%",
                            uptime: (0, Time_1.default)((new Date().getTime()) - resource.attributes.resources.uptime, true)
                        };
                        resource.attributes.current_state === "running" ? serverItemStatus.addClass("green") : serverItemStatus.addClass("red");
                        serverItemStatus.attr("data-tooltip", "Uptime: " + _resources.uptime);
                        serverItemResources.children().each((index, element) => {
                            const _resourceName = $(element).attr("data-resource-name");
                            $(element).find(".resource-value").text(_resources[_resourceName]);
                            M.Tooltip.init(element);
                        });
                    });
                }
                (async () => {
                    await UpdateServerResources(true);
                    setInterval(UpdateServerResources, 10000);
                })();
            });
            LocalStorage_1.default.Set("_dakicontrolpanel", "apikey", apiKey);
        }).catch(err => {
            apiKey = undefined;
            LocalStorage_1.default.Set("_dakicontrolpanel", "apikey", undefined);
            Setup_1.default.ResetSetupPanel();
            M.toast({
                html: err
            });
        });
    },
    CreateServerItem(server, parent) {
        const serverItem = jQuery(".server-item-template").contents().clone(), serverItemName = serverItem.find(".server-item-name"), serverItemBody = serverItem.find(".server-item-body"), serverItemStatus = serverItem.find(".server-item-status"), serverItemResources = serverItem.find(".server-item-resources");
        serverItem.appendTo(parent);
        serverItemName.text(server.attributes.name);
        serverItemName.on("click", () => {
            console.log("open server", server);
        });
        M.Tooltip.init(serverItemStatus);
        return [serverItem, serverItemName, serverItemBody, serverItemStatus, serverItemResources];
    },
    async GetServerResources(server) {
        return Request_1.default.new(DAKI_API_ENDPOINTS.Resources.replace("%UUID%", server.attributes.uuid), "GET", {}, undefined, apiKey).then(res => res.json());
    }
};
