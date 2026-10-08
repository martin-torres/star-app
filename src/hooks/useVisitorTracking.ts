import { useEffect, useState, useRef, useCallback } from 'react';
import type { VisitorRecord } from '../core/types';
import { visitorApi } from '../../lib/visitorService';

export const useVisitorTracking = () => {
  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());

  function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const getVisitorIP = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return 'unknown';
    }
  }, []);

  const getDeviceType = useCallback((): 'mobile' | 'desktop' | 'tablet' => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/i.test(ua)) return 'mobile';
    return 'desktop';
  }, []);

  const isPwaInstalled = useCallback((): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeVisitorTracking = async () => {
      try {
        const [ip, deviceType, isPwa] = await Promise.all([
          getVisitorIP(),
          Promise.resolve(getDeviceType()),
          Promise.resolve(isPwaInstalled())
        ]);

        const visitorData: Partial<VisitorRecord> = {
          ip,
          userAgent: navigator.userAgent,
          deviceType,
          isPwaInstalled: isPwa,
          sessionId: sessionIdRef.current
        };

        const storedVisitorId = localStorage.getItem('visitorId');
        if (storedVisitorId) {
          const existingVisitor = await visitorApi.getVisitorBySessionId(sessionIdRef.current);
          if (existingVisitor) {
            const updatedVisitor = await visitorApi.upsertVisitor({
              ...visitorData,
              id: existingVisitor.id
            });
            if (isMounted) {
              setVisitor(updatedVisitor);
              setVisitorId(updatedVisitor.id);
            }
            return;
          }
        }

        const newVisitor = await visitorApi.upsertVisitor(visitorData);
        if (isMounted) {
          setVisitor(newVisitor);
          setVisitorId(newVisitor.id);
          localStorage.setItem('visitorId', newVisitor.id);
        }
      } catch (error) {
        console.error('Error initializing visitor tracking:', error);
      }
    };

    initializeVisitorTracking();

    return () => {
      isMounted = false;
    };
  }, [getVisitorIP, getDeviceType, isPwaInstalled]);

  const associateVisitorWithOrder = useCallback(async (orderId: string) => {
    if (visitorId) {
      try {
        await visitorApi.associateVisitorWithOrder(visitorId, orderId);
      } catch (error) {
        console.error('Error associating visitor with order:', error);
      }
    }
  }, [visitorId]);

  return { visitor, visitorId, sessionId: sessionIdRef.current, associateVisitorWithOrder };
};