/**
 * Centralized Analytics Events Handler
 * Manages Google Analytics and custom events
 */

interface AnalyticsEventParams {
  [key: string]: string | number | boolean;
}

enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  PROPERTY_VIEW = 'property_view',
  PROPERTY_CLICK = 'property_click',
  FAVORITE_ADD = 'favorite_add',
  FAVORITE_REMOVE = 'favorite_remove',
  CONTACT_FORM_SUBMIT = 'contact_form_submit',
  PHONE_CLICK = 'phone_click',
  WHATSAPP_CLICK = 'whatsapp_click',
  SEARCH = 'search',
  FILTER_APPLY = 'filter_apply',
  SIGN_UP = 'sign_up',
  LOGIN = 'login',
  PROPERTY_IMAGE_ZOOM = 'property_image_zoom',
  VIRTUAL_TOUR_START = 'virtual_tour_start',
}

class AnalyticsManager {
  private gaId: string | null;

  constructor() {
    this.gaId = import.meta.env.VITE_GA_ID || null;
    this.initializeGA();
  }

  private initializeGA(): void {
    if (!this.gaId) {
      console.warn('⚠️ Google Analytics ID not configured');
      return;
    }

    // GA4 script is usually loaded via gtag.js
    // This assumes the script is already loaded in HTML
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('config', this.gaId, {
        page_path: window.location.pathname,
      });
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (!this.gaId) return;

    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', AnalyticsEventType.PAGE_VIEW, {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    console.debug(`[Analytics] Page view: ${pagePath}`);
  }

  /**
   * Track property view
   */
  trackPropertyView(propertyId: string, propertyType: string): void {
    this.trackEvent(AnalyticsEventType.PROPERTY_VIEW, {
      property_id: propertyId,
      property_type: propertyType,
    });
  }

  /**
   * Track property click
   */
  trackPropertyClick(propertyId: string, source: string): void {
    this.trackEvent(AnalyticsEventType.PROPERTY_CLICK, {
      property_id: propertyId,
      source,
    });
  }

  /**
   * Track favorite action
   */
  trackFavorite(
    propertyId: string,
    action: 'add' | 'remove'
  ): void {
    const eventType =
      action === 'add'
        ? AnalyticsEventType.FAVORITE_ADD
        : AnalyticsEventType.FAVORITE_REMOVE;

    this.trackEvent(eventType, {
      property_id: propertyId,
    });
  }

  /**
   * Track contact form submission
   */
  trackContactFormSubmit(formType: string): void {
    this.trackEvent(AnalyticsEventType.CONTACT_FORM_SUBMIT, {
      form_type: formType,
    });
  }

  /**
   * Track phone click
   */
  trackPhoneClick(phone: string): void {
    this.trackEvent(AnalyticsEventType.PHONE_CLICK, {
      phone_number: this.maskSensitiveData(phone),
    });
  }

  /**
   * Track WhatsApp click
   */
  trackWhatsAppClick(phone: string): void {
    this.trackEvent(AnalyticsEventType.WHATSAPP_CLICK, {
      phone_number: this.maskSensitiveData(phone),
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent(AnalyticsEventType.SEARCH, {
      search_term: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track filter application
   */
  trackFilterApply(filters: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.FILTER_APPLY, {
      filters: JSON.stringify(filters),
    });
  }

  /**
   * Track sign up
   */
  trackSignUp(method: 'email' | 'google' | 'other'): void {
    this.trackEvent(AnalyticsEventType.SIGN_UP, {
      signup_method: method,
    });
  }

  /**
   * Track login
   */
  trackLogin(method: 'email' | 'google' | 'other'): void {
    this.trackEvent(AnalyticsEventType.LOGIN, {
      login_method: method,
    });
  }

  /**
   * Track image zoom
   */
  trackImageZoom(propertyId: string): void {
    this.trackEvent(AnalyticsEventType.PROPERTY_IMAGE_ZOOM, {
      property_id: propertyId,
    });
  }

  /**
   * Track virtual tour
   */
  trackVirtualTourStart(propertyId: string): void {
    this.trackEvent(AnalyticsEventType.VIRTUAL_TOUR_START, {
      property_id: propertyId,
    });
  }

  /**
   * Generic event tracking
   */
  private trackEvent(
    eventName: string,
    params: AnalyticsEventParams = {}
  ): void {
    if (!this.gaId) return;

    if (
      typeof window !== 'undefined' &&
      typeof window.gtag !== 'undefined'
    ) {
      window.gtag('event', eventName, params);
    }

    console.debug(`[Analytics] Event: ${eventName}`, params);
  }

  /**
   * Mask sensitive data (e.g., phone numbers)
   */
  private maskSensitiveData(data: string): string {
    if (data.length <= 4) return data;
    return `***${data.slice(-4)}`;
  }

  /**
   * Set user ID (for authenticated users)
   */
  setUserId(userId: string): void {
    if (!this.gaId) return;

    if (
      typeof window !== 'undefined' &&
      typeof window.gtag !== 'undefined'
    ) {
      window.gtag('config', this.gaId, {
        user_id: userId,
      });
    }
  }

  /**
   * Set custom user properties
   */
  setUserProperty(name: string, value: string): void {
    if (!this.gaId) return;

    if (
      typeof window !== 'undefined' &&
      typeof window.gtag !== 'undefined'
    ) {
      window.gtag('event', 'user_property', {
        user_property_name: name,
        user_property_value: value,
      });
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();

export { AnalyticsEventType, type AnalyticsEventParams };
