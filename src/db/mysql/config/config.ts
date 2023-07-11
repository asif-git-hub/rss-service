import { createConnection, createPool } from "mysql2"
import { getEnvVar } from "../../../utils/common.utils"

export const mysqlDB = createConnection({
  host: getEnvVar("COMPANY_DB_HOST"),
  user: getEnvVar("DB_USERNAME"),
  password: getEnvVar("DB_PASSWORD"),
  database: getEnvVar("DB_NAME"),
})

export const mysqlPool = createPool({
  host: getEnvVar("COMPANY_DB_HOST"),
  user: getEnvVar("DB_USERNAME"),
  password: getEnvVar("DB_PASSWORD"),
  database: getEnvVar("DB_NAME"),
}).promise()
