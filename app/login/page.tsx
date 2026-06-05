'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/features/auth/api'
import { loginSchema } from '@/features/auth/schemas'
import { storeLogin } from '@/lib/auth-store'
import { isTrustedRedirect } from '@/lib/redirect'

type FormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const redirect = searchParams.get('redirect')

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { account: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      storeLogin(data)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('登录成功')
      if (redirect && isTrustedRedirect(redirect)) {
        window.location.href = redirect
      } else {
        router.push('/dashboard/articles')
      }
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>使用用户名或邮箱进入写作后台</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="用户名或邮箱" error={form.formState.errors.account?.message}>
              <Input {...form.register('account')} autoComplete="username" />
            </Field>
            <Field label="密码" error={form.formState.errors.password?.message}>
              <Input {...form.register('password')} type="password" autoComplete="current-password" />
            </Field>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '登录中...' : '登录'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              还没有账号？
              <Link className="text-primary hover:underline" href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
                去注册
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
