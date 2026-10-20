import { useState } from 'react'
import { IconPlus } from '@/components/icons/NavIcons'
import { InvitePatientModal } from '@/components/InvitePatientModal/InvitePatientModal'
import styles from './InvitePatientButton.module.css'

export function InvitePatientButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen(true)}
      >
        <IconPlus aria-hidden />
        Пригласить пациента
      </button>
      <InvitePatientModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
