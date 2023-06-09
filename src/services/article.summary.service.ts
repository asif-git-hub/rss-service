import { ChatGPTClient } from "../clients/chatgpt.client"
import { FeedContentRepository } from "../repository/feedcontent.repo"
import { FeedPromptRepository } from "../repository/prompt.repo"
import {
  FeedRegionSummaryRecordType,
  FeedRegionSummaryRepository,
} from "../repository/region.summary.repo"
import { delay } from "../utils/common.utils"
import { toDateString } from "../utils/datetime.utils"

type SummaryGroupingType = {
  region: string
  articleDate: string
  summaryTexts: string[]
}

export class ArticleSummaryService {
  private chatgptClient: ChatGPTClient
  private feedContentRepo: FeedContentRepository
  private feedRegionSummaryRepo: FeedRegionSummaryRepository
  private promptRepo: FeedPromptRepository

  constructor() {
    this.chatgptClient = new ChatGPTClient()
    this.feedContentRepo = new FeedContentRepository()
    this.feedRegionSummaryRepo = new FeedRegionSummaryRepository()
    this.promptRepo = new FeedPromptRepository()
  }

  async createOneSummaryPerArticleDateAndRegion() {
    console.log("createOneSummaryPerArticleDateAndRegion() called")

    const summaries = await this.createSummariesFromAllArticles()
    const groupedSummaries = this.createGrouping(summaries)

    for (const summary of groupedSummaries) {
      if (summary.articleDate) {
        if (summary.summaryTexts.length === 1) {
          // Already one summary for region and date, save it to db
          console.log(
            `Saving summary for region ${summary.region}: `,
            summary.summaryTexts
          )
          await this.feedRegionSummaryRepo.createSummaryRecord({
            region: summary.region,
            articleDate: summary.articleDate,
            summaryText: summary.summaryTexts[0],
            createdAt: new Date().toISOString(),
          })
        }

        if (summary.summaryTexts.length > 1) {
          // Multiple summaries for region and date, make one summary from multiple by using chatgpt
          const promptRecord =
            await this.promptRepo.getPromptOrFallbackPromptByRegion(
              summary.region
            )

          const singleSummary =
            await this.chatgptClient.completeWithErrorHandling(
              promptRecord.prompt +
                summary.summaryTexts.toString().replace(/\n/g, "")
            )

          console.log(
            `Saving one summary from multiple summaries for region ${summary.region} to table`,
            singleSummary
          )

          await this.feedRegionSummaryRepo.createSummaryRecord({
            region: summary.region,
            articleDate: summary.articleDate,
            summaryText: singleSummary
              ? singleSummary.data.choices[0].text
              : "",
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        console.warn(`article date missing for ${summary.region}`)
      }
    }
  }

  private createGrouping(
    summaries: FeedRegionSummaryRecordType[]
  ): SummaryGroupingType[] {
    console.log("createGrouping() called")
    const groupedObjects: Record<string, SummaryGroupingType> = {}

    for (const summary of summaries) {
      const key = summary.region + summary.articleDate
      if (groupedObjects[key]) {
        groupedObjects[key].summaryTexts.push(summary.summaryText)
      } else {
        groupedObjects[key] = {
          region: summary.region,
          articleDate: summary.articleDate,
          summaryTexts: [summary.summaryText],
        }
      }
    }
    return Object.values(groupedObjects)
  }

  private async createSummariesFromAllArticles(): Promise<
    FeedRegionSummaryRecordType[]
  > {
    console.log("createSummariesFromAllArticles() called")
    const summaries: FeedRegionSummaryRecordType[] = []
    const feedContents = await this.feedContentRepo.getAllFeedContents()

    if (!feedContents || feedContents.length === 0) {
      return summaries
    }

    for (const feedContent of feedContents) {
      let promptRecord =
        await this.promptRepo.getPromptOrFallbackPromptByRegion(
          feedContent.region
        )

      if (feedContent.contentFromFeed) {
        console.log(`Creating summary for ${feedContent.articleLink}`)
        // You are an expert summarizer. Summarize this article for me:
        const summaryText = await this.createSummaryFromContent(
          promptRecord.prompt,
          feedContent.contentFromFeed,
          feedContent.contentFromScraping
        )
        await delay(2000) // Delay it by 2s: Avoid 429 from OpenAI
        if (summaryText) {
          // Push Summary if available
          summaries.push({
            region: feedContent.region,
            articleDate: toDateString(feedContent.articleDate),
            summaryText,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }

    return summaries
  }

  private async createSummaryFromContent(
    prompt: string,
    contentFromFeed: string,
    contentFromScraping?: string
  ): Promise<string | undefined> {
    const fullPrompt = contentFromScraping
      ? `${prompt} ${contentFromScraping}`
      : `${prompt} ${contentFromFeed}`

    let summaryResponse = await this.chatgptClient.completeWithErrorHandling(
      fullPrompt
    )

    if (!summaryResponse) {
      // Try to get summary from using contentFromFeed
      summaryResponse = await this.chatgptClient.completeWithErrorHandling(
        `${prompt} ${contentFromFeed}`
      )
    }

    return summaryResponse?.data?.choices[0]?.text
  }
}
