import { ChatGPTClient } from "../clients/chatgpt.client"
import { FeedContentRepository } from "../repository/feedcontent.repo"
import { FeedPromptRepository } from "../repository/prompt.repo"
import {
  FeedRegionSummaryRecordType,
  FeedRegionSummaryRepository,
} from "../repository/region.summary.repo"
import { toDateString } from "../utils/datetime.utils"
import { ChatGPTCustomErrorType } from "../clients/types/chatgpt.client.types"
import { splitLongText } from "../utils/text.utils"
import { getEnvVar } from "../utils/common.utils"

type SummaryGroupingType = {
  regionCode: string
  articleDate: string
  summaryTexts: string[]
}

export class RegionSummaryService {
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
            `Saving summary for region ${summary.regionCode} and articleDate: ${summary.articleDate}. Summary: ${summary.summaryTexts[0]}`,
            
          )
          await this.feedRegionSummaryRepo.createSummaryRecord({
            regionCode: summary.regionCode,
            articleDate: summary.articleDate,
            summaryText: summary.summaryTexts[0],
            createdAt: new Date().toISOString(),
          })
        }

        if (summary.summaryTexts.length > 1) {
          // Multiple summaries for region and date, make one summary from multiple by using chatgpt

          const promptRecord =
            await this.promptRepo.getPromptOrFallbackPromptByRegion(
              summary.regionCode
            )

          const singleSummary = await this.performRollingSummarization(
            summary.summaryTexts,
            promptRecord.prompt
          )

          console.log(
            `Saving one summary from multiple summaries for region: ${summary.regionCode} and articleDate: ${summary.articleDate}. Summary: ${singleSummary}`
          )

          await this.feedRegionSummaryRepo.createSummaryRecord({
            regionCode: summary.regionCode,
            articleDate: summary.articleDate,
            summaryText: singleSummary,
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        console.error(`article date missing for ${summary.regionCode}`)
      }
    }
  }

  private createGrouping(
    summaries: FeedRegionSummaryRecordType[]
  ): SummaryGroupingType[] {
    console.log("createGrouping() called")
    const groupedObjects: Record<string, SummaryGroupingType> = {}

    for (const summary of summaries) {
      const key = summary.regionCode + summary.articleDate
      if (groupedObjects[key]) {
        groupedObjects[key].summaryTexts.push(summary.summaryText)
      } else {
        groupedObjects[key] = {
          regionCode: summary.regionCode,
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
      return summaries // Empty
    }

    for (const feedContent of feedContents) {
      let promptRecord =
        await this.promptRepo.getPromptOrFallbackPromptByRegion(
          feedContent.regionCode
        )

      if (feedContent.contentFromFeed) {
        console.log(`Creating summary for ${feedContent.articleLink}`)
        // You are an expert summarizer. Summarize this article for me:
        const summaryText = await this.createSummaryFromContent(
          promptRecord.prompt,
          feedContent.contentFromFeed,
          feedContent.contentFromScraping
        )

        if (summaryText) {
          // Push Summary if available
          console.log(
            `Summary text formed for article: ${feedContent.articleLink} : `,
            summaryText
          )
          summaries.push({
            regionCode: feedContent.regionCode,
            articleDate: toDateString(feedContent.articleDate),
            summaryText,
            createdAt: new Date().toISOString(),
          })
        } else {
          console.warn(
            `Summary text not formed for article: ${feedContent.articleLink}`
          )
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
    /* Create summary from either content from feed or content from web scraiping */
    const fullPrompt = contentFromScraping
      ? `${prompt} ${contentFromScraping}`
      : `${prompt} ${contentFromFeed}`

    // Try with web scraping content
    let summaryResponse = await this.chatgptClient.completeWithErrorHandling(
      fullPrompt
    )

    if (typeof summaryResponse === "string") {
      // Successful summary creation from web scraped content
      return summaryResponse
    } else {
      // Handle token limit
      if (summaryResponse.reason === "TOKEN_LIMIT" && contentFromScraping) {
        console.warn(
          "Token limit hit for prompt. Attempting to shorten contentFromScraping"
        )
        // Attempt to cut down web scraped content

        const shortenedContentFromScraping = await this.shortenText(
          contentFromScraping
        )

        summaryResponse = await this.chatgptClient.completeWithErrorHandling(
          `${prompt} ${shortenedContentFromScraping}`
        )
      }
    }
    if (!summaryResponse || typeof summaryResponse !== "string") {
      // If contentFromScraping too large (even after shortening), try to get summary from using contentFromFeed
      console.log(
        "Unable to create summary from contentFromScraping, trying with contentFromFeed"
      )
      summaryResponse = await this.chatgptClient.completeWithErrorHandling(
        `${prompt} ${contentFromFeed}`
      )
    }

    return summaryResponse as string
  }

  private async shortenText(content: string): Promise<string | undefined> {
    console.log("shortenText() called with: ", content)

    const contentParts = splitLongText(content, 4) // Break into 4

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

  private async performRollingSummarization(
    summaries: string[],
    prompt: string
  ): Promise<string> {
    console.log(
      `performRollingSummarization() called with ${summaries.length} summaries`
    )

    let singleSummary

    // If more than two summaries, use rolling summarization
    for (let i = 0; i < summaries.length - 1; i++) {
      if (i === 0) {
        singleSummary = await this.chatgptClient.completeWithErrorHandling(
          `${prompt} ${summaries[i]} ${summaries[i + 1]}`
        )
      } else {
        singleSummary = await this.chatgptClient.completeWithErrorHandling(
          `${prompt} ${singleSummary} ${summaries[i + 1]}`
        )
      }
      console.log(`Iteration ${i} summary: ${singleSummary}. =======`)
    }

    console.log(`performRollingSummarization() finished: ${singleSummary} =======`)

    if (singleSummary && typeof singleSummary === "string") {
      return singleSummary
    } else {
      console.warn(
        "Unable to form a single summary using performRollingSummarization()"
      )
      return ""
    }
  }
}
