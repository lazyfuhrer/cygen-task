import { AxiosError } from 'axios'

export interface ApiError {
  code: string
  message: string
}

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    // Check if it's an axios error with response data
    if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
      const responseData = error.response.data as any
      if (responseData?.error?.message) {
        return responseData.error.message
      }
    }
    return error.message
  }
  return defaultMessage
}

export function getDetailedErrorMessage(error: unknown, defaultMessage: string): { message: string; field?: string } {
  if (error instanceof Error) {
    // Check if it's an axios error with response data
    if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
      const responseData = error.response.data as any
      if (responseData?.error?.code && responseData?.error?.message) {
        const code = responseData.error.code
        const message = responseData.error.message
        
        // Handle specific duplicate error codes
        if (code === 'DUPLICATE_EMAIL') {
          return { message, field: 'email' }
        }
        if (code === 'DUPLICATE_PHONE') {
          return { message, field: 'phone' }
        }
        
        return { message }
      }
    }
    return { message: error.message }
  }
  return { message: defaultMessage }
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof Error && 'response' in error
}
