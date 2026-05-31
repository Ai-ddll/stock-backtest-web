import axios from 'axios'
import type { ApiResponse } from '../types'

const client = axios.create({
  baseURL: '',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>
    if (body.code !== 0) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return response
  },
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? '网络错误'
    return Promise.reject(new Error(message))
  },
)

export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await client.get<ApiResponse<T>>(url, { params })
  return data.data
}

export async function postData<T, B = unknown>(url: string, body: B): Promise<T> {
  const { data } = await client.post<ApiResponse<T>>(url, body)
  return data.data
}

export async function uploadFile<T>(url: string, file: File, fieldName = 'file'): Promise<T> {
  const formData = new FormData()
  formData.append(fieldName, file)
  const { data } = await client.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
  return data.data
}

export async function uploadFiles<T>(
  url: string,
  files: File[],
  fieldName = 'files',
): Promise<T> {
  const formData = new FormData()
  files.forEach((file) => formData.append(fieldName, file))
  const { data } = await client.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
  })
  return data.data
}

export default client
