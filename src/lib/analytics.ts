// Analytics service for BITSPARK
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: any
  }
}

export class AnalyticsService {
  private static isInitialized = false

  // Initialize analytics services
  static init() {
    if (this.isInitialized) return

    // Initialize Google Analytics
    this.initGoogleAnalytics()
    
    // Initialize Mixpanel
    this.initMixpanel()
    
    this.isInitialized = true
  }

  private static initGoogleAnalytics() {
    const trackingId = import.meta.env.VITE_GA_TRACKING_ID
    if (!trackingId) return

    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', trackingId, {
      page_title: 'BITSPARK',
      page_location: window.location.href
    })
  }

  private static initMixpanel() {
    const token = import.meta.env.VITE_MIXPANEL_TOKEN
    if (!token) return

    // Load Mixpanel script
    const script = document.createElement('script')
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js'
    script.onload = () => {
      window.mixpanel.init(token, {
        debug: import.meta.env.DEV,
        track_pageview: true,
        persistence: 'localStorage'
      })
    }
    document.head.appendChild(script)
  }

  // Track page views
  static trackPageView(pageName: string, properties?: Record<string, any>) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        ...properties
      })
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pageName,
        url: window.location.href,
        ...properties
      })
    }
  }

  // Track user events
  static trackEvent(eventName: string, properties?: Record<string, any>) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, properties)
    }
  }

  // Track user authentication
  static trackAuth(action: 'login' | 'logout' | 'signup', properties?: Record<string, any>) {
    this.trackEvent(`auth_${action}`, {
      timestamp: new Date().toISOString(),
      ...properties
    })
  }

  // Track matching events
  static trackMatching(action: 'swipe_right' | 'swipe_left' | 'super_like' | 'match', properties?: Record<string, any>) {
    this.trackEvent(`matching_${action}`, {
      timestamp: new Date().toISOString(),
      ...properties
    })
  }

  // Track messaging events
  static trackMessaging(action: 'message_sent' | 'message_received' | 'limit_reached', properties?: Record<string, any>) {
    this.trackEvent(`messaging_${action}`, {
      timestamp: new Date().toISOString(),
      ...properties
    })
  }

  // Track shipping events
  static trackShipping(action: 'ship_sent' | 'ship_received' | 'ship_accepted', properties?: Record<string, any>) {
    this.trackEvent(`shipping_${action}`, {
      timestamp: new Date().toISOString(),
      ...properties
    })
  }

  // Set user properties
  static setUserProperties(userId: string, properties: Record<string, any>) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
        user_id: userId,
        custom_map: properties
      })
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(userId)
      window.mixpanel.people.set(properties)
    }
  }

  // Track performance metrics
  static trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.trackEvent('performance_metric', {
      metric,
      value,
      ...properties
    })
  }

  // Track errors
  static trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    })
  }
}