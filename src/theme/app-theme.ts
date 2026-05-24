import { theme } from 'ant-design-vue'
import type { OverrideToken } from 'ant-design-vue/es/theme/interface'
import type { AliasToken } from 'ant-design-vue/es/theme/interface'

/**
 * توکن‌های مشترک — بدون رنگ پس‌زمینه ثابت تا darkAlgorithm اعمال شود.
 */
export const appToken: Partial<AliasToken> = {
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeHeading1: 32,
  fontSizeHeading2: 26,
  fontSizeHeading3: 20,
  fontSizeHeading4: 17,
  fontSizeHeading5: 14,
  lineHeight: 1.6,
  lineHeightHeading1: 1.25,
  lineHeightHeading2: 1.3,
  lineHeightHeading3: 1.35,
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  controlHeight: 36,
  controlHeightLG: 44,
  controlHeightSM: 28,
  padding: 16,
  paddingLG: 24,
  paddingSM: 12,
  paddingXS: 8,
  margin: 16,
  marginLG: 24,
  marginSM: 12,
  marginXS: 8,
  motionDurationMid: '0.2s',
  motionDurationFast: '0.15s',
}

/** فقط تنظیماتی که به الگوریتم وابسته نیستند */
export const appComponentToken = {
  Card: {
    borderRadiusLG: 12,
  },
  Button: {
    fontWeight: 500,
    primaryShadow: 'none',
  },
  Progress: {
    defaultColor: '#1677ff',
  },
  Statistic: {
    titleFontSize: 13,
    contentFontSize: 24,
  },
  List: {
    itemPadding: '20px 0',
  },
} as OverrideToken

export const appDefaultAlgorithm = theme.defaultAlgorithm
export const appDarkAlgorithm = theme.darkAlgorithm
