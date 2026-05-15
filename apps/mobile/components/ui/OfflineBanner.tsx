import { StyleSheet } from 'react-native'
import { Banner } from 'react-native-paper'
import { useNetworkState } from '@/hooks/useNetworkState'

export function OfflineBanner() {
  const { isConnected } = useNetworkState()

  return (
    <Banner
      visible={!isConnected}
      icon="wifi-off"
      style={styles.banner}
    >
      No internet connection — some features may be unavailable
    </Banner>
  )
}

const styles = StyleSheet.create({
  banner: {
    zIndex: 100,
  },
})
