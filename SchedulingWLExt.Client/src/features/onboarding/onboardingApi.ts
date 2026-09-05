import { api } from '../../lib/api'
import type { CreateClinicRequest, CreateClinicResponse } from './types'

export const createClinic = (data: CreateClinicRequest): Promise<CreateClinicResponse> =>
    api.post<CreateClinicResponse>('/api/onboarding', data)