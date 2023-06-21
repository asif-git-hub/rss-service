import { DynamoDBClient } from "../aws/dynamodb.client"
import { getEnvVar } from "../utils/common.utils"

export type FeedRegionSummaryRecordType = {
  regionCode: string // HASH
  articleDate: string // SORT
  summaryText: string
  createdAt: string
}

export class FeedRegionSummaryRepository {
  private tableName: string
  private dynamodbClient: DynamoDBClient

  constructor() {
    this.tableName = getEnvVar("FEED_REGION_SUMMARY_TABLE_NAME")
    this.dynamodbClient = new DynamoDBClient()
  }

  async createSummaryRecord(record: FeedRegionSummaryRecordType) {
    await this.dynamodbClient.put(this.tableName, record)
  }

  async getFeedContentByRegion(
    regionCode: string
  ): Promise<FeedRegionSummaryRecordType[] | undefined> {
    return (await this.dynamodbClient.getByKey(
      this.tableName,
      "regionCode",
      regionCode
    )) as FeedRegionSummaryRecordType[] | undefined
  }
}
