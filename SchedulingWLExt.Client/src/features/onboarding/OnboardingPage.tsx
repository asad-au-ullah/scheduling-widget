import { useState } from 'react'
import { createClinic } from './onboardingApi'
import type { CreateClinicRequest, CreateClinicResponse } from './types'

type Step = 'details' | 'hours' | 'connect' | 'done'

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:3000'
const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://localhost:7024'

const TIMEZONES = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Pakistan Standard Time (PKT)', value: 'Pakistan Standard Time' },
    { label: 'Eastern Time (US)', value: 'Eastern Standard Time' },
    { label: 'Central Time (US)', value: 'Central Standard Time' },
    { label: 'Mountain Time (US)', value: 'Mountain Standard Time' },
    { label: 'Pacific Time (US)', value: 'Pacific Standard Time' },
    { label: 'Greenwich Mean Time (UK)', value: 'GMT Standard Time' },
    { label: 'Central European Time', value: 'Central Europe Standard Time' },
]

const SLOT_DURATIONS = [15, 20, 30, 45, 60]

const inputClass =
    'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 ' +
    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ' +
    'focus:border-transparent transition-shadow bg-white'

const labelClass = 'text-xs font-medium text-gray-600 mb-1.5 block'

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
}

// ── Step 1: Clinic Details ────────────────────────────────────────────────────

interface DetailsData {
    name: string
    slug: string
    primaryColor: string
    secondaryColor: string
}

function StepDetails({
    data, onChange, onNext,
}: {
    data: DetailsData
    onChange: (d: DetailsData) => void
    onNext: () => void
}) {
    const [slugTouched, setSlugTouched] = useState(false)

    const set = (field: keyof DetailsData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = field === 'slug' ? slugify(e.target.value) : e.target.value
        const updated = { ...data, [field]: value }

        // Auto-generate slug from name until user manually edits it
        if (field === 'name' && !slugTouched) {
            updated.slug = slugify(e.target.value)
        }
        if (field === 'slug') setSlugTouched(true)

        onChange(updated)
    }

    const valid = data.name.trim().length > 0 && data.slug.length > 0

    return (
        <div className="flex flex-col gap-5">
            <div>
                <label className={labelClass}>Clinic name</label>
                <input
                    className={inputClass}
                    placeholder="Paws Downtown Veterinary"
                    value={data.name}
                    onChange={set('name')}
                />
            </div>

            <div>
                <label className={labelClass}>Booking URL slug</label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-500">
                    <span className="px-3 py-2.5 bg-slate-50 text-sm text-gray-400 border-r border-slate-200 whitespace-nowrap">
                        yourapp.com/
                    </span>
                    <input
                        className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none bg-white"
                        placeholder="paws-downtown-vet"
                        value={data.slug}
                        onChange={set('slug')}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Lowercase letters, numbers, and hyphens only
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Primary color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={data.primaryColor}
                            onChange={set('primaryColor')}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <input
                            className={inputClass}
                            value={data.primaryColor}
                            onChange={set('primaryColor')}
                            placeholder="#2563EB"
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Secondary color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={data.secondaryColor}
                            onChange={set('secondaryColor')}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <input
                            className={inputClass}
                            value={data.secondaryColor}
                            onChange={set('secondaryColor')}
                            placeholder="#EFF6FF"
                        />
                    </div>
                </div>
            </div>

            {/* Live preview */}
            <div
                className="rounded-lg p-4 border"
                style={{ backgroundColor: data.secondaryColor, borderColor: data.primaryColor + '40' }}
            >
                <p className="text-xs font-medium mb-1" style={{ color: data.primaryColor }}>
                    Preview
                </p>
                <p className="text-sm font-semibold text-gray-900">{data.name || 'Your Clinic Name'}</p>
                <button
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: data.primaryColor }}
                >
                    Book appointment
                </button>
            </div>

            <button
                onClick={onNext}
                disabled={!valid}
                style={{ backgroundColor: valid ? '#0ea5e9' : '#e2e8f0', color: valid ? '#fff' : '#94a3b8' }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
                Continue →
            </button>
        </div>
    )
}

// ── Step 2: Working Hours ─────────────────────────────────────────────────────

interface HoursData {
    timeZoneId: string
    workdayStart: string
    workdayEnd: string
    slotDurationMinutes: number
}

