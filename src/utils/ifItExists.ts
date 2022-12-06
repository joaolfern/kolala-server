export function ifItExists<T>(props: T): (fn: Function) => T {
  return fn => (typeof props === 'undefined' || String(props) === '' ? undefined : fn(props))
}

export function ifNumberExists <T> (props: T) {
  return ifItExists(props)(Number)
}
