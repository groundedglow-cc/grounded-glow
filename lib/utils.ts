import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function toStatusCode(status: unknown): 0 | 1 {
  if (status === 1 || status === 'PUBLISH') return 1
  return 0
}

export function statusLabel(status: unknown) {
  return toStatusCode(status) === 1 ? '已发布' : '草稿'
}

