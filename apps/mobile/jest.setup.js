// Mock Expo's WinterCG import.meta registry — it uses require.context which Jest doesn't support
jest.mock('expo/src/winter/runtime.native', () => ({}))
