import { api } from '../../lib/api'
import type { TenantBranding } from './types'

export const fetchTenantBranding = (slug: string): Promise<TenantBranding> =>
    api.get<TenantBranding>(`/api/tenants/${encodeURIComponent(slug)}`)
