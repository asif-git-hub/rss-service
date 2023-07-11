import { Pool } from "mysql2"
import { mysqlDB, mysqlPool } from "../db/mysql/config/config"
import { CompanyInfo } from "../db/mysql/types/companyinfo.type"
import { wrapElementsWithQuotes } from "../utils/text.utils"
import { getEnvVar } from "../utils/common.utils"

export class CompanyDBRepo {
  private tableName: string

  constructor() {
    this.tableName = getEnvVar("TABLE_NAME")
  }

  private buildFetchQuery(companyNames: string[]): string {
    const normalizedList = wrapElementsWithQuotes(companyNames)
    return `select id, name from ${this.tableName} where name in (${normalizedList});`
  }

  async getCompanyIdsByNames(companyNames: string[]): Promise<CompanyInfo[]> {
    const query = this.buildFetchQuery(companyNames)

    console.log("getCompanyIds() called: ", query)

    try {
      const [rows] = await mysqlPool.query(query)

      console.log("Returning company Ids: ", rows)
      return rows as CompanyInfo[]
    } catch (e) {
      console.log("Database error: ", e)
      return []
    }
  }
}
