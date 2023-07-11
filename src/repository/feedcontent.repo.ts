import { DynamoDBClient } from "../aws/dynamodb.client"
import { getEnvVar } from "../utils/common.utils"

export type FeedContentRecordType = {
  feed: string // HASH
  articleDate: string
  title: string
  regionCode: string
  articleLink: string // SORT
  contentFromFeed: string
  contentFromScraping?: string
  companyNamesFromGPT?: string[]
  companyIds?: number[]
  companiesExtracted?: boolean
  savedAt: string
}

export class FeedContentRepository {
  private dynamodbClient: DynamoDBClient
  private tableName: string

  constructor() {
    this.dynamodbClient = new DynamoDBClient()
    this.tableName = getEnvVar("FEED_CONTENT_TABLE_NAME")
  }

  async insertSingleContent(item: FeedContentRecordType) {
    await this.dynamodbClient.put(this.tableName, item)
  }

  async getAllFeedContents(): Promise<FeedContentRecordType[]> {
    return (await this.dynamodbClient.getAll(
      this.tableName
    )) as unknown as FeedContentRecordType[]
  }

  async updateCompanyInfo<T>(
    feed: string,
    articleLink: string,
    fieldsToUpdate: Partial<FeedContentRecordType>
  ) {
    await this.dynamodbClient.updateRecord(
      this.tableName,
      { feed, articleLink },
      fieldsToUpdate
    )
  }
}
