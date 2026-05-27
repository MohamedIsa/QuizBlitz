import { Image, Linking, Pressable, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'

interface ImagePickerButtonProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  aspectRatio?: [number, number]
  label?: string
}

export function ImagePickerButton({
  currentUrl,
  onUpload,
  aspectRatio = [16, 9],
  label = 'Add image',
}: ImagePickerButtonProps) {
  const { upload, isUploading } = useImageUpload()
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  async function handlePress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      show('Photo library access is needed to add images. Enable it in Settings.', {
        type: 'warning',
        action: { label: 'Settings', onPress: () => Linking.openSettings() },
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 1,
    })

    if (result.canceled || !result.assets[0]) return

    try {
      const publicUrl = await upload(result.assets[0].uri)
      onUpload(publicUrl)
    } catch {
      show('Could not upload the image. Please try again.', { type: 'error' })
    }
  }

  const ratio = aspectRatio[0] / aspectRatio[1]

  return (
    <Pressable onPress={handlePress} disabled={isUploading}>
      <View style={[styles.container, { aspectRatio: ratio, borderColor: colors.outline }]}>
        {isUploading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
              Uploading...
            </Text>
          </View>
        ) : currentUrl ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: currentUrl }} style={styles.image} resizeMode="cover" />
            <View style={[styles.changeOverlay, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={colors.primary} />
            </View>
          </View>
        ) : (
          <View style={styles.centered}>
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={32}
              color={colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
              {label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.violetTint,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.card,
  },
})
