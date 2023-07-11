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

export function wrapElementsWithQuotes(inputArray: string[]) {
  // Map over each element in the input array and wrap it with quotes
  const wrappedArray = inputArray.map((element) => `"${element}"`)

  // Join all elements in the wrapped array with a comma separator
  const outputString = wrappedArray.join(", ")

  return outputString
}
