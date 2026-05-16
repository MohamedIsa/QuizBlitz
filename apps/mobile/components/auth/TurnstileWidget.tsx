import { WebView } from 'react-native-webview'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) {
    throw new Error('[TurnstileWidget] EXPO_PUBLIC_TURNSTILE_SITE_KEY is not set')
  }

  const html = `<html><head>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  </head><body style="margin:0;background:transparent">
    <div class="cf-turnstile" data-sitekey="${siteKey}"
         data-callback="done" data-size="invisible"></div>
    <script>function done(t){window.ReactNativeWebView.postMessage(JSON.stringify({token:t}))}</script>
  </body></html>`

  return (
    <WebView
      style={{ width: 1, height: 1 }}
      source={{ html }}
      onMessage={(e) => onVerify(JSON.parse(e.nativeEvent.data).token)}
    />
  )
}
