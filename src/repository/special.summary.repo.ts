import { DynamoDBClient } from "../aws/dynamodb.client"
import { getEnvVar } from "../utils/common.utils"

export type SpecialSummaryRecordType = {
  role: string // HASH
  regionAndArticleDate: string // SORT
  summaryText: string
  companyNames: string[]
  companyIds: string[]
  createdAt: string
}

export class SpecialSummaryRepository {
  private tableName: string
  private dynamodbClient: DynamoDBClient

  constructor() {
    this.tableName = getEnvVar("FEED_SPECIAL_SUMMARY_TABLE_NAME")
    this.dynamodbClient = new DynamoDBClient()
  }

  async createSpecialSummary(record: SpecialSummaryRecordType) {
    await this.dynamodbClient.put(this.tableName, record)
  }
}
