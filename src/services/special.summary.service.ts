import { ChatGPTClient } from "../clients/chatgpt.client"
import { FeedPromptRepository } from "../repository/prompt.repo"
import { FeedRegionSummaryRepository } from "../repository/region.summary.repo"
import { SpecialSummaryRepository } from "../repository/special.summary.repo"

export class SpecialSummaryService {
  private chatgptClient: ChatGPTClient
  private specialSummaryRepo: SpecialSummaryRepository
  private promptRepo: FeedPromptRepository
  private regionSummaryRepo: FeedRegionSummaryRepository

  constructor() {
    this.chatgptClient = new ChatGPTClient()
    this.specialSummaryRepo = new SpecialSummaryRepository()
    this.promptRepo = new FeedPromptRepository()
    this.regionSummaryRepo = new FeedRegionSummaryRepository()
  }

  async createAllSummaries() {
    // Get all prompts
    const promptRecords = await this.promptRepo.getAllRoleSpecificPrompts()

    if (!promptRecords || promptRecords.length === 0) {
      console.log("No prompts found with a role and region")
      return
    }

    for (const promptRecord of promptRecords) {
      // Loop through all prompts that have role and region
      const summariesByRegion =
        await this.regionSummaryRepo.getFeedContentByRegion(
          promptRecord.regionCode
        )

      if (summariesByRegion && summariesByRegion.length > 0) {
        for (const summaryRecord of summariesByRegion) {
          // Loop through all summaries and create special summary
          const fullPrompt = `Act as a ${promptRecord.role}. ${promptRecord.prompt}: ${summaryRecord.summaryText}`
          const summaryResponse =
            await this.chatgptClient.completeWithErrorHandling(fullPrompt)

          console.log(
            `SPECIALSUMMARY :: Saving special summary for ${promptRecord.regionCode}-${summaryRecord.articleDate} and role ${promptRecord.role}`
          )

          await this.specialSummaryRepo.createSpecialSummary({
            role: promptRecord.role,
            regionAndArticleDate: `${promptRecord.regionCode}-${summaryRecord.articleDate}`,
            summaryText:
              typeof summaryResponse === "string" ? summaryResponse : "",
            companyNamesFromGPT: summaryRecord.companyNamesFromGPT,
            articleLinksUsed: summaryRecord.articleLinksUsed,
            companyIds: summaryRecord.companyIds,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }
  }
}
