export function newQuestionId() {
  // Short readable ID like Q-1234
  const n = Math.floor(1000 + Math.random() * 9000)
  return `Q-${n}`
}
