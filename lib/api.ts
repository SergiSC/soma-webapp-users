import { HowDidYouFindUs } from "@/components/onboarding-process/context";

// API configuration
const SOMA_API_BASE_URL =
  process.env.NEXT_PUBLIC_SOMA_API_URL || "http://localhost:3001";

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public endpoint: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

// Request configuration interface
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Response interceptor type
type ResponseInterceptor<T = unknown> = (
  response: Response,
  data: T,
) => T | Promise<T>;

// Request interceptor type
type RequestInterceptor = (
  config: RequestInit,
) => RequestInit | Promise<RequestInit>;

// Generic API client with enhanced error handling and features
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authToken: string | null = null;

  constructor(
    baseURL: string,
    options: {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
    } = {},
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = options.timeout || 10000; // 10 seconds
    this.defaultRetries = options.retries || 3;
    this.defaultRetryDelay = options.retryDelay || 1000; // 1 second
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // Set authentication token (called from Auth0 context)
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Get authentication token
  private getAuthToken(): string | null {
    return this.authToken;
  }

  // Apply request interceptors
  private async applyRequestInterceptors(
    config: RequestInit,
  ): Promise<RequestInit> {
    let processedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  // Apply response interceptors
  private async applyResponseInterceptors<T>(
    response: Response,
    data: T,
  ): Promise<T> {
    let processedData: unknown = data;

    for (const interceptor of this.responseInterceptors) {
      processedData = await interceptor(response, processedData);
    }

    return processedData as T;
  }

  // Create timeout promise
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Request timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  // Sleep utility for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Enhanced request method with timeout, retries, and better error handling
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {},
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...requestOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;

    // Prepare base configuration
    let config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...requestOptions.headers,
      },
      ...requestOptions,
    };

    // Add authentication token if available
    const authToken = this.getAuthToken();
    if (authToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authToken}`,
      };
    }

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    let lastError: Error;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = this.createTimeoutPromise(timeout);

        // Make the request with timeout
        const response = await Promise.race([
          fetch(url, config),
          timeoutPromise,
        ]);

        // Handle response
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          let errorData: Record<string, unknown> = {};

          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              errorData = await response.json();
              errorMessage =
                (errorData as { message?: string; error?: string }).message ||
                (errorData as { message?: string; error?: string }).error ||
                errorMessage;
            }
          } catch {
            // If we can't parse error response, use default message
          }

          throw new ApiError(
            errorMessage,
            response.status,
            response.statusText,
            endpoint,
          );
        }

        // Parse response based on content type
        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text.trim() === "") {
            // Handle empty JSON responses
            data = {} as T;
          } else {
            data = JSON.parse(text);
          }
        } else {
          // Handle non-JSON responses (text, blob, etc.)
          data = (await response.text()) as unknown as T;
        }

        // Apply response interceptors
        data = await this.applyResponseInterceptors(response, data);

        return data;
      } catch (error) {
        lastError = error as Error;

        console.log("error", error);
        // Don't retry on certain errors
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          // Client errors (4xx) shouldn't be retried
          throw error;
        }

        // Don't retry on timeout errors
        if (error instanceof TimeoutError) {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === retries) {
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new NetworkError(`Network error: ${error.message}`, error);
          }
          throw lastError;
        }

        // Wait before retrying
        if (attempt < retries) {
          await this.sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Create API client instance with custom configuration
export const apiClient = new ApiClient(SOMA_API_BASE_URL, {
  timeout: 15000, // 15 seconds
  retries: 3,
  retryDelay: 1000,
});

// Add logging interceptor for development
if (process.env.NODE_ENV === "development") {
  apiClient.addRequestInterceptor((config) => {
    console.log("🚀 API Request:", {
      method: config.method,
      headers: config.headers,
    });
    return config;
  });

  apiClient.addResponseInterceptor((response, data) => {
    console.log("✅ API Response:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    return data;
  });
}

// Example API functions - replace with your actual endpoints
export const api = {
  // User-related endpoints
  users: {
    login: (credentials: LoginRequest) =>
      apiClient.post<User>("/users/login", {
        externalId: credentials.externalId,
        email: credentials.email,
        emailVerified: credentials.emailVerified,
      }),
    update: (user: Partial<User> & { id: string }) =>
      apiClient.patch<User>(`/users/${user.id}`, user),
  },
};

export enum UserType {
  TEACHER = "teacher",
  CLIENT = "client",
  ADMIN = "admin",
}

export interface User {
  id: string;
  externalId: string;
  type: UserType;
  name: string | null;
  surname: string | null;
  email: string;
  emailVerifiedAt: string | null;
  birthDate: string | null;
  languageCode: string;
  profileImageUrl: string | null;
  missedSessionsCount: number;
  onboardingCompletedAt: string | null;
  postalCode: string | null;
  howDidYouFindUs: HowDidYouFindUs | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}
export interface LoginRequest {
  externalId: string;
  email: string;
  emailVerified: boolean;
}
