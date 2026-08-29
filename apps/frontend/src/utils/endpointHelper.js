/**
 * Endpoint helper for dynamic URL resolution across Local Development and Cloud PaaS (Render / Docker)
 */

export const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

export const getInsurerPortalUrl = (code, port) => {
  if (isLocalEnvironment()) {
    return `http://localhost:${port}/quote`;
  }
  const slug = code.replace('_', '-');
  return `/${slug}/quote`;
};

export const getInsurerAutofillUrl = (code, port, params) => {
  const base = getInsurerPortalUrl(code, port);
  return `${base}?${params.toString()}`;
};

export const getInsurerNotificationEndpoints = () => {
  if (isLocalEnvironment()) {
    return [
      'http://127.0.0.1:9001/api/notifications',
      'http://127.0.0.1:9002/api/notifications',
      'http://127.0.0.1:9003/api/notifications',
      'http://127.0.0.1:9004/api/notifications',
    ];
  }
  return [
    '/insurer-a/api/notifications',
    '/insurer-b/api/notifications',
    '/insurer-c/api/notifications',
    '/insurer-d/api/notifications',
  ];
};

export const getBackendBaseUrl = () => {
  if (isLocalEnvironment()) {
    return 'http://127.0.0.1:8000';
  }
  return '';
};
