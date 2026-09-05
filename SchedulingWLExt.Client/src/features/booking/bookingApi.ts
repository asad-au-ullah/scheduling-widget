import { api } from '../../lib/api'
import type { AvailabilityResponse, BookingRequest, BookingResponse } from './types'

export const fetchAvailability = (tenantSlug: string, date: string): Promise<AvailabilityResponse> =>
    api.get<AvailabilityResponse>(`/availability?tenantSlug=${tenantSlug}&date=${date}`)

export const createBooking = (payload: BookingRequest): Promise<BookingResponse> =>
    api.post<BookingResponse>('/bookings', payload)
