import { useEffect, useState } from 'react'
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'

export interface NetworkState {
  isConnected: boolean | null
  isInternetReachable: boolean | null
  type: string
}

// null = not yet determined (NetInfo hasn't reported). Distinguishing unknown
// from offline prevents the banner from flashing on every cold start.
const INITIAL_STATE: NetworkState = {
  isConnected: null,
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
