'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import { register as registerUser } from '@/features/auth/api'
import { registerSchema } from '@/features/auth/schemas'

type FormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('注册成功，请登录')
      router.push(`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-md items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建账号后即可发布和管理文章</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Field label="用户名" error={form.formState.errors.username?.message}>
              <Input {...form.register('username')} autoComplete="username" />
            </Field>
            <Field label="邮箱" error={form.formState.errors.email?.message}>
              <Input {...form.register('email')} type="email" autoComplete="email" />
            </Field>
            <Field label="密码" error={form.formState.errors.password?.message}>
              <Input {...form.register('password')} type="password" autoComplete="new-password" />
            </Field>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '注册中...' : '注册'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号？
              <Link className="text-primary hover:underline" href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
                去登录
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
