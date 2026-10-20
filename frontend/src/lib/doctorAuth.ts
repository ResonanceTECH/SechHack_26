const STORAGE_KEY = 'kk-doctor-auth'

export const DEMO_LOGIN_EMAIL = 'e.smirnova@ravnovesie.ru'
export const DEMO_LOGIN_PASSWORD = 'Clinica2026'

export function isDoctorAuthed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return true
    return raw === '1'
  } catch {
    return true
  }
}

export function setDoctorAuthed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}
