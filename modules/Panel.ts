import jQuery from "jquery";

export default {
    SetVisible(_setup_panel: JQuery<HTMLElement>, state: boolean) {
        _setup_panel.toggleClass("hide", !state)
    }
}