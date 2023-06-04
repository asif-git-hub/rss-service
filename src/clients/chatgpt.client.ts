import { HttpClient } from "./http.client"
import { AxiosResponse, AxiosHeaders } from "axios"
import { PromptCompletionError } from "../errors/prompt.completion.error"
import { getEnvVar } from "../utils/common.utils"
import { ChatGPTMessageType } from "./types/chatgpt.client.types"
import { SSMClient } from "../aws/ssm.client"

export class ChatGPTClient {
  private httpClient: HttpClient
  private apiKey

  constructor() {
    this.httpClient = new HttpClient()
    this.apiKey = new SSMClient().getParameter("/openai/apikey")
  }

  async chat(messages: ChatGPTMessageType[]) {
    console.log("chat() called", messages)

    const body = {
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 3700,
      temperature: 0.1,
      n: 1,
      stream: false,
    }

    const apiKey = await this.apiKey

    const headers = new AxiosHeaders({
      Authorization: `Bearer ${apiKey}`,
    })

    return await this.httpClient.post(
      getEnvVar("OPENAI_CHAT_URL"),
      body,
      headers
    )
  }

  async complete(prompt: string): Promise<AxiosResponse> {
    try {
      console.log("complete() called", prompt)

      const body = {
        model: "text-davinci-003",
        prompt,
        max_tokens: 3600,
        temperature: 0.1,
        n: 1,
        stream: false,
      }

      const apiKey = await this.apiKey

      const headers = new AxiosHeaders({
        Authorization: `Bearer ${apiKey}`,
      })

      return await this.httpClient.post(
        getEnvVar("OPENAI_COMPLETION_URL"),
        body,
        headers
      )
    } catch (e) {
      console.error("unable to execute complete() ", e)
      throw new PromptCompletionError("Unable to process prompt")
    }
  }
}