function StepHours({
    data, onChange, onNext, onBack,
}: {
    data: HoursData
    onChange: (d: HoursData) => void
    onNext: () => void
    onBack: () => void
}) {
    const set = (field: keyof HoursData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => onChange({ ...data, [field]: field === 'slotDurationMinutes' ? Number(e.target.value) : e.target.value })

    return (
        <div className="flex flex-col gap-5">
            <div>
                <label className={labelClass}>Timezone</label>
                <select className={inputClass} value={data.timeZoneId} onChange={set('timeZoneId')}>
                    {TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Opening time</label>
                    <input
                        type="time"
                        className={inputClass}
                        value={data.workdayStart.slice(0, 5)}
                        onChange={e => onChange({ ...data, workdayStart: e.target.value + ':00' })}
                    />
                </div>
                <div>
                    <label className={labelClass}>Closing time</label>
                    <input
                        type="time"
                        className={inputClass}
                        value={data.workdayEnd.slice(0, 5)}
                        onChange={e => onChange({ ...data, workdayEnd: e.target.value + ':00' })}
                    />
                </div>
            </div>

            <div>
                <label className={labelClass}>Appointment slot duration</label>
                <select
                    className={inputClass}
                    value={data.slotDurationMinutes}
                    onChange={set('slotDurationMinutes')}
                >
                    {SLOT_DURATIONS.map(d => (
                        <option key={d} value={d}>{d} minutes</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-50 transition-colors">
                    Back
                </button>
                <button
                    onClick={onNext}
                    style={{ backgroundColor: '#0ea5e9', color: '#fff' }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                >
                    Continue →
                </button>
            </div>
        </div>
    )
}

// ── Step 3: Connect Google Calendar ──────────────────────────────────────────

function StepConnect({ slug, onBack }: { slug: string; onBack: () => void }) {
    return (
        <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="#0ea5e9" strokeWidth="1.5" />
                    <path d="M3 9h18" stroke="#0ea5e9" strokeWidth="1.5" />
                    <path d="M8 2v4M16 2v4" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Connect Google Calendar</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Your clinic's appointments will sync with Google Calendar. Pet owners can book available slots in real time.
                </p>
            </div>

            <a
                href={`${API_BASE}/auth/connect?tenantSlug=${slug}&returnUrl=${encodeURIComponent(APP_URL + '/onboard?step=done&slug=' + slug)}`}
                style={{ backgroundColor: '#0ea5e9', color: '#fff' }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
            >
                Connect Google Calendar
            </a>

            <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Back
            </button>
        </div>
    )
}

// ── Step 4: Done ──────────────────────────────────────────────────────────────

function StepDone({ result }: { result: CreateClinicResponse }) {
    return (
        <div className="flex flex-col items-center text-center gap-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {result.name} is live!
                </h3>
                <p className="text-sm text-gray-500">Your booking page is ready to share.</p>
            </div>

            <div className="w-full border border-slate-200 rounded-xl p-4 text-left space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Booking page</p>
                    <a
                        href={result.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-sky-600 hover:underline"
                    >
                        {window.location.origin}{result.bookingUrl}
                    </a>
                </div>
                <div className="border-t border-slate-100" />
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Google Calendar
                    </p>
                    <a
                        href={`${API_BASE}${result.connectCalendarUrl}`}
                        className="text-sm font-medium text-sky-600 hover:underline"
                    >
                        Connect now →
                    </a>
                </div>
            </div>

            <a
                href={result.bookingUrl}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: '#0ea5e9', color: '#fff' }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
            >
                View booking page
            </a>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const STEPS: Step[] = ['details', 'hours', 'connect', 'done']
const STEP_LABELS = ['Clinic details', 'Working hours', 'Calendar', 'Done']

export function OnboardingPage() {
    const searchParams = new URLSearchParams(window.location.search)
    const initialStep = searchParams.get('step') === 'done' ? 'done' : 'details'
    const returnedSlug = searchParams.get('slug') ?? ''

    const [step, setStep] = useState<Step>(initialStep as Step)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<CreateClinicResponse | null>(
        initialStep === 'done' && returnedSlug
            ? { id: '', slug: returnedSlug, name: returnedSlug, bookingUrl: '/' + returnedSlug, connectCalendarUrl: '/auth/connect?tenantSlug=' + returnedSlug }
            : null
    )

    const [details, setDetails] = useState<DetailsData>({
        name: '',
        slug: '',
        primaryColor: '#2563EB',
        secondaryColor: '#EFF6FF',
    })

    const [hours, setHours] = useState<HoursData>({
        timeZoneId: 'Pakistan Standard Time',
        workdayStart: '09:00:00',
        workdayEnd: '17:00:00',
        slotDurationMinutes: 30,
    })

    const handleCreate = async () => {
        setSubmitting(true)
        setError(null)
        try {
            const payload: CreateClinicRequest = {
                name: details.name,
                slug: details.slug,
                primaryColor: details.primaryColor,
                secondaryColor: details.secondaryColor,
                timeZoneId: hours.timeZoneId,
                workdayStart: hours.workdayStart,
                workdayEnd: hours.workdayEnd,
                slotDurationMinutes: hours.slotDurationMinutes,
            }
            const res = await createClinic(payload)
            setResult(res)
            setStep('connect')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const stepIndex = STEPS.indexOf(step)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <span className="font-semibold text-gray-900 text-sm">SchedulingWL</span>
                    <span className="text-gray-400 text-sm"> · Clinic setup</span>
                </div>
            </header>

            {/* Progress */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        {STEP_LABELS.map((label, i) => (
                            <div key={label} className="flex items-center gap-2">
                                {i > 0 && <div className="w-6 h-px bg-slate-200" />}
                                <span style={stepIndex >= i ? { color: '#0284c7', fontWeight: 500 } : {}}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 flex items-start justify-center px-4 py-8">
                <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {STEP_LABELS[stepIndex]}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {step === 'details' && (
                        <StepDetails
                            data={details}
                            onChange={setDetails}
                            onNext={() => setStep('hours')}
                        />
                    )}

                    {step === 'hours' && (
                        <StepHours
                            data={hours}
                            onChange={setHours}
                            onBack={() => setStep('details')}
                            onNext={async () => {
                                await handleCreate()
                            }}
                        />
                    )}

                    {step === 'connect' && result && (
                        <StepConnect
                            slug={result.slug}
                            onBack={() => setStep('hours')}
                        />
                    )}

                    {step === 'done' && result && (
                        <StepDone result={result} />
                    )}

                    {submitting && (
                        <div className="mt-4 flex justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}