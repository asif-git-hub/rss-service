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
  reason: string
}
