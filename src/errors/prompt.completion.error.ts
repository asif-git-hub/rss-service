export class PromptCompletionError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, PromptCompletionError.prototype)
    this.name = "PromptCompletionError"
  }
}
