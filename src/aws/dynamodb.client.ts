import { DynamoDB } from "aws-sdk"
import { AttributeMap } from "aws-sdk/clients/dynamodb"

export class DynamoDBClient {
  private dynamodb: DynamoDB.DocumentClient

  constructor() {
    this.dynamodb = new DynamoDB.DocumentClient()
  }

  async put<T>(table: string, item: Record<string, T>) {
    return await this.dynamodb
      .put({
        Item: item,
        TableName: table,
      })
      .promise()
  }

  async getByHashKey(tableName: string, hashkey: string, value: string) {
    const result = await this.dynamodb
      .get({
        TableName: tableName,
        Key: {
          [hashkey]: value,
        },
      })
      .promise()
    return result.Item
  }

  async getByHashAndSortKey(
    tableName: string,
    hashkey: string,
    hashkeyvalue: string,
    sortkey: string,
    sortkeyValue: string | number
  ) {
    const result = await this.dynamodb
      .get({
        TableName: tableName,
        Key: {
          [hashkey]: hashkeyvalue,
          [sortkey]: sortkeyValue,
        },
      })
      .promise()

    return result.Item
  }

  async getByKey(tableName: string, key: string, value: string) {
    const params = {
      KeyConditionExpression: `${key} = :${key}`,
      ExpressionAttributeValues: {
        [`:${key}`]: value,
      },
      TableName: tableName,
    }
    const result = await this.dynamodb.query(params).promise()
    return result.Items
  }

  async getAll(tableName: string): Promise<AttributeMap[] | undefined> {
    const result = await this.dynamodb
      .scan({
        TableName: tableName,
      })
      .promise()

    return result.Items
  }

  async updateOneField<T>(
    tableName: string,
    keyItem: Record<string, T>,
    updateField: Record<string, T>
  ) {
    const fieldToUpdate = Object.keys(updateField)[0]

    await this.dynamodb
      .update({
        TableName: tableName,
        Key: keyItem,
        UpdateExpression: `set ${fieldToUpdate} = :x`,
        ExpressionAttributeValues: {
          ":x": updateField[fieldToUpdate],
        },
      })
      .promise()
  }

  async updateRecord<T, U>(
    tableName: string,
    keyItem: Record<string, T>,
    fieldsToUpdate: Record<string, U>
  ) {
    let updateExpression = "set "
    let expressionAttributeValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap =
      {}
    const updateKeys = Object.keys(fieldsToUpdate)

    for (const key of updateKeys) {
      updateExpression = updateExpression.concat(`${key} = :${key}, `)
      const value = fieldsToUpdate[key as keyof typeof fieldsToUpdate]

      expressionAttributeValues[`:${key}`] = value
    }

    await this.dynamodb
      .update({
        TableName: tableName,
        Key: keyItem,
        UpdateExpression: updateExpression.slice(0, -2),
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise()
  }
}
