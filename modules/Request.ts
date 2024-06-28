import { APIError, DAKI_HOST } from "./Api"
import self from "./Request"

export default {
    async new(url: string, method: RequestMethod, headers: HeadersInit, body: any, auth?: string) {
        if (!url) throw new Error("Unable to create new request. (missing url<string>)")
        if (auth) headers["Authorization"] = self.CreateBearerAuthObject(auth)
        headers["Accept"] = "application/json"
        headers["access-control-allow-origin"] = DAKI_HOST

        return fetch(url, { headers: headers, body: body, method: method })
    },

    CreateBearerAuthObject(string: string) {
        return `Bearer ${string}`
    },

    FormatApiError(error: APIError) {
        return `${error.code}: ${error.status} - ${error.detail}`
    }
}

export type RequestMethod = "GET" | "POST" | "DELETE" | "OPTIONS"