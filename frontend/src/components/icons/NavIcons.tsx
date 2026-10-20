import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Alert02Icon,
  Analytics01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  Calendar03Icon,
  Call02Icon,
  Cancel01Icon,
  ChartLineData01Icon,
  Chat01Icon,
  CompassIcon,
  Download01Icon,
  EqualSignIcon,
  ExternalLinkIcon,
  FavouriteIcon,
  File01Icon,
  FilterIcon,
  Home01Icon,
  InformationCircleIcon,
  Leaf01Icon,
  Link01Icon,
  Logout01Icon,
  LungsIcon,
  MailSend01Icon,
  MoreHorizontalIcon,
  Notebook01Icon,
  Notification01Icon,
  PencilEdit01Icon,
  PillIcon,
  Search01Icon,
  SecurityIcon,
  Shield01Icon,
  SidebarLeft01Icon,
  SlidersHorizontalIcon,
  SquareLock02Icon,
  Tick02Icon,
  UserIcon,
  UserGroupIcon,
  WalkingIcon,
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

export function IconPencil(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={16}
      icon={PencilEdit01Icon}
      {...props}
    />
  )
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Alert02Icon} {...props} />
  )
}

export function IconPill(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={18} icon={PillIcon} {...props} />
}

export function IconCall(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={Call02Icon} {...props} />
}

export function IconChat(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={Chat01Icon} {...props} />
}

export function IconUser(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={UserIcon} {...props} />
}

export function IconTick(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={16} icon={Tick02Icon} {...props} />
}

export function IconArrowLeft(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={16} icon={ArrowLeft01Icon} {...props} />
  )
}

export function IconDownload(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={16} icon={Download01Icon} {...props} />
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={16} icon={Calendar03Icon} {...props} />
  )
}

export function IconTrendChart(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={16}
      icon={ChartLineData01Icon}
      {...props}
    />
  )
}

export function IconLungs(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={18} icon={LungsIcon} {...props} />
}

export function IconHeart(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={FavouriteIcon} {...props} />
  )
}

export function IconNotebook(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Notebook01Icon} {...props} />
  )
}

export function IconLeaf(props: IconProps) {
  return <HugeiconsIcon {...defaults} size={18} icon={Leaf01Icon} {...props} />
}

export function IconWalk(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={WalkingIcon} {...props} />
  )
}

export function IconCancel(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={14} icon={Cancel01Icon} {...props} />
  )
}

export function IconExternalLink(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={16}
      icon={ExternalLinkIcon}
      {...props}
    />
  )
}

export function IconInfo(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={14}
      icon={InformationCircleIcon}
      {...props}
    />
  )
}

export function IconLock(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={14}
      icon={SquareLock02Icon}
      {...props}
    />
  )
}

export function IconMore(props: IconProps) {
  return (
    <HugeiconsIcon
      {...defaults}
      size={18}
      icon={MoreHorizontalIcon}
      {...props}
    />
  )
}

export function IconSend(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={16} icon={MailSend01Icon} {...props} />
  )
}

export function IconEmployees(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={UserGroupIcon} {...props} />
}

export function IconAnalytics(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={Analytics01Icon} {...props} />
}

export function IconAudit(props: IconProps) {
  return <HugeiconsIcon {...defaults} icon={SecurityIcon} {...props} />
}

export function IconClinicSettings(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} icon={SlidersHorizontalIcon} {...props} />
  )
}

export function IconShield(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Shield01Icon} {...props} />
  )
}

export function IconLink(props: IconProps) {
  return (
    <HugeiconsIcon {...defaults} size={18} icon={Link01Icon} {...props} />
  )
}

export { HugeiconsIcon }
