export type ApiResult<T> = {
  code: number
  message: string
  data: T
}

export type PageResult<T> = {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

