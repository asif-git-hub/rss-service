import { SSM } from "aws-sdk"

export class SSMClient {
  private ssmClient
  constructor() {
    this.ssmClient = new SSM()
  }

  async getParameter(parameterName: string) {
    console.log("getParameter() called", parameterName)

    const value = await this.ssmClient
      .getParameter({
        Name: parameterName,
      })
      .promise()

    if (value.Parameter?.Value) {
      return value.Parameter?.Value
    } else {
      throw new Error("Unable to retrieve parameter")
    }
  }
}
