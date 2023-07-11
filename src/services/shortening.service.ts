import { ChatGPTClient } from "../clients/chatgpt.client"
import { getEnvVar } from "../utils/common.utils"
import { splitLongText } from "../utils/text.utils"

export class ShorteningService {
  private chatgptClient: ChatGPTClient

  constructor() {
    this.chatgptClient = new ChatGPTClient()
  }

  async shortenText(
    content: string,
    chunks: number
  ): Promise<string | undefined> {
    console.log("shortenText() called with: ", content)

    const contentParts = splitLongText(content, chunks) // Break into 5

    const prompt = getEnvVar("SHORTEN_PROMPT")

    const shortenedParts = []
    for (const contentPart of contentParts) {
      shortenedParts.push(
        await this.chatgptClient.completeWithErrorHandling(
          `${prompt} ${contentPart}`
        )
      )
    }

    return shortenedParts.toString()
  }
}
