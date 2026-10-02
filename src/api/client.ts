export class ApiError extends Error {
  code: string;
  details: Record<string, any>;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details: Record<string, any> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export const apiClient = {
  async fetch(url: string, options: RequestInit = {}) {
    const res = await fetch(`/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Important to include cookies for auth
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Dispatch an event so the AuthContext can clear user and redirect to login
        window.dispatchEvent(new Event('unauthorized'));
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login?expired=1';
        }
      }
      
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        throw new ApiError(res.statusText, 'NETWORK_ERROR');
      }
      
      // Normalize our custom format vs FastAPI format
      if (errorData?.error) {
        throw new ApiError(errorData.error.message, errorData.error.code, errorData.error.details);
      } else if (errorData?.detail) {
        // FastAPI validation error format
        let msg = "Validation Error";
        if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          msg = errorData.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof errorData.detail === "string") {
          msg = errorData.detail;
        }
        throw new ApiError(msg, 'VALIDATION_ERROR', { detail: errorData.detail });
      }
      throw new ApiError(res.statusText);
    }
    
    return res.json();
  },
  
  async fetchMultipart(url: string, body: FormData) {
    const res = await fetch(`/api${url}`, {
      method: 'POST',
      body,
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login?expired=1';
        }
      }
      
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        throw new ApiError(res.statusText, 'NETWORK_ERROR');
      }
      
      if (errorData?.error) {
        throw new ApiError(errorData.error.message, errorData.error.code, errorData.error.details);
      } else if (errorData?.detail) {
        throw new ApiError(typeof errorData.detail === 'string' ? errorData.detail : "Validation Error", 'VALIDATION_ERROR', { detail: errorData.detail });
      }
      throw new ApiError(res.statusText);
    }
    
    return res.json();
  }
};
