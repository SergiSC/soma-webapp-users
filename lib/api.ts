// API configuration
const SOMA_API_BASE_URL =
  process.env.NEXT_PUBLIC_SOMA_API_URL || "http://localhost:3001";

// Request configuration interface
interface RequestConfig extends RequestInit {
  timeout?: number;
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
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authToken: string | null = null;

  constructor(
    baseURL: string,
    options: {
      timeout?: number;
    } = {},
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = options.timeout || 10000; // 10 seconds
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

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {},
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...requestOptions } = options;

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

    try {
      const response = await Promise.race([
        fetch(url, config),
        this.createTimeoutPromise(timeout),
      ]);

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        }
        throw ApiError.fromJson(response.status, errorData);
      }

      // Parse response based on content type
      const contentType = response.headers.get("content-type");
      let data: T;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text.trim() === "") {
          data = {} as T;
        } else {
          data = JSON.parse(text);
        }
      } else {
        data = (await response.text()) as unknown as T;
      }

      return await this.applyResponseInterceptors(response, data);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError(`Network error: ${error.message}`, error);
      }
      throw error;
    }
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

// Custom error classes for better error handling
export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode: number;
  details: Record<string, unknown>;
  catalanMessage: string;
  constructor(
    message: string,
    code: ApiErrorCode,
    statusCode: number,
    details: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.catalanMessage = statusCodeMap[code];
  }

  static fromJson(statusCode: number, json: Record<string, unknown>): ApiError {
    //ensure code is a valid ApiErrorCode without assertion (as enum)
    if (!Object.values(ApiErrorCode).includes(json.code as ApiErrorCode)) {
      throw new Error(`Invalid API error code: ${json.code}`);
    }
    const code = json.code as ApiErrorCode;
    const message = json.message as string;
    const details = json.details as Record<string, unknown>;
    return new ApiError(message, code, statusCode, details);
  }
}

enum ApiErrorCode {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  CONFLICT = "CONFLICT",
  PRECONDITION_FAILED = "PRECONDITION_FAILED",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",

  // Reservations
  ACCUMULATED_SESSION_NOT_FOUND = "ACCUMULATED_SESSION_NOT_FOUND",
  ACCUMULATED_SESSION_NOT_PENDING = "ACCUMULATED_SESSION_NOT_PENDING",
  ACCUMULATED_SESSION_EXPIRED = "ACCUMULATED_SESSION_EXPIRED",
  SESSION_CANCELLED = "SESSION_CANCELLED",
  SESSION_COMPLETED = "SESSION_COMPLETED",
  ROOM_FULL = "ROOM_FULL",
  INVALID_PRODUCT_TYPE = "INVALID_PRODUCT_TYPE",
  PACK_NOT_FOUND = "PACK_NOT_FOUND",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  SUBSCRIPTION_NOT_FOUND = "SUBSCRIPTION_NOT_FOUND",
  COMBO_NOT_FOUND = "COMBO_NOT_FOUND",
  SUBSCRIPTION_NOT_ACTIVE = "SUBSCRIPTION_NOT_ACTIVE",
  SESSION_SEVEN_HOUR_BEFORE_START = "SESSION_SEVEN_HOUR_BEFORE_START",
  SESSION_THIRTY_MINUTES_BEFORE_START = "SESSION_THIRTY_MINUTES_BEFORE_START",
  RESERVATION_ALREADY_EXISTS_FOR_DATE = "RESERVATION_ALREADY_EXISTS_FOR_DATE",
  PACK_ALREADY_AT_MAX_RESERVATIONS = "PACK_ALREADY_AT_MAX_RESERVATIONS",
}

const statusCodeMap: Record<ApiErrorCode, string> = {
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: "Error intern del servidor",
  [ApiErrorCode.BAD_REQUEST]: "Petició incorrecta",
  [ApiErrorCode.UNAUTHORIZED]: "No autorizat",
  [ApiErrorCode.FORBIDDEN]: "Prohibit",
  [ApiErrorCode.NOT_FOUND]: "No trobat",
  [ApiErrorCode.METHOD_NOT_ALLOWED]: "Mètode no permès",
  [ApiErrorCode.CONFLICT]: "Conflicte",
  [ApiErrorCode.PRECONDITION_FAILED]: "Precondició fallida",
  [ApiErrorCode.PAYLOAD_TOO_LARGE]: "Carrega útil massa gran",
  [ApiErrorCode.UNPROCESSABLE_ENTITY]: "Entitat no processable",
  [ApiErrorCode.ACCUMULATED_SESSION_NOT_FOUND]: "Sessió acumulada no trobada",
  [ApiErrorCode.ACCUMULATED_SESSION_NOT_PENDING]: "Sessió acumulada no pendent",
  [ApiErrorCode.ACCUMULATED_SESSION_EXPIRED]: "Sessió acumulada expirada",
  [ApiErrorCode.SESSION_CANCELLED]: "Sessió cancel·lada",
  [ApiErrorCode.SESSION_COMPLETED]: "Sessió completada",
  [ApiErrorCode.ROOM_FULL]: "Sala plena",
  [ApiErrorCode.INVALID_PRODUCT_TYPE]:
    "Aquest producte no és vàlid per aquest tipus de classe",
  [ApiErrorCode.PACK_NOT_FOUND]: "Pack no trobat",
  [ApiErrorCode.PRODUCT_NOT_FOUND]: "Producte no trobat",
  [ApiErrorCode.SUBSCRIPTION_NOT_FOUND]: "Subscripció no trobada",
  [ApiErrorCode.COMBO_NOT_FOUND]: "Subscripció combo no trobat",
  [ApiErrorCode.SUBSCRIPTION_NOT_ACTIVE]: "Subscripció no activa",
  [ApiErrorCode.SESSION_SEVEN_HOUR_BEFORE_START]:
    "Les sessions de primera hora s'han de reservar el dia anterior",
  [ApiErrorCode.SESSION_THIRTY_MINUTES_BEFORE_START]:
    "La reserva ha de ser feta com a mínim 30 minuts abans de l'inici de la classe",
  [ApiErrorCode.RESERVATION_ALREADY_EXISTS_FOR_DATE]:
    "Ja existeix una reserva per aquesta dia",
  [ApiErrorCode.PACK_ALREADY_AT_MAX_RESERVATIONS]:
    "Ja has gastat totes les teves classes disponibles",
};

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
