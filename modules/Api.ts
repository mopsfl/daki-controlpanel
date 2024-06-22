import self from "./Api"
import Panel from "./Panel"
import Request from "./Request"
import Setup, { _input_setup_api_key, _setup_panel, _submit_input_setup } from "./Setup"

let apiKey = undefined

const DAKI_HOST = "portal.daki.cc"
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
                return
            }
            Panel.SetVisible(_setup_panel, false)
            Panel.SetVisible(_servers_panel, true)

            res.data?.forEach(_server => {
                const [serverItem, serverItemName, serverItemBody, serverItemStatus] = self.CreateServerItem(_server, _servers_panel)

                self.GetServerResources(_server).then(resource => {
                    resource.attributes.current_state === "running" ? serverItemStatus.addClass("green") : serverItemStatus.addClass("red")
                })
            })
        }).catch(err => {
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
            serverItemStatus = serverItem.find(".server-item-status")

        serverItem.appendTo(parent)
        serverItemName.text(server.attributes.name)

        serverItemName.on("click", () => serverItemBody.toggleClass("toggled"))
        return [serverItem, serverItemName, serverItemBody, serverItemStatus]
    },

    async GetServerResources(server: Server): Promise<ServerResources> {
        return Request.new(DAKI_API_ENDPOINTS.Resources.replace("%UUID%", server.attributes.uuid), "GET", {}, undefined, apiKey).then(res => res.json())
    }
}

export { _servers_panel }

export interface ServerList {
    errors: [APIError],
    object: string,
    data: [Server],
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
            network_tx_bytes: number
        }
    }
}

export type ServerState = "starting" | "running" | "offline"

export interface APIError {
    code: string,
    status: string,
    detail: string
}

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