export function splitLongText(
  inputString: string,
  numberOfParts: number
): string[] {
  const stringLength = inputString.length

  if (stringLength < numberOfParts) {
    // Handle the case where the string is too short
    return [inputString]
  }

  const partLength = Math.ceil(stringLength / numberOfParts) // Calculate the length of each part, rounding up

  // Split the string into four parts
  const parts = []
  for (let i = 0; i < stringLength; i += partLength) {
    parts.push(inputString.slice(i, i + partLength))
  }

  return parts
}
