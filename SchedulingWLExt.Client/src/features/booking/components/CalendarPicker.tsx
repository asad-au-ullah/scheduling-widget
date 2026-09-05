import React from 'react'

interface Props {
    selected: Date | null
    onSelect: (date: Date) => void
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarPicker({ selected, onSelect }: Props) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [viewYear, setViewYear] = React.useState(today.getFullYear())
    const [viewMonth, setViewMonth] = React.useState(today.getMonth())

    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const isSelected = (day: number) =>
        selected?.getFullYear() === viewYear &&
        selected?.getMonth() === viewMonth &&
        selected?.getDate() === day

    const isPast = (day: number) => new Date(viewYear, viewMonth, day) < today

    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-gray-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm font-semibold text-gray-900">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-gray-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) =>
                    day === null ? <div key={`e-${i}`} /> : (
                        <button
                            key={day}
                            onClick={() => !isPast(day) && onSelect(new Date(viewYear, viewMonth, day))}
                            disabled={isPast(day)}
                            style={isSelected(day)
                                ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff' }
                                : isPast(day)
                                    ? { color: '#d1d5db', cursor: 'not-allowed' }
                                    : {}}
                            className="mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors text-gray-700 hover:bg-slate-100"
                        >
                            {day}
                        </button>
                    )
                )}
            </div>
        </div>
    )
}