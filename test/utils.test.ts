import { describe, expect, it } from 'vitest'
import { tierLabel } from '@/utils/roman'
import { intToHex } from '@/utils/color'

describe('tierLabel', () => {
  it('renders tiers 1 to 10 as Roman numerals', () => {
    expect(tierLabel(1)).toBe('I')
    expect(tierLabel(4)).toBe('IV')
    expect(tierLabel(10)).toBe('X')
  })

  it('renders tier 11 as a star, the way the game marks superships', () => {
    expect(tierLabel(11)).toBe('★')
  })
})

describe('intToHex', () => {
  it('converts the packed integer the API uses for nation colours', () => {
    expect(intToHex(14764062)).toBe('#e1481e')
    expect(intToHex(0)).toBe('#000000')
  })

  it('ignores bits above the 24th instead of producing a longer string', () => {
    expect(intToHex(0xff000000 + 0x123456)).toBe('#123456')
  })
})
