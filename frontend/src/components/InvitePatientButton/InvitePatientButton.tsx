import { IconPlus } from '@/components/icons/NavIcons'
import styles from './InvitePatientButton.module.css'

interface InvitePatientButtonProps {
  onClick?: () => void
}

export function InvitePatientButton({ onClick }: InvitePatientButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <IconPlus aria-hidden />
      Пригласить пациента
    </button>
  )
}
