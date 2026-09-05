import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CalendarPicker } from './components/CalendarPicker'
import { SlotPicker } from './components/SlotPicker'
import { BookingForm } from './components/BookingForm'
import { ConfirmationView } from './components/ConfirmationView'
import { fetchAvailability, createBooking } from './bookingApi'
import { useTenant } from '../tenant/TenantProvider'
import type { TimeSlot, BookingResponse, FormData } from './types'

type Step = 'pick' | 'form' | 'confirmed'

function toDateString(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
}

/**
 * Purely presentational — reads tenant from context, slug from router.
 * No prop drilling. No manual fetch/loading/error state for data fetching.
 */
export function BookingPage() {
    const { slug } = useParams({ from: '/$slug' })
    const branding = useTenant()

    const [step, setStep] = useState<Step>('pick')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [booking, setBooking] = useState<BookingResponse | null>(null)

    // ---- Availability query ----

    const {
        data: availability,
        isFetching: slotsLoading,
        isError: slotsError,
    } = useQuery({
        queryKey: ['availability', slug, selectedDate ? toDateString(selectedDate) : null],
        queryFn: () => fetchAvailability(slug, toDateString(selectedDate!)),
        enabled: selectedDate !== null,
        staleTime: 60 * 1000, // slots valid for 1 min; re-fetch on date change
    })

    const slots = availability?.slots ?? []

    // Reset slot selection when the date changes
    const handleDateSelect = (date: Date) => {
        setSelectedSlot(null)
        setSelectedDate(date)
    }

    // ---- Booking mutation ----

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: data => {
            setBooking(data)
            setStep('confirmed')
        },
    })

    const handleSubmit = async (form: FormData): Promise<void> => {
        if (!selectedSlot) return
        bookingMutation.mutateAsync({
            tenantSlug: slug,
            slotStart: selectedSlot.start,
            slotEnd: selectedSlot.end,
            ...form,
        })
    }

    // ---- Render ----

    const stepIndex = step === 'pick' ? 0 : step === 'form' ? 1 : 2
    const initials = getInitials(branding.name)

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--brand-background)' }}>

            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt={branding.name} className="h-8 w-auto" />
                    ) : (
                        <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            {initials}
                        </div>
                    )}
                    <span className="font-semibold text-gray-900">{branding.name}</span>
                </div>
            </header>

            {/* Booking unavailable banner */}
            {(!branding.calendarConnected || !branding.bookingEnabled) && (
                <div className="bg-amber-50 border-b border-amber-200">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            {!branding.bookingEnabled
                                ? 'Online booking is currently disabled for this clinic.'
                                : 'Online booking is temporarily unavailable while we set up your calendar connection.'}
                        </span>
                    </div>
                </div>
            )}

            {/* Progress */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        {['Select a time', 'Your details', 'Confirmed'].map((label, i) => (
                            <div key={label} className="flex items-center gap-2">
                                {i > 0 && <div className="w-8 h-px bg-slate-200" />}
                                <span style={stepIndex >= i ? { color: 'var(--brand-primary)', fontWeight: 500 } : {}}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main */}
            <main className="flex-1 flex items-start justify-center px-4 py-8">
                <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm">

                    {/* Step 1 — pick date + slot */}
                    {step === 'pick' && (
                        <>
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                <div className="p-6 md:w-72 shrink-0">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
                                        Select a date
                                    </p>
                                    <CalendarPicker selected={selectedDate} onSelect={handleDateSelect} />
                                </div>

                                <div className="flex-1 p-6">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
                                        {selectedDate
                                            ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                            : 'Pick a date to see times'}
                                    </p>
                                    {slotsError && (
                                        <p className="text-sm text-red-500 mb-4">
                                            Could not load availability. Please try again.
                                        </p>
                                    )}
                                    {selectedDate ? (
                                        <SlotPicker
                                            slots={slots}
                                            selected={selectedSlot}
                                            onSelect={setSelectedSlot}
                                            loading={slotsLoading}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-400">Choose a date from the calendar.</p>
                                    )}
                                </div>
                            </div>

                            {selectedSlot && (
                                <div className="border-t border-slate-100 px-6 py-4">
                                    <button
                                        onClick={() => setStep('form')}
                                        style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
                                        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 2 — booking form */}
                    {step === 'form' && selectedSlot && (
                        <div className="p-6 md:p-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Your details</h2>
                            {bookingMutation.isError && (
                                <p className="text-sm text-red-500 mb-4">
                                    {bookingMutation.error instanceof Error
                                        ? bookingMutation.error.message
                                        : 'Something went wrong'}
                                </p>
                            )}
                            <BookingForm
                                slot={selectedSlot}
                                onBack={() => setStep('pick')}
                                onSubmit={handleSubmit}
                                submitting={bookingMutation.isPending}
                            />
                        </div>
                    )}

                    {/* Step 3 — confirmation */}
                    {step === 'confirmed' && booking && (
                        <div className="p-6 md:p-10">
                            <ConfirmationView booking={booking} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
