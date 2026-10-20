import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  CompassIcon,
  EqualSignIcon,
  File01Icon,
  FilterIcon,
  Home01Icon,
  Logout01Icon,
  Notification01Icon,
  PillIcon,
  Search01Icon,
  SidebarLeft01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import type { ComponentProps } from 'react'

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'>

const defaults = {
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.75,
} as const

export function IconDashboard(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={Home01Icon} {...props} />
}

export function IconPatients(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={UserGroupIcon} {...props} />
}

export function IconAlerts(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={Notification01Icon} {...props} />
}

export function IconMedications(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={PillIcon} {...props} />
}

export function IconExercises(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={BookOpen01Icon} {...props} />
}

export function IconBell(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={20}
      icon={Notification01Icon}
      {...props}
    />
  )
}

export function IconSearch(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Search01Icon} {...props} />
  )
}

export function IconFile(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={File01Icon} {...props} />
}

export function IconPlus(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={Add01Icon} {...props} />
}

export function IconFilter(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={FilterIcon} {...props} />
}

export function IconTrendUp(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={12} icon={ArrowUp01Icon} {...props} />
  )
}

export function IconTrendDown(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={12} icon={ArrowDown01Icon} {...props} />
  )
}

export function IconTrendSame(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={12} icon={EqualSignIcon} {...props} />
  )
}

export function IconLogout(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Logout01Icon} {...props} />
  )
}

export function IconSidebarToggle(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={20}
      icon={SidebarLeft01Icon}
      {...props}
    />
  )
}

export function IconCompass(props: IconProps) {
  return (
    <HugeiconsIcon
      size={18}
      color="#FFFFFF"
      strokeWidth={1.8}
      icon={CompassIcon}
      {...props}
    />
  )
}

export { HugeiconsIcon }
