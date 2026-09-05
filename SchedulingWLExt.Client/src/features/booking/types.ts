export interface TimeSlot {
    start: string   // ISO UTC string
    end: string
    available: boolean
}

export interface AvailabilityResponse {
    date: string
    timeZone: string
    slots: TimeSlot[]
}

export interface BookingRequest {
    tenantSlug: string
    slotStart: string
    slotEnd: string
    petOwnerName: string
    email: string
    phone: string
    petName: string
    reason: string
}

export interface BookingResponse {
    appointmentId: string
    clinicName: string
    slotStart: string
    slotEnd: string
    googleEventId: string
    confirmationMessage: string
}

export interface TenantConfig {
    name: string
    logoUrl: string
    primaryColor: string
}

export interface FormData {
    petOwnerName: string
    email: string
    phone: string
    petName: string
    reason: string
}