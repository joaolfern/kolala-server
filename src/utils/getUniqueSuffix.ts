export default function getUniqueSuffix () {
  return Date.now() + '-' + Math.round(Math.random() * 1e9)
}
