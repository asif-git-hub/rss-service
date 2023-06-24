import { EnvVarNotFoundError } from "../errors/envvar.notfound.error"

export function getEnvVar(paramName: string): string {
  const value = process.env[paramName]
  if (value) {
    return value
  } else {
    throw new EnvVarNotFoundError(`Environment variable ${paramName} not found`)
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function removeSpacings(str: string | undefined): string | undefined {
  if (str) {
    if (str.split("\n").length > 1) {
      const firstLine = str.split("\n")[0]

      const cleanedFirstLine = firstLine.replace(/\s/g, "")

      // Remove new lines and tabbed spaces from the remaining string
      const remainingString = str.split("\n").slice(1).join("\n")
      const cleanedRemainingString = remainingString
        .replace(/\n/g, "")
        .replace(/\t/g, "")

      // Concatenate the cleaned first line with the cleaned remaining string
      const cleanedString = cleanedFirstLine + cleanedRemainingString

      return cleanedString.trim()
    } else {
      return str
    }
  }
}
