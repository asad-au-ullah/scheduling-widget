import type { BookingResponse } from '../types'

interface Props {
    booking: BookingResponse
}

function formatSlot(start: string, end: string): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const s = new Date(start)
    const e = new Date(end)

    const date = s.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: tz
    })
    const startTime = s.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz
    })
    const endTime = e.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz
    })

    return `${date} · ${startTime} – ${endTime}`
}

export function ConfirmationView({ booking }: Props) {
    return (
        <div className="flex flex-col items-center text-center py-4">
            {/* Check icon */}
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">You're booked</h2>
            <p className="text-sm text-gray-500 mb-6">
                A calendar invite has been sent to your email.
            </p>

            {/* Booking details card */}
            <div className="w-full max-w-sm border border-slate-200 rounded-xl p-5 text-left space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Clinic</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.clinicName}</p>
                </div>
                <div className="border-t border-slate-100" />
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Date & time</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {formatSlot(booking.slotStart, booking.slotEnd)}
                    </p>
                </div>
                <div className="border-t border-slate-100" />
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Booking ID</p>
                    <p className="text-xs text-gray-500 font-mono">{booking.appointmentId}</p>
                </div>
            </div>
        </div>
    )
}