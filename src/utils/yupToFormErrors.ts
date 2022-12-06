export default function yupToFormErrors({ inner }: any = {}) {
  return inner?.reduce?.((acc = {}, { path, message }) => {
    return {
      ...acc,
      [path || '']: message,
    }
  }, {})
}
