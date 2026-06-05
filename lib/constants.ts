export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8081')
export const AUTH_TOKEN_KEY = 'light_blog_token'
export const AUTH_USER_KEY = 'light_blog_user'
export const TRUSTED_REDIRECT_HOSTS = ['localhost', 'groundedglow.cc']
