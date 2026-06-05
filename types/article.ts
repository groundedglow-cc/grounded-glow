import type { Tag } from './tag'

export type ArticleStatus = 0 | 1

export type Article = {
  id: number
  title: string
  summary?: string | null
  content: string
  contentHtml?: string | null
  views: number
  categoryId: number
  userId: number
  createdAt: string
  updatedAt: string
  status: ArticleStatus | 'DRAFT' | 'PUBLISH' | { code?: ArticleStatus; desc?: string }
  deleted?: boolean
  tags: Tag[]
  userName?: string
}

export type ArticleQuery = {
  pageNum?: number
  pageSize?: number
  title?: string
  categoryId?: number
  tagId?: number
  status?: ArticleStatus
}

export type ArticleFormValues = {
  title: string
  summary?: string
  content: string
  categoryId: number
  status: ArticleStatus
  tagIds: number[]
}

