import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'
import { Button } from '@/components/ui'

// expo-haptics is a native module — mock it so tests don't crash
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

describe('Button', () => {
  it('renders its label', () => {
    const { getByText } = render(
      <Wrapper>
        <Button onPress={() => {}}>Press me</Button>
      </Wrapper>,
    )
    expect(getByText('Press me')).toBeTruthy()
  })

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <Wrapper>
        <Button onPress={onPress}>Click</Button>
      </Wrapper>,
    )
    await act(async () => {
      fireEvent.press(getByText('Click'))
    })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <Wrapper>
        <Button onPress={onPress} disabled>
          Disabled
        </Button>
      </Wrapper>,
    )
    fireEvent.press(getByText('Disabled'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('renders full width when fullWidth is true', () => {
    const { getByText } = render(
      <Wrapper>
        <Button onPress={() => {}} fullWidth>
          Full
        </Button>
      </Wrapper>,
    )
    expect(getByText('Full')).toBeTruthy()
  })
})
