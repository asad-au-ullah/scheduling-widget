import { useParams } from '@tanstack/react-router'
import { TenantProvider } from '../tenant/TenantProvider'
import { BookingPage } from './BookingPage'

/**
 * Route component for /$slug.
 *
 * Reads the slug from the router (fully typed — no casting needed),
 * wraps with TenantProvider, and renders BookingPage.
 *
 * Loading and error states are handled at the route level in router.tsx
 * via pendingComponent / errorComponent, so this component only renders
 * when the tenant is successfully loaded.
 */
export function BookingLayout() {
    const { slug } = useParams({ from: '/$slug' })

    return (
        <TenantProvider slug={slug}>
            <BookingPage />
        </TenantProvider>
    )
}
