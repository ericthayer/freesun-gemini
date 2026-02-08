import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface OnboardingEventData {
  event_type: 'start' | 'step_view' | 'complete' | 'skip' | 'back' | 'close';
  step_number?: number;
  step_title?: string;
  session_duration_ms?: number;
  metadata?: Record<string, any>;
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width >= 1024) return 'desktop';
  return 'unknown';
}

export function useOnboardingAnalytics() {
  const { user } = useAuth();
  const stepStartTime = useRef<number>(Date.now());

  const trackEvent = async (data: OnboardingEventData) => {
    if (!user) return;

    try {
      await supabase.from('onboarding_events').insert({
        user_id: user.id,
        event_type: data.event_type,
        step_number: data.step_number,
        step_title: data.step_title,
        device_type: getDeviceType(),
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        user_agent: navigator.userAgent,
        session_duration_ms: data.session_duration_ms,
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Failed to track onboarding event:', error);
    }
  };

  const trackStart = () => {
    stepStartTime.current = Date.now();
    trackEvent({ event_type: 'start' });
  };

  const trackStepView = (stepNumber: number, stepTitle: string) => {
    const duration = Date.now() - stepStartTime.current;
    stepStartTime.current = Date.now();

    trackEvent({
      event_type: 'step_view',
      step_number: stepNumber,
      step_title: stepTitle,
      session_duration_ms: duration
    });
  };

  const trackComplete = (totalSteps: number) => {
    const duration = Date.now() - stepStartTime.current;
    trackEvent({
      event_type: 'complete',
      session_duration_ms: duration,
      metadata: { total_steps: totalSteps }
    });
  };

  const trackSkip = (currentStep: number, totalSteps: number) => {
    const duration = Date.now() - stepStartTime.current;
    trackEvent({
      event_type: 'skip',
      step_number: currentStep,
      session_duration_ms: duration,
      metadata: {
        total_steps: totalSteps,
        completion_percentage: Math.round((currentStep / totalSteps) * 100)
      }
    });
  };

  const trackBack = (stepNumber: number) => {
    trackEvent({
      event_type: 'back',
      step_number: stepNumber
    });
  };

  const trackClose = (currentStep: number, totalSteps: number) => {
    const duration = Date.now() - stepStartTime.current;
    trackEvent({
      event_type: 'close',
      step_number: currentStep,
      session_duration_ms: duration,
      metadata: {
        total_steps: totalSteps,
        completion_percentage: Math.round((currentStep / totalSteps) * 100)
      }
    });
  };

  return {
    trackStart,
    trackStepView,
    trackComplete,
    trackSkip,
    trackBack,
    trackClose
  };
}
