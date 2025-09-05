export function useLogTrafic() {
    
// Log traffic on client mount
if (import.meta.client) {
    onMounted(async () => {
      try {
        const ua = navigator.userAgent || ''
        const browser = (() => {
          if (/edg/i.test(ua)) return 'Edge'
          if (/chrome|crios/i.test(ua)) return 'Chrome'
          if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari'
          if (/firefox|fxios/i.test(ua)) return 'Firefox'
          return 'Unknown'
        })()
        const os = (() => {
          if (/windows nt/i.test(ua)) return 'Windows'
          if (/android/i.test(ua)) return 'Android'
          if (/iphone|ipad|ipod|ios/i.test(ua)) return 'iOS'
          if (/mac os x/i.test(ua)) return 'macOS'
          if (/linux/i.test(ua)) return 'Linux'
          return 'Unknown'
        })()
        await $fetch('/api/log-trafic', {
          method: 'POST',
          body: {
            browser,
            os,
            url: location.href,
          },
        })
      } catch (e) {
        // silent fail
        console.debug('log-trafic failed', e)
      }
    })
  }
}