import type { CSSProperties } from 'react'
import homeIcon from '../assets/home.svg'
import homeIconSvg from '../assets/home.svg?raw'
import classIcon from '../assets/Class.svg'
import classIconSvg from '../assets/Class.svg?raw'
import fileIcon from '../assets/file.svg'
import fileIconSvg from '../assets/file.svg?raw'
import bookOpenIcon from '../assets/book-open.svg'
import bookOpenIconSvg from '../assets/book-open.svg?raw'
import profileIcon from '../assets/user.svg'
import profileIconSvg from '../assets/user.svg?raw'
import settingIcon from '../assets/setting_icon.svg'
import settingIconSvg from '../assets/setting_icon.svg?raw'
import editIcon from '../assets/edit.svg'
import editIconSvg from '../assets/edit.svg?raw'
import backArrowIcon from '../assets/BackArrow.svg'
import backArrowIconSvg from '../assets/BackArrow.svg?raw'
import accountIcon from '../assets/profile.svg'
import accountIconSvg from '../assets/profile.svg?raw'
import preferencesIcon from '../assets/preferences.svg'
import preferencesIconSvg from '../assets/preferences.svg?raw'
import notificationIcon from '../assets/notification.svg'
import notificationIconSvg from '../assets/notification.svg?raw'
import supportIcon from '../assets/support.svg'
import supportIconSvg from '../assets/support.svg?raw'
import questionIcon from '../assets/question.svg'
import questionIconSvg from '../assets/question.svg?raw'
import feedbackIcon from '../assets/Feedback_icon.svg'
import feedbackIconSvg from '../assets/Feedback_icon.svg?raw'
import logoutIcon from '../assets/logout.svg'
import logoutIconSvg from '../assets/logout.svg?raw'
import trashIcon from '../assets/trash.svg'
import trashIconSvg from '../assets/trash.svg?raw'
import closeRoundedIcon from '../assets/close-rounded_icon.svg'
import closeRoundedIconSvg from '../assets/close-rounded_icon.svg?raw'
import checkIcon from '../assets/check_icon_gray.svg'
import checkIconSvg from '../assets/check_icon_gray.svg?raw'
import graduationCapIcon from '../assets/graduation-cap_icon.svg'
import graduationCapIconSvg from '../assets/graduation-cap_icon.svg?raw'
import groupOutlineIcon from '../assets/group-outline_icon.svg'
import groupOutlineIconSvg from '../assets/group-outline_icon.svg?raw'
import bookLineIcon from '../assets/mingcute_book-6-line_icon.svg'
import bookLineIconSvg from '../assets/mingcute_book-6-line_icon.svg?raw'
import sparksIcon from '../assets/sparks_icon.svg'
import sparksIconSvg from '../assets/sparks_icon.svg?raw'
import './ThemedIcon.css'

interface ThemedIconProps {
  src: string
  className?: string
}

function useCurrentColor(svg: string): string {
  return svg
    .replace(/\s(?:width|height)="[^"]*"/g, '')
    .replace(/\sclip-path="[^"]*"/g, '')
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
}

const inlineSvgBySrc = new Map<string, string>(
  [
    [homeIcon, homeIconSvg],
    [classIcon, classIconSvg],
    [fileIcon, fileIconSvg],
    [bookOpenIcon, bookOpenIconSvg],
    [profileIcon, profileIconSvg],
    [settingIcon, settingIconSvg],
    [editIcon, editIconSvg],
    [backArrowIcon, backArrowIconSvg],
    [accountIcon, accountIconSvg],
    [preferencesIcon, preferencesIconSvg],
    [notificationIcon, notificationIconSvg],
    [supportIcon, supportIconSvg],
    [questionIcon, questionIconSvg],
    [feedbackIcon, feedbackIconSvg],
    [logoutIcon, logoutIconSvg],
    [trashIcon, trashIconSvg],
    [closeRoundedIcon, closeRoundedIconSvg],
    [checkIcon, checkIconSvg],
    [graduationCapIcon, graduationCapIconSvg],
    [groupOutlineIcon, groupOutlineIconSvg],
    [bookLineIcon, bookLineIconSvg],
    [sparksIcon, sparksIconSvg],
  ].map(([src, svg]) => [src, useCurrentColor(svg)]),
)

function ThemedIcon({ src, className = '' }: ThemedIconProps) {
  const iconClassName = `themed-icon ${className}`.trim()
  const inlineSvg = inlineSvgBySrc.get(src)

  if (inlineSvg) {
    return (
      <span
        className={`${iconClassName} themed-icon-inline`}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: inlineSvg }}
      />
    )
  }

  const maskStyle = {
    '--themed-icon-url': `url("${src}")`,
  } as CSSProperties

  return <span className={iconClassName} style={maskStyle} aria-hidden="true" />
}

export default ThemedIcon
