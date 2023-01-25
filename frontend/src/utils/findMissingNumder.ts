export default function findMissingNumber(numbers: number[]): number {
  numbers.sort((a, b) => a - b)
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      return i + 1
    }
  }
  return numbers.length + 1
}
