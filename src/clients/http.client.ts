import { AxiosHeaders, AxiosResponse } from "axios"
import axios from "axios"
import { AuthenticationError } from "../errors/authentication.error"

export class HttpClient {
  async post<T>(
    url: string,
    body: T,
    headers: AxiosHeaders
  ): Promise<AxiosResponse> {
    const response = await axios({
      method: "post",
      url,
      data: body,
      headers,
    })

    if (response.status === 200 || response.status === 201) {
      return response
    } else if (response.status === 401) {
      console.error("Authentication Error", response)
      throw new AuthenticationError(
        "Authentication Error while attempting post"
      )
    } else {
      return response
    }
  }

  async get(url: string, headers?: AxiosHeaders): Promise<AxiosResponse> {
    const response = await axios({
      method: "get",
      url,
      headers,
    })

    if (response.status === 200) {
      return response
    } else {
      console.error("Unable to perform get", response)
      throw new Error(
        `HTTP Error: Cannot perform get on url: ${url}. ${response}`
      )
    }
  }
}
