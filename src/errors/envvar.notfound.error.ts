export class EnvVarNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, EnvVarNotFoundError.prototype)
    this.name = "EnvVarNotFoundError"
  }
}
