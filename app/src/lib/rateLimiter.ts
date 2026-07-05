/**
 * Client-side rate limiter using localStorage to limit spamming attempts
 */
export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const storageKey = `rate_limit_${key}`;
  const attemptsData = localStorage.getItem(storageKey);
  
  let attempts: number[] = [];
  if (attemptsData) {
    try {
      attempts = JSON.parse(attemptsData).filter((timestamp: number) => now - timestamp < windowMs);
    } catch (e) {
      attempts = [];
    }
  }
  
  if (attempts.length >= maxAttempts) {
    const oldestAttempt = attempts[0];
    const retryAfter = Math.ceil((oldestAttempt + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  attempts.push(now);
  localStorage.setItem(storageKey, JSON.stringify(attempts));
  return { allowed: true };
}
