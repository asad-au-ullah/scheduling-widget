import {
    createRouter,
    createRoute,
    createRootRoute,
    Outlet,
    redirect,
} from '@tanstack/react-router'
import { BookingLayout } from './features/booking/BookingLayout'
import { OnboardingPage } from './features/onboarding/OnboardingPage'

// ---- Shared screens ----

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-400 animate-spin" />
                <p className="text-sm text-gray-400">Loading clinic…</p>
            </div>
        </div>
    )
}

function ErrorScreen({ error }: { error: Error }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-lg font-semibold text-gray-900 mb-2">Clinic not found</h1>
                <p className="text-sm text-gray-500">
                    {error.message || 'This booking link appears to be invalid.'}
                </p>
            </div>
        </div>
    )
}

// ---- Route tree ----

const rootRoute = createRootRoute({ component: Outlet })

// / → redirect to demo clinic in dev
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/$slug', params: { slug: 'paws-downtown-vet' } })
    },
})

// /onboard — clinic self-service setup
const onboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/onboard',
    component: OnboardingPage,
    // TODO: wrap with .beforeLoad auth guard for beta/production
})

// /$slug — booking page per tenant
const slugRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$slug',
    component: BookingLayout,
    pendingComponent: LoadingScreen,
    errorComponent: ({ error }) => <ErrorScreen error={error} />,
})

const routeTree = rootRoute.addChildren([indexRoute, onboardRoute, slugRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}