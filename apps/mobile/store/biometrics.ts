import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBiometricCapability, type BiometricCapability } from '@/lib/biometrics'

interface BiometricStore {
  isEnabled: boolean
  capability: BiometricCapability | null
  _loadCapability: () => Promise<void>
  enable: () => void
  disable: () => void
  toggle: () => void
}

export const useBiometricStore = create<BiometricStore>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      capability: null,

      _loadCapability: async () => {
        const capability = await getBiometricCapability()
        // Do NOT clear `isEnabled` here. Sensor unavailability is often
        // transient (boot, dirty sensor, just-enrolled fingerprint not yet
        // visible). The user's *preference* persists; UI gates actual use on
        // canUseBiometrics, and `useBiometricAuth.authenticate()` already
        // refuses when `!capability?.isEnrolled`.
        set({ capability })
      },

      enable: () => set({ isEnabled: true }),
      disable: () => set({ isEnabled: false }),
      toggle: () => set((s) => ({ isEnabled: !s.isEnabled })),
    }),
    {
      name: 'biometric-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isEnabled: s.isEnabled }),
    },
  ),
)

// Convenience selector
export const useBiometricEnabled = () => useBiometricStore((s) => s.isEnabled)
export const useBiometricCapability = () => useBiometricStore((s) => s.capability)
