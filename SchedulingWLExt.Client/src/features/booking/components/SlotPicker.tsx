import type { TimeSlot } from '../types'

interface Props {
    slots: TimeSlot[]
    selected: TimeSlot | null
    onSelect: (slot: TimeSlot) => void
    loading: boolean
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
}

export function SlotPicker({ slots, selected, onSelect, loading }: Props) {
    const now = new Date()
    const available = slots.filter(s => s.available && new Date(s.start) > now)

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                ))}
            </div>
        )
    }

    if (available.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-8">
                No slots available for this date.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-90 pr-1">
            {available.map(slot => {
                const isSelected = selected?.start === slot.start
                return (
                    <button
                        key={slot.start}
                        onClick={() => onSelect(slot)}
                        style={isSelected
                            ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: '#ffffff' }
                            : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#374151' }
                        }
                        className={`w-full py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-150 ${isSelected ? '' : 'hover:border-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary)]'}`}
                    >
                        {formatTime(slot.start)}
                    </button>
                )
            })}
        </div>
    )
}