import { useEffect, useState } from 'react'
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'

export interface NetworkState {
  isConnected: boolean
  isInternetReachable: boolean | null
  type: string
}

// Pessimistic default — assume offline until NetInfo reports otherwise. Prevents
// the user from tapping network-bound actions in the brief window between mount
// and the first NetInfo event when the device has no connectivity.
const INITIAL_STATE: NetworkState = {
  isConnected: false,
  isInternetReachable: null,
  type: 'unknown',
}

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    NetInfo.fetch().then((netState: NetInfoState) => {
      if (cancelled) return
      setState({
        isConnected: netState.isConnected ?? false,
        isInternetReachable: netState.isInternetReachable,
        type: netState.type,
      })
    })

    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      setState({
        isConnected: netState.isConnected ?? false,
        isInternetReachable: netState.isInternetReachable,
        type: netState.type,
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return state
}
