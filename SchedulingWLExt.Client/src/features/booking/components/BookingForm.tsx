import { useState } from 'react'
import type { TimeSlot, FormData } from '../types'

// interface FormData {
//     petOwnerName: string
//     email: string
//     phone: string
//     petName: string
//     reason: string
// }

interface Props {
    slot: TimeSlot
    onBack: () => void
    onSubmit: (data: FormData) => Promise<void>
    submitting: boolean
}

function formatSlot(slot: TimeSlot): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const start = new Date(slot.start)
    const end = new Date(slot.end)
    const date = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz })
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz })
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz })
    return `${date} · ${startTime} – ${endTime}`
}

const REASONS = ['Annual checkup', 'Vaccination', 'Illness or injury', 'Follow-up visit', 'Dental cleaning', 'Other']

const inputClass =
    'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 ' +
    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow'

export function BookingForm({ slot, onBack, onSubmit, submitting }: Props) {
    const [form, setForm] = useState<FormData>({
        petOwnerName: '', email: '', phone: '', petName: '', reason: REASONS[0],
    })

    const set = (field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }))

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Slot summary */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg border"
                style={{ backgroundColor: '#f0f9ff', borderColor: '#e0f2fe' }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: '#0ea5e9' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: '#0369a1' }}>{formatSlot(slot)}</span>
            </div>

            <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">Your name</label>
                        <input className={inputClass} placeholder="Jane Smith" value={form.petOwnerName} onChange={set('petOwnerName')} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">Pet's name</label>
                        <input className={inputClass} placeholder="Max" value={form.petName} onChange={set('petName')} required />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Email</label>
                    <input type="email" className={inputClass} placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Phone</label>
                    <input type="tel" className={inputClass} placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} required />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Reason for visit</label>
                    <select className={inputClass} value={form.reason} onChange={set('reason')}>
                        {REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff', opacity: submitting ? 0.6 : 1 }}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    >
                        {submitting ? 'Confirming…' : 'Confirm booking'}
                    </button>
                </div>
            </form>
        </div>
    )
}