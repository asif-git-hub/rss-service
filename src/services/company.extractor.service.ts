import { ChatGPTClient } from "../clients/chatgpt.client"
import { CustomChatGPTError } from "../clients/types/chatgpt.client.types"
import { CompanyExtractionType } from "../types/rss.types"
import { getEnvVar } from "../utils/common.utils"
import { splitLongText } from "../utils/text.utils"
import { FeedContentRepository } from "../repository/feedcontent.repo"
import { CompanyDBRepo } from "../repository/companydb.repo"

export type CompanyInfoType = {
  companyNames: string[]
  companyIds: number[]
}

export class CompanyExtractorService {
  private chatgptClient: ChatGPTClient
  private feedContentRepo: FeedContentRepository
  private companydbRepo: CompanyDBRepo
  private extractionPrompt: string

  constructor() {
    this.chatgptClient = new ChatGPTClient()
    this.feedContentRepo = new FeedContentRepository()
    this.companydbRepo = new CompanyDBRepo()
    this.extractionPrompt = getEnvVar("COMPANY_EXTRACTION_PROMPT")
  }

  async getCompaniesFromGPT(
    contentFromFeed: string,
    contentFromScraping?: string
  ): Promise<string[]> {
    try {
      const content = contentFromScraping
        ? contentFromScraping
        : contentFromFeed

      const companies = await this.getCompaniesFromContent(content)

      return companies.companyNames
    } catch (e) {
      console.error(`Unable to get company info!`, e)
      return []
    }
  }

  async updateCompanyInformationInFeedContent(
    feed: string,
    articleLink: string,
    contentFromFeed: string,
    contentFromScraping?: string
  ): Promise<CompanyInfoType> {
    console.log("updateCompanyInformation() called: ", { feed, articleLink })

    const companyNames = await this.getCompaniesFromGPT(
      contentFromFeed,
      contentFromScraping
    )

    const companyInfoFromDB = await this.companydbRepo.getCompanyIdsByNames(
      companyNames
    )

    const companyIds = companyInfoFromDB.map(({ id }) => id)

    console.log(
      `Company names extracted for article ${articleLink}: ${companyNames}`
    )

    await this.feedContentRepo.updateCompanyInfo(feed, articleLink, {
      companiesExtracted: true,
      companyNamesFromGPT: companyNames,
      companyIds,
    })

    return { companyNames, companyIds }
  }

  async getCompaniesFromContent(
    content: string
  ): Promise<CompanyExtractionType> {
    console.log("getCompaniesFromContent() called")

    /* 
        You have all company knowledge. Extract all company names from this article, you must return your response as a JSON with key companyNames:
    */

    const response = await this.chatgptClient.completeWithErrorHandling(
      `${this.extractionPrompt} ${content}`
    )

    if (typeof response === "string") {
      console.log("Company Names from GPT: " + response)
      const companyExtracted: CompanyExtractionType = JSON.parse(response)
      return companyExtracted
    } else {
      console.log("Getting company names by chunks")
      let companies: string[] = []

      if (response.reason === CustomChatGPTError.TOKEN_LIMIT) {
        // Content might be too big, shorten content: Break into 5
        const smallerContents = splitLongText(content, 5)

        for (const smallerContent of smallerContents) {
          const response = await this.chatgptClient.completeWithErrorHandling(
            `${this.extractionPrompt} ${smallerContent}.`
          )
          if (typeof response === "string") {
            try {
              companies = companies.concat(JSON.parse(response).companyNames)
            } catch (e) {
              console.error("Unable to parse response from GPT : ", response)
            }
          }
        }
      }
      console.log("Company Names from GPT: " + response)
      return {
        companyNames: companies,
      }
    }
  }
}
