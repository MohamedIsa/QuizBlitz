import { StyleSheet } from 'react-native'
import { Banner } from 'react-native-paper'
import { useUpdates } from '@/hooks/useUpdates'

export function UpdateBanner() {
  const { isUpdateAvailable, isApplying, applyUpdate } = useUpdates()

  return (
    <Banner
      visible={isUpdateAvailable}
      icon="update"
      style={styles.banner}
      actions={[
        {
          label: isApplying ? 'Updating…' : 'Update now',
          onPress: applyUpdate,
        },
        {
          label: 'Later',
          onPress: () => {},
        },
      ]}
    >
      A new version of the app is available.
    </Banner>
  )
}

const styles = StyleSheet.create({
  banner: {
    zIndex: 99,
  },
})
