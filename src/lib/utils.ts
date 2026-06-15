import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid'

/** Tailwind CSS 类名合并（shadcn/ui 标准工具） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 生成唯一 ID */
export function generateId(): string {
  return uuidv4()
}

/** 生成当前时间 ISO 字符串 */
export function now(): string {
  return new Date().toISOString()
}

/** 默认图片滤镜值 */
export const defaultFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}
