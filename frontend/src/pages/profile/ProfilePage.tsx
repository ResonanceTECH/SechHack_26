import {
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from 'react'
import { useOutletContext } from 'react-router-dom'
import { DiscardChangesModal } from '@/components/DiscardChangesModal/DiscardChangesModal'
import { EndSessionsModal } from '@/components/EndSessionsModal/EndSessionsModal'
import { IconShield, IconTick } from '@/components/icons/NavIcons'
import { doctorProfile as initialProfile } from '@/data/mockDoctor'
import {
  formatRuPhone,
  isRuPhoneComplete,
  parseRuNationalDigits,
} from '@/lib/ruPhone'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { DoctorProfile, ProfileTabId } from '@/types/doctor'
import styles from './ProfilePage.module.css'

const tabs: Array<{ id: ProfileTabId; label: string }> = [
  { id: 'personal', label: 'Личные данные' },
  { id: 'security', label: 'Безопасность' },
  { id: 'notifications', label: 'Уведомления' },
]

type ProfilePanel =
  | 'view'
  | 'edit'
  | 'email'
  | 'emailConfirm'
  | 'phone'
  | 'phoneConfirm'
  | 'password'

type ProfileForm = {
  lastName: string
  firstName: string
  middleName: string
  about: string
}

type EmailForm = {
  email: string
  password: string
}

type PhoneForm = {
  phoneDigits: string
  password: string
}

type PasswordForm = {
  current: string
  next: string
  confirm: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEMO_PASSWORD = 'Clinica2026'
const DEMO_NEW_PASSWORD = 'NewClinica2026'
const DEMO_OTP_CODE = '482631'
const DEMO_PHONE_OK = '9165551234'
const DEMO_PHONE_SHORT = '916555'

const PASSWORD_OK: PasswordForm = {
  current: DEMO_PASSWORD,
  next: DEMO_NEW_PASSWORD,
  confirm: DEMO_NEW_PASSWORD,
}

const PASSWORD_BAD_CURRENT: PasswordForm = {
  current: 'wrong-password',
  next: DEMO_NEW_PASSWORD,
  confirm: DEMO_NEW_PASSWORD,
}

const PASSWORD_MISMATCH: PasswordForm = {
  current: DEMO_PASSWORD,
  next: DEMO_NEW_PASSWORD,
  confirm: 'DifferentPass12',
}

const EMAIL_OK: EmailForm = {
  email: 'e.smirnova.new@ravnovesie.ru',
  password: DEMO_PASSWORD,
}

const EMAIL_BAD_PASSWORD: EmailForm = {
  email: 'e.smirnova.new@ravnovesie.ru',
  password: 'wrong-password',
}

const EMAIL_BAD_FORMAT: EmailForm = {
  email: 'e.smirnova.new',
  password: DEMO_PASSWORD,
}

const PHONE_OK: PhoneForm = {
  phoneDigits: DEMO_PHONE_OK,
  password: DEMO_PASSWORD,
}

const PHONE_BAD_PASSWORD: PhoneForm = {
  phoneDigits: DEMO_PHONE_OK,
  password: 'wrong-password',
}

const PHONE_INCOMPLETE: PhoneForm = {
  phoneDigits: DEMO_PHONE_SHORT,
  password: DEMO_PASSWORD,
}

const EXAMPLE_FORM: ProfileForm = {
  lastName: 'Смирнова',
  firstName: 'Елена',
  middleName: 'Сергеевна',
  about: 'Организационные вопросы по приёму — через рабочую почту.',
}

function toForm(profile: DoctorProfile): ProfileForm {
  return {
    lastName: profile.lastName,
    firstName: profile.firstName,
    middleName: profile.middleName,
    about: profile.about,
  }
}

function formsEqual(a: ProfileForm, b: ProfileForm): boolean {
  return (
    a.lastName === b.lastName &&
    a.firstName === b.firstName &&
    a.middleName === b.middleName &&
    a.about === b.about
  )
}

function applyForm(profile: DoctorProfile, form: ProfileForm): DoctorProfile {
  const fullName = [form.lastName, form.firstName, form.middleName]
    .filter(Boolean)
    .join(' ')
  const shortName = `${form.lastName} ${form.firstName.charAt(0)}. ${form.middleName.charAt(0)}.`.trim()
  const initials =
    `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase() ||
    profile.initials

  return {
    ...profile,
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim(),
    about: form.about.trim(),
    fullName,
    shortName,
    initials,
  }
}

export function ProfilePage() {
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [tab, setTab] = useState<ProfileTabId>('personal')
  const [panel, setPanel] = useState<ProfilePanel>('view')
  const [profile, setProfile] = useState(initialProfile)
  const [form, setForm] = useState<ProfileForm>(() => toForm(initialProfile))
  const [showErrors, setShowErrors] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<ProfileTabId | null>(null)
  const [emailForm, setEmailForm] = useState<EmailForm>({
    email: '',
    password: '',
  })
  const [emailErrors, setEmailErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [pendingEmail, setPendingEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailCodeError, setEmailCodeError] = useState<string | null>(null)
  const [codeExpired, setCodeExpired] = useState(false)
  const [phoneForm, setPhoneForm] = useState<PhoneForm>({
    phoneDigits: '',
    password: '',
  })
  const [phoneErrors, setPhoneErrors] = useState<{
    phone?: string
    password?: string
  }>({})
  const [pendingPhone, setPendingPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneCodeError, setPhoneCodeError] = useState<string | null>(null)
  const [phoneCodeExpired, setPhoneCodeExpired] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string
    next?: string
    confirm?: string
  }>({})

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Кабинет врача', to: '/' },
      { label: 'Личный кабинет' },
    ])
    return () => setBreadcrumbs(null)
  }, [setBreadcrumbs])

  const baseline = useMemo(() => toForm(profile), [profile])
  const dirty = panel === 'edit' && !formsEqual(form, baseline)

  const lastNameError = showErrors && form.lastName.trim() === ''
  const firstNameError = showErrors && form.firstName.trim() === ''

  function startEdit() {
    setForm(toForm(profile))
    setShowErrors(false)
    setPanel('edit')
  }

  function startChangeEmail() {
    setEmailForm({ email: '', password: '' })
    setEmailErrors({})
    setPendingEmail('')
    setEmailCode('')
    setEmailCodeError(null)
    setCodeExpired(false)
    setPanel('email')
  }

  function resetEmailFlow() {
    setEmailForm({ email: '', password: '' })
    setEmailErrors({})
    setPendingEmail('')
    setEmailCode('')
    setEmailCodeError(null)
    setCodeExpired(false)
    setPanel('view')
  }

  function discardAndExit() {
    setForm(toForm(profile))
    setShowErrors(false)
    setPanel('view')
    setDiscardOpen(false)
    if (pendingTab) {
      setTab(pendingTab)
      setPendingTab(null)
    }
  }

  function requestCancel() {
    if (dirty) {
      setPendingTab(null)
      setDiscardOpen(true)
      return
    }
    discardAndExit()
  }

  function continueEditing() {
    setDiscardOpen(false)
    setPendingTab(null)
  }

  function saveEdit() {
    if (form.lastName.trim() === '' || form.firstName.trim() === '') {
      setShowErrors(true)
      return
    }
    setProfile(applyForm(profile, form))
    setShowErrors(false)
    setPanel('view')
    setDiscardOpen(false)
    setPendingTab(null)
  }

  function fillExample() {
    setForm(EXAMPLE_FORM)
    setShowErrors(false)
  }

  function showEmptyLastName() {
    setForm((prev) => ({ ...prev, lastName: '' }))
    setShowErrors(true)
  }

  function updateField<K extends keyof ProfileForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateEmailForm(next: EmailForm = emailForm) {
    const errors: { email?: string; password?: string } = {}
    if (!EMAIL_RE.test(next.email.trim())) {
      errors.email = 'Укажите корректный e-mail'
    } else if (
      next.email.trim().toLowerCase() === profile.email.trim().toLowerCase()
    ) {
      errors.email = 'Новый e-mail совпадает с текущим'
    }
    if (next.password.trim() === '') {
      errors.password = 'Введите текущий пароль'
    } else if (next.password !== DEMO_PASSWORD) {
      errors.password = 'Неверный текущий пароль'
    }
    return errors
  }

  function submitEmailChange() {
    const errors = validateEmailForm()
    setEmailErrors(errors)
    if (Object.keys(errors).length > 0) return
    setPendingEmail(emailForm.email.trim())
    setEmailCode('')
    setEmailCodeError(null)
    setCodeExpired(false)
    setPanel('emailConfirm')
  }

  function cancelEmailChange() {
    resetEmailFlow()
  }

  function normalizeCode(raw: string) {
    return raw.replace(/\D/g, '')
  }

  function formatCodeDisplay(raw: string) {
    const digits = normalizeCode(raw).slice(0, 6)
    if (digits.length <= 3) return digits
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  }

  function confirmEmailCode() {
    const digits = normalizeCode(emailCode)
    if (codeExpired) {
      setEmailCodeError('Код устарел. Запросите новый.')
      return
    }
    if (digits.length !== 6) {
      setEmailCodeError('Введите 6-значный код из письма')
      return
    }
    if (digits !== DEMO_OTP_CODE) {
      setEmailCodeError('Неверный код')
      return
    }
    setProfile((prev) => ({ ...prev, email: pendingEmail }))
    resetEmailFlow()
  }

  function resendEmailCode() {
    setEmailCode('')
    setEmailCodeError(null)
    setCodeExpired(false)
  }

  function fillCodeScenario(kind: 'wrong' | 'expired' | 'ok') {
    if (kind === 'wrong') {
      setEmailCode(formatCodeDisplay('111111'))
      setCodeExpired(false)
      setEmailCodeError('Неверный код')
      return
    }
    if (kind === 'expired') {
      setEmailCode(formatCodeDisplay(DEMO_OTP_CODE))
      setCodeExpired(true)
      setEmailCodeError('Код устарел. Запросите новый.')
      return
    }
    setEmailCode(formatCodeDisplay(DEMO_OTP_CODE))
    setCodeExpired(false)
    setEmailCodeError(null)
  }

  function fillEmailScenario(kind: 'badPassword' | 'badEmail' | 'ok') {
    const next =
      kind === 'badPassword'
        ? EMAIL_BAD_PASSWORD
        : kind === 'badEmail'
          ? EMAIL_BAD_FORMAT
          : EMAIL_OK
    setEmailForm(next)
    setEmailErrors(kind === 'ok' ? {} : validateEmailForm(next))
  }

  function startChangePhone() {
    setPhoneForm({ phoneDigits: '', password: '' })
    setPhoneErrors({})
    setPendingPhone('')
    setPhoneCode('')
    setPhoneCodeError(null)
    setPhoneCodeExpired(false)
    setPanel('phone')
  }

  function resetPhoneFlow() {
    setPhoneForm({ phoneDigits: '', password: '' })
    setPhoneErrors({})
    setPendingPhone('')
    setPhoneCode('')
    setPhoneCodeError(null)
    setPhoneCodeExpired(false)
    setPanel('view')
  }

  function validatePhoneForm(next: PhoneForm = phoneForm) {
    const errors: { phone?: string; password?: string } = {}
    if (!isRuPhoneComplete(next.phoneDigits)) {
      errors.phone = 'Введите полный номер телефона'
    } else if (formatRuPhone(next.phoneDigits) === profile.phone) {
      errors.phone = 'Новый номер совпадает с текущим'
    }
    if (next.password.trim() === '') {
      errors.password = 'Введите текущий пароль'
    } else if (next.password !== DEMO_PASSWORD) {
      errors.password = 'Неверный текущий пароль'
    }
    return errors
  }

  function submitPhoneChange() {
    const errors = validatePhoneForm()
    setPhoneErrors(errors)
    if (Object.keys(errors).length > 0) return
    setPendingPhone(formatRuPhone(phoneForm.phoneDigits))
    setPhoneCode('')
    setPhoneCodeError(null)
    setPhoneCodeExpired(false)
    setPanel('phoneConfirm')
  }

  function confirmPhoneCode() {
    const digits = normalizeCode(phoneCode)
    if (phoneCodeExpired) {
      setPhoneCodeError('Код устарел. Запросите новый.')
      return
    }
    if (digits.length !== 6) {
      setPhoneCodeError('Введите 6-значный код из SMS')
      return
    }
    if (digits !== DEMO_OTP_CODE) {
      setPhoneCodeError('Неверный код')
      return
    }
    setProfile((prev) => ({ ...prev, phone: pendingPhone }))
    resetPhoneFlow()
  }

  function resendPhoneCode() {
    setPhoneCode('')
    setPhoneCodeError(null)
    setPhoneCodeExpired(false)
  }

  function fillPhoneCodeScenario(kind: 'wrong' | 'expired' | 'ok') {
    if (kind === 'wrong') {
      setPhoneCode(formatCodeDisplay('111111'))
      setPhoneCodeExpired(false)
      setPhoneCodeError('Неверный код')
      return
    }
    if (kind === 'expired') {
      setPhoneCode(formatCodeDisplay(DEMO_OTP_CODE))
      setPhoneCodeExpired(true)
      setPhoneCodeError('Код устарел. Запросите новый.')
      return
    }
    setPhoneCode(formatCodeDisplay(DEMO_OTP_CODE))
    setPhoneCodeExpired(false)
    setPhoneCodeError(null)
  }

  function fillPhoneScenario(
    kind: 'badPassword' | 'incomplete' | 'ok',
  ) {
    const next =
      kind === 'badPassword'
        ? PHONE_BAD_PASSWORD
        : kind === 'incomplete'
          ? PHONE_INCOMPLETE
          : PHONE_OK
    setPhoneForm(next)
    setPhoneErrors(kind === 'ok' ? {} : validatePhoneForm(next))
  }

  function startChangePassword() {
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
    setTab('security')
    setPanel('password')
  }

  function resetPasswordFlow() {
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
    setPanel('view')
  }

  function validatePasswordForm(next: PasswordForm = passwordForm) {
    const errors: { current?: string; next?: string; confirm?: string } = {}
    if (next.current.trim() === '') {
      errors.current = 'Введите текущий пароль'
    } else if (next.current !== DEMO_PASSWORD) {
      errors.current = 'Неверный текущий пароль'
    }
    if (next.next.trim() === '') {
      errors.next = 'Введите новый пароль'
    } else if (next.next.length < 12) {
      errors.next = 'Не менее 12 символов'
    } else if (next.next === DEMO_PASSWORD) {
      errors.next = 'Новый пароль должен отличаться от текущего'
    }
    if (next.confirm.trim() === '') {
      errors.confirm = 'Повторите новый пароль'
    } else if (next.confirm !== next.next) {
      errors.confirm = 'Пароли не совпадают'
    }
    return errors
  }

  function submitPasswordChange() {
    const errors = validatePasswordForm()
    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return
    resetPasswordFlow()
  }

  function fillPasswordScenario(
    kind: 'badCurrent' | 'mismatch' | 'ok',
  ) {
    const next =
      kind === 'badCurrent'
        ? PASSWORD_BAD_CURRENT
        : kind === 'mismatch'
          ? PASSWORD_MISMATCH
          : PASSWORD_OK
    setPasswordForm(next)
    setPasswordErrors(kind === 'ok' ? {} : validatePasswordForm(next))
  }

  function selectTab(next: ProfileTabId) {
    if (next === tab && panel === 'view') return
    if (panel === 'edit' && dirty && next !== 'personal') {
      setPendingTab(next)
      setDiscardOpen(true)
      return
    }
    setTab(next)
    if (next !== 'personal' || panel === 'password') setPanel('view')
  }

  const title =
    panel === 'password'
      ? 'Изменить пароль'
      : tab === 'security'
        ? 'Безопасность аккаунта'
        : tab === 'notifications'
          ? 'Уведомления'
          : panel === 'edit'
            ? 'Редактировать личные данные'
            : panel === 'email'
              ? 'Изменить e-mail'
              : panel === 'emailConfirm'
                ? 'Подтвердите новый e-mail'
                : panel === 'phone'
                  ? 'Изменить номер телефона'
                  : panel === 'phoneConfirm'
                    ? 'Подтвердите новый телефон'
                    : 'Личный кабинет'

  const subtitle =
    panel === 'password'
      ? 'Новый пароль начнёт действовать после сохранения'
      : tab === 'security'
        ? 'Пароль, уведомления о входе и активные сеансы'
        : tab === 'notifications'
          ? 'Какие события отправлять на подтверждённую рабочую почту'
          : panel === 'edit'
            ? 'Изменения появятся в профиле после сохранения'
            : panel === 'email'
              ? 'Подтвердите изменение контакта, который используется для входа'
              : panel === 'emailConfirm'
                ? 'Отправили код на новый адрес электронной почты'
                : panel === 'phone'
                  ? 'Подтвердите новый номер телефона для связи и уведомлений безопасности'
                  : panel === 'phoneConfirm'
                    ? 'Отправили код в SMS на новый номер телефона'
                    : 'Ваш профиль, контакты и настройки аккаунта'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Разделы профиля">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? styles.tabActive : styles.tab}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'personal' ? (
        panel === 'edit' ? (
          <EditPersonalTab
            form={form}
            lastNameError={lastNameError}
            firstNameError={firstNameError}
            onChange={updateField}
            onSave={saveEdit}
            onCancel={requestCancel}
            onFillExample={fillExample}
            onShowEmptyLastName={showEmptyLastName}
          />
        ) : panel === 'email' ? (
          <ChangeEmailTab
            currentEmail={profile.email}
            form={emailForm}
            errors={emailErrors}
            onChange={(key, value) =>
              setEmailForm((prev) => ({ ...prev, [key]: value }))
            }
            onSubmit={submitEmailChange}
            onCancel={cancelEmailChange}
            onScenario={fillEmailScenario}
          />
        ) : panel === 'emailConfirm' ? (
          <ConfirmEmailTab
            pendingEmail={pendingEmail}
            code={emailCode}
            error={emailCodeError}
            onCodeChange={(value) => {
              setEmailCode(formatCodeDisplay(value))
              setEmailCodeError(null)
              setCodeExpired(false)
            }}
            onConfirm={confirmEmailCode}
            onResend={resendEmailCode}
            onCancel={resetEmailFlow}
            onScenario={fillCodeScenario}
          />
        ) : panel === 'phone' ? (
          <ChangePhoneTab
            currentPhone={profile.phone}
            form={phoneForm}
            errors={phoneErrors}
            onChange={(key, value) =>
              setPhoneForm((prev) => ({ ...prev, [key]: value }))
            }
            onSubmit={submitPhoneChange}
            onCancel={resetPhoneFlow}
            onScenario={fillPhoneScenario}
          />
        ) : panel === 'phoneConfirm' ? (
          <ConfirmPhoneTab
            pendingPhone={pendingPhone}
            code={phoneCode}
            error={phoneCodeError}
            onCodeChange={(value) => {
              setPhoneCode(formatCodeDisplay(value))
              setPhoneCodeError(null)
              setPhoneCodeExpired(false)
            }}
            onConfirm={confirmPhoneCode}
            onResend={resendPhoneCode}
            onCancel={resetPhoneFlow}
            onScenario={fillPhoneCodeScenario}
          />
        ) : (
          <PersonalTab
            profile={profile}
            onEdit={startEdit}
            onChangeEmail={startChangeEmail}
            onChangePhone={startChangePhone}
          />
        )
      ) : tab === 'security' ? (
        panel === 'password' ? (
          <ChangePasswordTab
            form={passwordForm}
            errors={passwordErrors}
            onChange={(key, value) =>
              setPasswordForm((prev) => ({ ...prev, [key]: value }))
            }
            onSubmit={submitPasswordChange}
            onCancel={resetPasswordFlow}
            onScenario={fillPasswordScenario}
          />
        ) : (
          <SecurityTab onChangePassword={startChangePassword} />
        )
      ) : (
        <NotificationsTab />
      )}

      <DiscardChangesModal
        open={discardOpen}
        onContinue={continueEditing}
        onDiscard={discardAndExit}
      />
    </div>
  )
}

function PersonalTab({
  profile,
  onEdit,
  onChangeEmail,
  onChangePhone,
}: {
  profile: DoctorProfile
  onEdit: () => void
  onChangeEmail: () => void
  onChangePhone: () => void
}) {
  return (
    <div className={styles.grid}>
      <div className={styles.colMain}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>Личные данные</h3>
            <button type="button" className={styles.btnEdit} onClick={onEdit}>
              Редактировать
            </button>
          </div>

          <div className={styles.identity}>
            <div className={styles.avatarLarge} aria-hidden>
              {profile.initials}
            </div>
            <div className={styles.identityMeta}>
              <div className={styles.identityName}>{profile.fullName}</div>
              <div className={styles.identityHint}>
                ФИО для отображения в аккаунте
              </div>
            </div>
          </div>

          <div className={styles.nameGrid}>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Фамилия</div>
              <div className={styles.fieldValue}>{profile.lastName}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Имя</div>
              <div className={styles.fieldValue}>{profile.firstName}</div>
            </div>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Отчество</div>
              <div className={styles.fieldValue}>{profile.middleName}</div>
            </div>
          </div>

          <div className={styles.about}>
            <div className={styles.fieldLabel}>О себе</div>
            <p className={styles.aboutText}>{profile.about}</p>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Контакты для входа и связи</h3>

          <div className={styles.contactList}>
            <div className={styles.contactRow}>
              <div className={styles.contactMeta}>
                <div className={styles.fieldLabel}>E-mail</div>
                <div className={styles.fieldValue}>{profile.email}</div>
              </div>
              <button
                type="button"
                className={styles.btnChange}
                onClick={onChangeEmail}
              >
                Изменить
              </button>
            </div>
            <div className={styles.contactRow}>
              <div className={styles.contactMeta}>
                <div className={styles.fieldLabel}>Телефон</div>
                <div className={styles.fieldValue}>{profile.phone}</div>
              </div>
              <button
                type="button"
                className={styles.btnChange}
                onClick={onChangePhone}
              >
                Изменить
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className={styles.colSide}>
        <section className={`${styles.card} ${styles.proCard}`}>
          <h3 className={styles.cardTitle}>Профессиональный профиль</h3>

          {profile.verifiedByClinic ? (
            <div className={styles.verifiedBadge}>
              <span className={styles.verifiedIcon} aria-hidden>
                <IconTick size={14} strokeWidth={2.25} />
              </span>
              Подтверждён клиникой
            </div>
          ) : null}

          <div className={styles.proBlock}>
            <div className={styles.fieldLabel}>Подтверждённая роль</div>
            <div className={styles.fieldValue}>{profile.specialty}</div>
          </div>

          <div className={styles.proBlock}>
            <div className={styles.fieldLabel}>Клиника</div>
            <div className={styles.fieldValue}>{profile.clinicName}</div>
          </div>

          <div className={styles.proBlock}>
            <div className={styles.fieldLabel}>Специальность</div>
            <div className={styles.fieldValue}>
              {profile.specialtyLabel} · Аккредитация действительна до{' '}
              {profile.accreditationUntil}
            </div>
          </div>

          <div className={styles.infoBox}>
            <span className={styles.infoIcon} aria-hidden>
              <IconShield size={18} />
            </span>
            <p className={styles.infoText}>
              Профессиональные права и доступ к клиническим данным управляются
              через клинику. Изменение ФИО в аккаунте не меняет подтверждённые
              клинические реквизиты.
            </p>
          </div>

          {profile.prescriptionContourConfirmed ? (
            <p className={styles.proFooter}>Рецептурный контур · подтверждён</p>
          ) : null}
        </section>
      </aside>
    </div>
  )
}

function EditPersonalTab({
  form,
  lastNameError,
  firstNameError,
  onChange,
  onSave,
  onCancel,
  onFillExample,
  onShowEmptyLastName,
}: {
  form: ProfileForm
  lastNameError: boolean
  firstNameError: boolean
  onChange: <K extends keyof ProfileForm>(key: K, value: string) => void
  onSave: () => void
  onCancel: () => void
  onFillExample: () => void
  onShowEmptyLastName: () => void
}) {
  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSave()
        }}
      >
        <h3 className={styles.cardTitle}>ФИО</h3>

        <div className={styles.formNameGrid}>
          <label className={styles.formField}>
            <span className={styles.formLabel}>
              Фамилия <span className={styles.req}>*</span>
            </span>
            <input
              className={
                lastNameError ? `${styles.input} ${styles.inputError}` : styles.input
              }
              value={form.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              autoComplete="family-name"
              aria-invalid={lastNameError || undefined}
              aria-describedby={lastNameError ? 'lastName-error' : undefined}
            />
            {lastNameError ? (
              <span id="lastName-error" className={styles.fieldError}>
                Укажите фамилию
              </span>
            ) : null}
          </label>

          <label className={styles.formField}>
            <span className={styles.formLabel}>
              Имя <span className={styles.req}>*</span>
            </span>
            <input
              className={
                firstNameError
                  ? `${styles.input} ${styles.inputError}`
                  : styles.input
              }
              value={form.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              autoComplete="given-name"
              aria-invalid={firstNameError || undefined}
              aria-describedby={firstNameError ? 'firstName-error' : undefined}
            />
            {firstNameError ? (
              <span id="firstName-error" className={styles.fieldError}>
                Укажите имя
              </span>
            ) : null}
          </label>

          <label className={styles.formField}>
            <span className={styles.formLabel}>Отчество</span>
            <input
              className={styles.input}
              value={form.middleName}
              onChange={(e) => onChange('middleName', e.target.value)}
              autoComplete="additional-name"
            />
          </label>
        </div>

        <label className={styles.formField}>
          <span className={styles.formLabel}>О себе</span>
          <textarea
            className={styles.textarea}
            value={form.about}
            onChange={(e) => onChange('about', e.target.value)}
            rows={4}
          />
          <span className={styles.formHint}>
            Не указывайте здесь сведения о пациентах
          </span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Сохранить изменения
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>Что можно изменить</div>
            <p className={styles.hintText}>
              Здесь редактируются ФИО и описание. Телефон и e-mail меняются
              отдельно — с подтверждением.
            </p>
          </div>
        </div>

        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>Документы и роли</div>
            <p className={styles.hintText}>
              Изменение документов, специальности и роли проходит через
              администратора клиники.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Эти кнопки только для демо: быстро подставить сценарий и проверить
            валидацию формы.
          </p>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={onFillExample}
          >
            Заполнить пример изменений
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={onShowEmptyLastName}
          >
            Показать пустую фамилию
          </button>
        </section>
      </aside>
    </div>
  )
}

function ChangePhoneTab({
  currentPhone,
  form,
  errors,
  onChange,
  onSubmit,
  onCancel,
  onScenario,
}: {
  currentPhone: string
  form: PhoneForm
  errors: { phone?: string; password?: string }
  onChange: <K extends keyof PhoneForm>(key: K, value: string) => void
  onSubmit: () => void
  onCancel: () => void
  onScenario: (kind: 'badPassword' | 'incomplete' | 'ok') => void
}) {
  const phoneDisplay = formatRuPhone(form.phoneDigits)

  const onPhoneInput = (e: FormEvent<HTMLInputElement>) => {
    onChange('phoneDigits', parseRuNationalDigits(e.currentTarget.value))
  }

  const onPhonePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    onChange('phoneDigits', parseRuNationalDigits(e.clipboardData.getData('text')))
  }

  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <h3 className={styles.cardTitle}>Новый телефон</h3>

        <div className={styles.currentContact}>
          <div className={styles.fieldLabel}>Текущий подтверждённый телефон</div>
          <div className={styles.fieldValue}>{currentPhone}</div>
        </div>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            Новый номер телефона <span className={styles.req}>*</span>
          </span>
          <input
            type="tel"
            className={
              errors.phone ? `${styles.input} ${styles.inputError}` : styles.input
            }
            value={phoneDisplay}
            placeholder="+7 (916) 555-12-34"
            onInput={onPhoneInput}
            onPaste={onPhonePaste}
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone ? (
            <span id="phone-error" className={styles.fieldError}>
              {errors.phone}
            </span>
          ) : null}
        </label>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            Текущий пароль <span className={styles.req}>*</span>
          </span>
          <input
            type="password"
            className={
              errors.password
                ? `${styles.input} ${styles.inputError}`
                : styles.input
            }
            value={form.password}
            onChange={(e) => onChange('password', e.target.value)}
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? 'phone-password-error phone-password-hint' : 'phone-password-hint'
            }
          />
          {errors.password ? (
            <span id="phone-password-error" className={styles.fieldError}>
              {errors.password}
            </span>
          ) : null}
          <span id="phone-password-hint" className={styles.formHint}>
            Для изменения контакта нужно подтвердить текущий пароль.
          </span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Получить код подтверждения
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>
              До подтверждения контакт не меняется
            </div>
            <p className={styles.hintText}>
              Старый номер остаётся привязанным, пока вы не подтвердите новый
              код из SMS.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Кнопки ниже подставляют сценарии: ошибка пароля, неполный номер или
            корректное заполнение.
          </p>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('badPassword')}
          >
            Неверный текущий пароль
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('incomplete')}
          >
            Неполный номер
          </button>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={() => onScenario('ok')}
          >
            Корректное заполнение
          </button>
        </section>
      </aside>
    </div>
  )
}

function ChangeEmailTab({
  currentEmail,
  form,
  errors,
  onChange,
  onSubmit,
  onCancel,
  onScenario,
}: {
  currentEmail: string
  form: EmailForm
  errors: { email?: string; password?: string }
  onChange: <K extends keyof EmailForm>(key: K, value: string) => void
  onSubmit: () => void
  onCancel: () => void
  onScenario: (kind: 'badPassword' | 'badEmail' | 'ok') => void
}) {
  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <h3 className={styles.cardTitle}>Новый e-mail</h3>

        <div className={styles.currentContact}>
          <div className={styles.fieldLabel}>Текущий подтверждённый e-mail</div>
          <div className={styles.fieldValue}>{currentEmail}</div>
        </div>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            Новый e-mail <span className={styles.req}>*</span>
          </span>
          <input
            type="email"
            className={
              errors.email ? `${styles.input} ${styles.inputError}` : styles.input
            }
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email ? (
            <span id="email-error" className={styles.fieldError}>
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            Текущий пароль <span className={styles.req}>*</span>
          </span>
          <input
            type="password"
            className={
              errors.password
                ? `${styles.input} ${styles.inputError}`
                : styles.input
            }
            value={form.password}
            onChange={(e) => onChange('password', e.target.value)}
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? 'password-error password-hint' : 'password-hint'
            }
          />
          {errors.password ? (
            <span id="password-error" className={styles.fieldError}>
              {errors.password}
            </span>
          ) : null}
          <span id="password-hint" className={styles.formHint}>
            Для изменения контакта нужно подтвердить текущий пароль.
          </span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Получить код подтверждения
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>
              До подтверждения контакт не меняется
            </div>
            <p className={styles.hintText}>
              Старый e-mail остаётся активным для входа, пока вы не подтвердите
              новый код из письма.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Кнопки ниже подставляют сценарии: ошибка пароля, некорректный
            e-mail или корректное заполнение.
          </p>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('badPassword')}
          >
            Неверный текущий пароль
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('badEmail')}
          >
            Некорректный e-mail
          </button>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={() => onScenario('ok')}
          >
            Корректное заполнение
          </button>
        </section>
      </aside>
    </div>
  )
}

function ConfirmPhoneTab({
  pendingPhone,
  code,
  error,
  onCodeChange,
  onConfirm,
  onResend,
  onCancel,
  onScenario,
}: {
  pendingPhone: string
  code: string
  error: string | null
  onCodeChange: (value: string) => void
  onConfirm: () => void
  onResend: () => void
  onCancel: () => void
  onScenario: (kind: 'wrong' | 'expired' | 'ok') => void
}) {
  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        <div className={styles.currentContact}>
          <div className={styles.fieldLabel}>Куда отправлен код</div>
          <div className={styles.fieldValue}>{pendingPhone}</div>
        </div>

        <label className={styles.formField}>
          <span className={styles.formLabel}>Код из SMS</span>
          <input
            className={
              error ? `${styles.input} ${styles.inputError}` : styles.input
            }
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="482 631"
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? 'sms-code-error sms-code-hint' : 'sms-code-hint'
            }
          />
          {error ? (
            <span id="sms-code-error" className={styles.fieldError}>
              {error}
            </span>
          ) : null}
          <span id="sms-code-hint" className={styles.formHint}>
            Код действует 10 минут. Используйте последнее полученное сообщение.
          </span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Подтвердить телефон
          </button>
          <button
            type="button"
            className={styles.btnSoft}
            onClick={onResend}
          >
            Отправить новый код
          </button>
        </div>

        <button
          type="button"
          className={styles.btnCancelWide}
          onClick={onCancel}
        >
          Отмена — оставить прежний контакт
        </button>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>
              Что изменится после подтверждения
            </div>
            <p className={styles.hintText}>
              Новый номер будет использоваться для связи и уведомлений
              безопасности. На старый контакт придёт уведомление об изменении.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Поля показаны на примерах. Кнопки ниже переключают заполнение и
            ошибки для проверки сценария.
          </p>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('wrong')}
          >
            Неверный код
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('expired')}
          >
            Код устарел
          </button>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={() => onScenario('ok')}
          >
            Верный код
          </button>
        </section>
      </aside>
    </div>
  )
}

function ConfirmEmailTab({
  pendingEmail,
  code,
  error,
  onCodeChange,
  onConfirm,
  onResend,
  onCancel,
  onScenario,
}: {
  pendingEmail: string
  code: string
  error: string | null
  onCodeChange: (value: string) => void
  onConfirm: () => void
  onResend: () => void
  onCancel: () => void
  onScenario: (kind: 'wrong' | 'expired' | 'ok') => void
}) {
  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        <div className={styles.currentContact}>
          <div className={styles.fieldLabel}>Куда отправлен код</div>
          <div className={styles.fieldValue}>{pendingEmail}</div>
        </div>

        <label className={styles.formField}>
          <span className={styles.formLabel}>Код из письма</span>
          <input
            className={
              error ? `${styles.input} ${styles.inputError}` : styles.input
            }
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="482 631"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'code-error code-hint' : 'code-hint'}
          />
          {error ? (
            <span id="code-error" className={styles.fieldError}>
              {error}
            </span>
          ) : null}
          <span id="code-hint" className={styles.formHint}>
            Код действует 10 минут. Используйте последнее полученное сообщение.
          </span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Подтвердить e-mail
          </button>
          <button
            type="button"
            className={styles.btnSoft}
            onClick={onResend}
          >
            Отправить новый код
          </button>
        </div>

        <button
          type="button"
          className={styles.btnCancelWide}
          onClick={onCancel}
        >
          Отмена — оставить прежний контакт
        </button>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>
              Что изменится после подтверждения
            </div>
            <p className={styles.hintText}>
              Для следующего входа используйте новый e-mail. Старый адрес
              получит уведомление об изменении контакта.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Поля показаны на примерах. Кнопки ниже переключают заполнение и
            ошибки для проверки сценария.
          </p>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('wrong')}
          >
            Неверный код
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('expired')}
          >
            Код устарел
          </button>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={() => onScenario('ok')}
          >
            Верный код
          </button>
        </section>
      </aside>
    </div>
  )
}

function ChangePasswordTab({
  form,
  errors,
  onChange,
  onSubmit,
  onCancel,
  onScenario,
}: {
  form: PasswordForm
  errors: { current?: string; next?: string; confirm?: string }
  onChange: <K extends keyof PasswordForm>(key: K, value: string) => void
  onSubmit: () => void
  onCancel: () => void
  onScenario: (kind: 'badCurrent' | 'mismatch' | 'ok') => void
}) {
  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <h3 className={styles.cardTitle}>Изменение пароля</h3>

        <label className={styles.formField}>
          <span className={styles.formLabel}>
            Текущий пароль <span className={styles.req}>*</span>
          </span>
          <input
            type="password"
            className={
              errors.current
                ? `${styles.input} ${styles.inputError}`
                : styles.input
            }
            value={form.current}
            onChange={(e) => onChange('current', e.target.value)}
            autoComplete="current-password"
            aria-invalid={errors.current ? true : undefined}
            aria-describedby={errors.current ? 'pwd-current-error' : undefined}
          />
          {errors.current ? (
            <span id="pwd-current-error" className={styles.fieldError}>
              {errors.current}
            </span>
          ) : null}
        </label>

        <div className={styles.formNameGrid2}>
          <label className={styles.formField}>
            <span className={styles.formLabel}>
              Новый пароль <span className={styles.req}>*</span>
            </span>
            <input
              type="password"
              className={
                errors.next
                  ? `${styles.input} ${styles.inputError}`
                  : styles.input
              }
              value={form.next}
              onChange={(e) => onChange('next', e.target.value)}
              autoComplete="new-password"
              aria-invalid={errors.next ? true : undefined}
              aria-describedby={
                errors.next ? 'pwd-next-error pwd-hint' : 'pwd-hint'
              }
            />
            {errors.next ? (
              <span id="pwd-next-error" className={styles.fieldError}>
                {errors.next}
              </span>
            ) : null}
          </label>

          <label className={styles.formField}>
            <span className={styles.formLabel}>
              Повторите новый пароль <span className={styles.req}>*</span>
            </span>
            <input
              type="password"
              className={
                errors.confirm
                  ? `${styles.input} ${styles.inputError}`
                  : styles.input
              }
              value={form.confirm}
              onChange={(e) => onChange('confirm', e.target.value)}
              autoComplete="new-password"
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? 'pwd-confirm-error' : undefined}
            />
            {errors.confirm ? (
              <span id="pwd-confirm-error" className={styles.fieldError}>
                {errors.confirm}
              </span>
            ) : null}
          </label>
        </div>

        <span id="pwd-hint" className={styles.formHint}>
          Не менее 12 символов. Новый пароль должен отличаться от текущего.
        </span>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Сохранить пароль
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>После смены пароля</div>
            <p className={styles.hintText}>
              Другие устройства выйдут из аккаунта. Текущий сеанс сохранится.
              Уведомление о смене пароля придёт на подтверждённый e-mail.
            </p>
          </div>
        </div>

        <section className={`${styles.card} ${styles.protoCard}`}>
          <div className={styles.protoEyebrow}>ПРОТОТИП · пример заполнения</div>
          <p className={styles.protoText}>
            Кнопки ниже подставляют сценарии: неверный текущий пароль, пароли
            не совпадают или корректное заполнение.
          </p>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('badCurrent')}
          >
            Неверный текущий пароль
          </button>
          <button
            type="button"
            className={styles.btnProtoEmpty}
            onClick={() => onScenario('mismatch')}
          >
            Пароли не совпадают
          </button>
          <button
            type="button"
            className={styles.btnProtoFill}
            onClick={() => onScenario('ok')}
          >
            Корректное заполнение
          </button>
        </section>
      </aside>
    </div>
  )
}

type SessionItem = {
  id: string
  title: string
  text: string
  current?: boolean
}

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: 'chrome',
    title: 'Chrome · macOS · текущий сеанс',
    text: 'Клиника «Равновесие» · сегодня, 11:05. Этот сеанс останется активным.',
    current: true,
  },
  {
    id: 'safari',
    title: 'Safari · iPhone',
    text: 'Последняя активность: сегодня, 09:14.',
  },
]

function SecurityTab({
  onChangePassword,
}: {
  onChangePassword: () => void
}) {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [endSessionsOpen, setEndSessionsOpen] = useState(false)
  const hasOtherSessions = sessions.some((s) => !s.current)

  return (
    <div className={styles.editGrid}>
      <div className={styles.colMain}>
        <section className={styles.card}>
          <div className={styles.securityRow}>
            <div className={styles.securityMeta}>
              <h3 className={styles.cardTitle}>Пароль</h3>
              <div className={styles.fieldLabel}>Последнее изменение</div>
              <div className={styles.fieldValue}>14 октября 2026</div>
            </div>
            <button
              type="button"
              className={styles.btnEdit}
              onClick={onChangePassword}
            >
              Изменить пароль
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.sessionsCard}`}>
          <h3 className={styles.cardTitle}>Активные сеансы</h3>

          <div className={styles.sessionList}>
            {sessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <span className={styles.sessionIcon} aria-hidden>
                  <IconShield size={18} />
                </span>
                <div className={styles.sessionMeta}>
                  <div className={styles.sessionTitle}>{session.title}</div>
                  <p className={styles.sessionText}>{session.text}</p>
                </div>
              </div>
            ))}
          </div>

          {hasOtherSessions ? (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setEndSessionsOpen(true)}
            >
              Завершить другие сеансы
            </button>
          ) : null}
        </section>
      </div>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>Защита контактов</div>
            <p className={styles.hintText}>
              Смена e-mail и телефона всегда требует текущий пароль и
              подтверждение кода.
            </p>
          </div>
        </div>

        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>Уведомления безопасности</div>
            <p className={styles.hintText}>
              Уведомления о новых входах и смене пароля включены всегда и не
              отключаются.
            </p>
          </div>
        </div>
      </aside>

      <EndSessionsModal
        open={endSessionsOpen}
        onCancel={() => setEndSessionsOpen(false)}
        onConfirm={() => {
          setSessions((prev) => prev.filter((s) => s.current))
          setEndSessionsOpen(false)
        }}
      />
    </div>
  )
}

