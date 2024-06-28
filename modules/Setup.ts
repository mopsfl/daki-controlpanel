import jQuery from "jquery";
import Panel from "./Panel";
import self from "./Setup"
import Api, { _servers_panel } from "./Api";
import LocalStorage from "./LocalStorage";

const _setup_panel = jQuery(".setup-panel")
const _input_setup_api_key = jQuery("#input_setup_api_key")
const _submit_input_setup = jQuery("#submit_input_setup")

export default {
    Init() {
        if (!LocalStorage.GetKey("_dakicontrolpanel", "apikey")) {
            LocalStorage.Create("_dakicontrolpanel", {})
            Panel.SetVisible(_setup_panel, true)
        } else {
            const _dakicontrolpanelApiKey = LocalStorage.GetKey("_dakicontrolpanel", "apikey")
            Api.Connect(_dakicontrolpanelApiKey);
        }

        _submit_input_setup.on("click", () => {
            const _apiKeyInput = self.GetApiKeyInput().toString()
            if (self.CheckApiKeyInput(_apiKeyInput)) {
                _submit_input_setup.prop("disabled", true).text("...")
                _input_setup_api_key.prop("disabled", true)
                _setup_panel.addClass("blurbg")
                _input_setup_api_key.val("")
                _input_setup_api_key.prop("placeholder", "")

                Api.Connect(_apiKeyInput)
            } else {
                M.toast({
                    html: "Please enter a valid api key."
                })
            }
        })
    },

    ResetSetupPanel() {
        Panel.SetVisible(_setup_panel, true)
        Panel.SetVisible(_servers_panel, false)
        _submit_input_setup.prop("disabled", false).text("CONNECT")
        _input_setup_api_key.prop("disabled", false)
        _input_setup_api_key.val("")
        _setup_panel.removeClass("blurbg")
        _input_setup_api_key.prop("placeholder", "ptlc_umG...ar3")
    },

    GetApiKeyInput() {
        return _input_setup_api_key.val()
    },

    CheckApiKeyInput(apiKeyInput: string) {
        return /^ptlc\_\w+/gm.test(apiKeyInput)
    }
}

export { _setup_panel, _input_setup_api_key, _submit_input_setup }