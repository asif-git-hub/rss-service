import { ChatGPTClient } from "../clients/chatgpt.client"
import { FeedContentRepository } from "../repository/feedcontent.repo"
import { FeedPromptRepository } from "../repository/prompt.repo"

export class ArticleSummaryService {
  private chatgptClient: ChatGPTClient
  private feedContentRepo: FeedContentRepository
  private promptRepo: FeedPromptRepository

  constructor() {
    this.chatgptClient = new ChatGPTClient()
    this.feedContentRepo = new FeedContentRepository()
    this.promptRepo = new FeedPromptRepository()
  }

  async createOneSummary() {
    const summaries = await this.createSummariesFromAllArticles()

    console.log(summaries)
  }

  async createSummariesFromAllArticles(): Promise<string[]> {
    const summaries: string[] = []
    const feedContents = await this.feedContentRepo.getAllFeedContents()

    if (!feedContents || feedContents.length === 0) {
      return summaries
    }

    for (const feedContent of feedContents) {
      let promptRecord = await this.promptRepo.getPrompt(
        "unspecified",
        feedContent.region
      )
      if (!promptRecord) {
        console.log(
          `Prompt not found for role unspecified and region ${feedContent.region}. Fetching fallback`
        )

        promptRecord = await this.promptRepo.getFallbackPrompt()

        if (!promptRecord) {
          console.error(
            `Fallback prompt missing from database. Skipping feedcontent for article ${feedContent.articleLink} and region ${feedContent.region}`
          )
          throw new Error("Fallback prompt missing from database")
        }
      }
      // You are an expert summarizer. Summarize this article for me:
      const summary = await this.chatgptClient.complete(
        `${promptRecord.prompt} ${feedContent.contentFromFeed}`
      )
      summaries.push(summary.data)
    }

    return summaries
  }
}
