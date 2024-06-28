import { Materialbox } from "materialize-css";
import jQuery from "jquery";

import Setup from "./modules/Setup";
import Api from "./modules/Api";
import Request from "./modules/Request";
import Panel from "./modules/Panel";
import LocalStorage from "./modules/LocalStorage";

jQuery(() => {
    Setup.Init()

    window.modules = { Setup, Api, Request, Panel, LocalStorage }
})

declare global {
    interface Window {
        modules: Object,
    }
}