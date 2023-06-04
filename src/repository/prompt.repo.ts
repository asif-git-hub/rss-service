import { getEnvVar } from "../utils/common.utils"
import { DynamoDBClient } from "../aws/dynamodb.client"

export type FeedPromptRecordType = {
  role: string // HASH
  region: string // SORT
  prompt: string
}

export class FeedPromptRepository {
  private tableName: string
  private dynamodbClient: DynamoDBClient

  constructor() {
    this.tableName = getEnvVar("PROMPT_TABLE_NAME")
    this.dynamodbClient = new DynamoDBClient()
  }

  async getPrompt(
    role: string,
    region: string
  ): Promise<FeedPromptRecordType | undefined> {
    return (await this.dynamodbClient.getByHashAndSortKey(
      this.tableName,
      "role",
      role,
      "region",
      region
    )) as FeedPromptRecordType | undefined
  }

  async getFallbackPrompt(): Promise<FeedPromptRecordType | undefined> {
    return (await this.dynamodbClient.getByHashAndSortKey(
      this.tableName,
      "role",
      "unspecified",
      "region",
      "unspecified"
    )) as FeedPromptRecordType | undefined
  }
}
