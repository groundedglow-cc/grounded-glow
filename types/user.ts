export type User = {
  id: number
  username: string
  email: string
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}

export type LoginRequest = {
  account: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
}

export type LoginResponse = User & {
  token: string
}

