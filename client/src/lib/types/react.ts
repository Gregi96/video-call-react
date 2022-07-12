export type SetState<T> = (fn: ((prev: T) => T) | T) => void
