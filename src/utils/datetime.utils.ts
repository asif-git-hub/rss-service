export function toDateString(datetime: string): string {
  try {
    return new Date(datetime).toISOString()
  } catch (e) {
    console.warn("Unable to parse datetime string", datetime)
    return datetime
  }
}
