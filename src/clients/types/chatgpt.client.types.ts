export type ChatGPTResponseType = {
  choices: Array<ChoiceType>
}

type ChoiceType = {
  text: string
  index: number
}

export type ChatGPTMessageType = {
  role: "assistant" | "user" | "system"
  content: string
}

export type ChatGPTCustomErrorType = {
  response: undefined
  reason: CustomChatGPTError
}

export enum CustomChatGPTError {
  TOKEN_LIMIT = "TOKEN_LIMIT",
  RATE_LIMIT = "RATE_LIMIT",
  UNKNOWN = "UNKNOWN"
}