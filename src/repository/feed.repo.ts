import { DynamoDBClient } from "../aws/dynamodb.client"
import { getEnvVar } from "../utils/common.utils"

export type FeedRecordType = {
  feed: string
  lastFetchedAt?: string
}

export class FeedRepository {
  private dynamodbClient: DynamoDBClient
  private tableName: string

  constructor() {
    this.dynamodbClient = new DynamoDBClient()
    this.tableName = getEnvVar("FEED_TABLE_NAME")
  }

  async getAllFeeds(): Promise<FeedRecordType[] | undefined> {
    const result = await this.dynamodbClient.getAll(this.tableName)

    return result as FeedRecordType[] | undefined
  }

  async updateFetchDate(feed: string) {
    await this.dynamodbClient.put(this.tableName, {
      feed,
      lastFetchedAt: new Date().toISOString(),
    })
  }
}
