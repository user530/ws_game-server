export type ExtractType<T, K extends keyof T> = K extends keyof T ? T[K] : never;