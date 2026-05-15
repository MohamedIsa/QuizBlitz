import { getInitials } from '@/lib/user'

describe('getInitials', () => {
  it('returns first letters of a two-word name', () => {
    expect(getInitials({ id: '1', email: 'a@b.com', name: 'Jane Doe' })).toBe('JD')
  })

  it('returns first letter of a one-word name', () => {
    expect(getInitials({ id: '1', email: 'a@b.com', name: 'Cher' })).toBe('C')
  })

  it('caps at two initials for long multi-word names', () => {
    expect(getInitials({ id: '1', email: 'a@b.com', name: 'Mary Jane Watson Parker' })).toBe('MJ')
  })

  it('trims and collapses internal whitespace', () => {
    expect(getInitials({ id: '1', email: 'a@b.com', name: '  Jane   Doe  ' })).toBe('JD')
  })

  it('falls back to email first letter when name is missing', () => {
    expect(getInitials({ id: '1', email: 'alice@example.com' })).toBe('A')
  })

  it('falls back to email first letter when name is empty string', () => {
    expect(getInitials({ id: '1', email: 'bob@example.com', name: '' })).toBe('B')
  })

  it('falls back to email when name is only whitespace', () => {
    expect(getInitials({ id: '1', email: 'carol@example.com', name: '   ' })).toBe('C')
  })

  it('returns "?" for null user', () => {
    expect(getInitials(null)).toBe('?')
  })

  it('returns "?" for undefined user', () => {
    expect(getInitials(undefined)).toBe('?')
  })

  it('returns "?" when neither name nor email is usable', () => {
    expect(getInitials({ id: '1', email: '', name: '' })).toBe('?')
  })
})
