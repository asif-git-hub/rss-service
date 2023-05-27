import { EnvVarNotFoundError } from "../errors/envvar.notfound.error"

export function getEnvVar(paramName: string): string {
  const value = process.env[paramName]
  if (value) {
    return value
  } else {
    throw new EnvVarNotFoundError(`Environment variable ${paramName} not found`)
  }
}
