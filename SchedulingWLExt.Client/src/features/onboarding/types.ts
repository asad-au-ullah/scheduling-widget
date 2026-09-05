export interface CreateClinicRequest {
    name: string
    slug: string
    primaryColor: string
    secondaryColor: string
    timeZoneId: string
    workdayStart: string   // "HH:mm:ss"
    workdayEnd: string
    slotDurationMinutes: number
}

export interface CreateClinicResponse {
    id: string
    slug: string
    name: string
    bookingUrl: string
    connectCalendarUrl: string
}