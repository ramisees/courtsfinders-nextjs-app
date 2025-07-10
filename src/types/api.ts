// API error types for better error handling
export interface APIError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

export interface APIResponse<T> {
  data?: T
  error?: APIError
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface BookingResponse {
  success: boolean
  bookingId?: string
  message?: string
  booking?: {
    id: string
    courtId: string
    userId: string
    date: string
    startTime: string
    endTime: string
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    createdAt: string
  }
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role?: string
  }
  expiresIn?: number
}