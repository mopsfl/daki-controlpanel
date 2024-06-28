import self from "./Api"
import FormatBytes from "./FormatBytes"
import LocalStorage from "./LocalStorage"
import Panel from "./Panel"
import Request from "./Request"
import Setup, { _input_setup_api_key, _setup_panel, _submit_input_setup } from "./Setup"
import TimeAgo from "./Time"

let apiKey = undefined

const DAKI_HOST = "https://portal.daki.cc"
const DAKI_API_URL = "https://portal.daki.cc/api/"
const DAKI_API_ENDPOINTS = {
    ListServers: `${DAKI_API_URL}client`,
    ShowPermissions: `${DAKI_API_URL}client/permissions`,
    Resources: `${DAKI_API_URL}client/servers/%UUID%/resources`,
}

const _servers_panel = jQuery(".servers-panel")

export default {
    Connect(_apiKey: string) {
        if (apiKey !== undefined) return console.warn("Api already connected.")
        apiKey = _apiKey

        Request.new(DAKI_API_ENDPOINTS.ListServers, "GET", {}, undefined, apiKey).then(_res => _res.json()).then((res: ServerList) => {
            if (res.errors) {
                res.errors.forEach(err => {
                    M.toast({
                        html: Request.FormatApiError(err)
                    })
                })
                Setup.ResetSetupPanel()
                apiKey = undefined
                return
            }
            Panel.SetVisible(_setup_panel, false)
            Panel.SetVisible(_servers_panel, true)

            res.data?.forEach(_server => {
                const [serverItem, serverItemName, serverItemBody, serverItemStatus, serverItemResources] = self.CreateServerItem(_server, _servers_panel)

                async function UpdateServerResources(ignoreFocusCheck?: boolean) {
                    if ((document.visibilityState === "hidden" || !document.hasFocus()) && !ignoreFocusCheck) return
                    await self.GetServerResources(_server).then(resource => {
                        const _resources = {
                            memory_bytes: FormatBytes(resource.attributes.resources.memory_bytes),
                            disk_bytes: FormatBytes(resource.attributes.resources.disk_bytes),
                            network_rx_bytes: FormatBytes(resource.attributes.resources.network_rx_bytes),
                            network_tx_bytes: FormatBytes(resource.attributes.resources.network_tx_bytes),
                            cpu_absolute: resource.attributes.resources.cpu_absolute + "%",
                            uptime: TimeAgo((new Date().getTime()) - resource.attributes.resources.uptime, true)
                        }
                        resource.attributes.current_state === "running" ? serverItemStatus.addClass("green") : serverItemStatus.addClass("red")

                        serverItemStatus.attr("data-tooltip", "Uptime: " + _resources.uptime)
                        serverItemResources.children().each((index, element) => {
                            const _resourceName = $(element).attr("data-resource-name")
                            $(element).find(".resource-value").text(_resources[_resourceName])
                            M.Tooltip.init(element)
                        })
                    })
                }

                (async () => {
                    await UpdateServerResources(true)
                    setInterval(UpdateServerResources, 10000)
                })()
            })

            LocalStorage.Set("_dakicontrolpanel", "apikey", apiKey)
        }).catch(err => {
            apiKey = undefined
            LocalStorage.Set("_dakicontrolpanel", "apikey", undefined)
            Setup.ResetSetupPanel()
            M.toast({
                html: err
            })
        })
    },

    CreateServerItem(server: Server, parent: JQuery<HTMLElement>) {
        const serverItem = jQuery(".server-item-template").contents().clone(),
            serverItemName = serverItem.find(".server-item-name"),
            serverItemBody = serverItem.find(".server-item-body"),
            serverItemStatus = serverItem.find(".server-item-status"),
            serverItemResources = serverItem.find(".server-item-resources")

        serverItem.appendTo(parent)
        serverItemName.text(server.attributes.name)
        serverItemName.on("click", () => {
            console.log("open server", server);
        })

        M.Tooltip.init(serverItemStatus)
        return [serverItem, serverItemName, serverItemBody, serverItemStatus, serverItemResources]
    },

    async GetServerResources(server: Server): Promise<ServerResources> {
        return Request.new(DAKI_API_ENDPOINTS.Resources.replace("%UUID%", server.attributes.uuid), "GET", {}, undefined, apiKey).then(res => res.json())
    }
}

export { _servers_panel, DAKI_HOST, DAKI_API_URL, DAKI_API_ENDPOINTS }

export interface ServerList {
    errors: [APIError],
    data: [Server],
    object: string,
    meta: {
        pagination: {
            total: number
            count: number
            per_page: number
            current_page: number
            total_pages: number
            links: Object
        }
    }
}

export interface ServerResources {
    errors: [APIError],
    object: string
    attributes: {
        current_state: ServerState
        is_suspended: boolean
        resources: {
            memory_bytes: number
            cpu_absolute: number
            disk_bytes: number
            network_rx_bytes: number
            network_tx_bytes: number,
            uptime: number,
        }
    }
}

export type ServerState = "starting" | "running" | "offline"
export interface APIError { code: string, status: string, detail: string }

export interface Server {
    object: string,
    attributes: {
        server_owner: boolean
        identifier: string
        internal_id: number
        nest_id: number
        uuid: string
        name: string
        node: string
        sftp_details: { ip: string, port: number }
        description: string
        limits: {
            memory: number
            swa: number
            disk: number
            io: number
            cpu: number
            threads: any
            oom_disabled: boolean
        },
        invocation: string,
        docker_image: string
        egg_features: any,
        feature_limits: { databases: number, allocations: number, backups: number }
        status: any
        is_suspended: boolean
        is_installing: boolean
        is_transferring: boolean
        relationships: {
            allocations: {}
            variables: {}
        }
    }
}