function NotificationsTab() {
  const [messages, setMessages] = useState(true)
  const [alerts, setAlerts] = useState(true)
  const [saved, setSaved] = useState({ messages: true, alerts: true })

  function save() {
    setSaved({ messages, alerts })
  }

  function cancel() {
    setMessages(saved.messages)
    setAlerts(saved.alerts)
  }

  return (
    <div className={styles.editGrid}>
      <form
        className={`${styles.card} ${styles.editCard}`}
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <h3 className={styles.cardTitle}>Рабочие уведомления</h3>

        <div className={styles.notifyList}>
          <label className={styles.notifyRow}>
            <input
              type="checkbox"
              className={styles.checkInput}
              checked={messages}
              onChange={(e) => setMessages(e.target.checked)}
            />
            <span
              className={messages ? styles.checkOn : styles.checkOff}
              aria-hidden
            >
              {messages ? <IconTick size={12} strokeWidth={2.5} /> : null}
            </span>
            <span className={styles.notifyMeta}>
              <span className={styles.notifyTitle}>
                Новые сообщения пациентов
              </span>
              <span className={styles.notifyHint}>
                Ссылки ведут в защищённый кабинет. Текст сообщений пациентов в
                письма не включается.
              </span>
            </span>
          </label>

          <label className={styles.notifyRow}>
            <input
              type="checkbox"
              className={styles.checkInput}
              checked={alerts}
              onChange={(e) => setAlerts(e.target.checked)}
            />
            <span
              className={alerts ? styles.checkOn : styles.checkOff}
              aria-hidden
            >
              {alerts ? <IconTick size={12} strokeWidth={2.5} /> : null}
            </span>
            <span className={styles.notifyMeta}>
              <span className={styles.notifyTitle}>
                Новые клинические алерты
              </span>
              <span className={styles.notifyHint}>
                Отключение писем не убирает алерты из рабочего кабинета.
              </span>
            </span>
          </label>
        </div>

        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>
              Уведомления безопасности всегда включены
            </div>
            <p className={styles.hintText}>
              Вход с нового устройства, изменение пароля и контактов. Их
              отключить нельзя.
            </p>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Сохранить настройки
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={cancel}
          >
            Отмена
          </button>
        </div>
      </form>

      <aside className={styles.editSide}>
        <div className={styles.hintCard}>
          <span className={styles.hintIcon} aria-hidden>
            <IconShield size={18} />
          </span>
          <div>
            <div className={styles.hintTitle}>Куда приходят письма</div>
            <p className={styles.hintText}>
              Уведомления отправляются только на подтверждённый e-mail из
              личного профиля.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
