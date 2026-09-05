import { createContext, useContext } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchTenantBranding } from './tenantApi'
import type { TenantBranding } from './types'

// ---- Context ----

const TenantContext = createContext<TenantBranding | null>(null)

// ---- Provider ----

interface Props {
    slug: string
    children: React.ReactNode
}

/**
 * Fetches tenant branding via useSuspenseQuery, which means the parent
 * route's pendingComponent shows while loading and errorComponent shows
 * on failure — no manual loading/error state needed here.
 *
 * Also injects CSS custom properties so every child can use
 * var(--brand-primary) etc. without prop drilling.
 */
export function TenantProvider({ slug, children }: Props) {
    const { data: tenant } = useSuspenseQuery({
        queryKey: ['tenant', slug],
        queryFn: () => fetchTenantBranding(slug),
        staleTime: 5 * 60 * 1000, // branding rarely changes — keep for 5 min
    })

    document.title = `Book an appointment · ${tenant.name}`

    const brandVars = {
        '--brand-primary':       tenant.primaryColor,
        '--brand-primary-hover': tenant.primaryColor + 'cc',
        '--brand-secondary':     tenant.secondaryColor,
        '--brand-text':          '#111827',
        '--brand-background':    '#f8fafc',
    } as React.CSSProperties

    return (
        <TenantContext.Provider value={tenant}>
            <div style={brandVars}>
                {children}
            </div>
        </TenantContext.Provider>
    )
}

// ---- Hook ----

export function useTenant(): TenantBranding {
    const ctx = useContext(TenantContext)
    if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>')
    return ctx
}
