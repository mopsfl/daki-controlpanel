import { Materialbox } from "materialize-css";
import jQuery from "jquery";

import Setup from "./modules/Setup";
import Api from "./modules/Api";
import Request from "./modules/Request";
import Panel from "./modules/Panel";

jQuery(() => {
    Setup.Init()

    window.modules = { Setup, Api, Request, Panel }
})

declare global {
    interface Window {
        modules: Object,
    }
}