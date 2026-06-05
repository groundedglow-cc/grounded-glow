import { z } from 'zod'

export const loginSchema = z.object({
  account: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符').max(20, '用户名最多 20 个字符'),
  email: z.string().email('请输入正确的邮箱'),
  password: z.string().min(6, '密码至少 6 位').max(50, '密码最多 50 位'),
})

