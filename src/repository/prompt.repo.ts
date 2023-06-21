import { getEnvVar } from "../utils/common.utils"
import { DynamoDBClient } from "../aws/dynamodb.client"

export type FeedPromptRecordType = {
  role: string // HASH
  regionCode: string // SORT
  prompt: string
}

const unspecifiedField = "unspecified"

export class FeedPromptRepository {
  private tableName: string
  private dynamodbClient: DynamoDBClient

  constructor() {
    this.tableName = getEnvVar("PROMPT_TABLE_NAME")
    this.dynamodbClient = new DynamoDBClient()
  }

  async getPrompt(
    role: string,
    regionCode: string
  ): Promise<FeedPromptRecordType | undefined> {
    return (await this.dynamodbClient.getByHashAndSortKey(
      this.tableName,
      "role",
      role,
      "regionCode",
      regionCode
    )) as FeedPromptRecordType | undefined
  }

  async getFallbackPrompt(): Promise<FeedPromptRecordType | undefined> {
    return (await this.dynamodbClient.getByHashAndSortKey(
      this.tableName,
      "role",
      unspecifiedField,
      "regionCode",
      unspecifiedField
    )) as FeedPromptRecordType | undefined
  }

  async getPromptOrFallbackPromptByRegion(
    regionCode: string
  ): Promise<FeedPromptRecordType> {
    let promptRecord = await this.getPrompt(unspecifiedField, regionCode)
    // Check for fallback case
    if (!promptRecord) {
      console.log(
        `Prompt not found for role unspecified and region ${regionCode}. Fetching fallback`
      )

      promptRecord = await this.getFallbackPrompt()

      if (!promptRecord) {
        console.error(
          `Fallback prompt missing from database for region ${regionCode}`
        )
        throw new Error("Fallback prompt missing from database")
      }
    }

    return promptRecord
  }

  async getAllRoleSpecificPrompts(): Promise<
    FeedPromptRecordType[] | undefined
  > {
    const prompts = await this.dynamodbClient.getAll(this.tableName)

    return prompts?.filter((promptRecord) => {
      return (
        (promptRecord["role"] as string) !== unspecifiedField &&
        (promptRecord.regionCode as string) !== unspecifiedField
      )
    }) as FeedPromptRecordType[] | undefined
  }
}
