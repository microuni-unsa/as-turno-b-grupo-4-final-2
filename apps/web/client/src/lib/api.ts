import { API_ENDPOINTS } from "@/lib/constants";
import type {
  AuthLoginResponse,
  AuthMeResponse,
  BrandingConfig,
  CreateSecretResponse,
  FilesListResponse,
  MirrorDocsResponse,
  MirrorExcerptResponse,
  SecretsListResponse,
  SessionExportResponse,
  SessionsListResponse,
  SubmitSecretResponse,
  SystemStatusResponse,
  UploadedFileRecord,
} from "@/types/protocol";

export class ApiRequestError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      if (typeof payload.error === "string" && payload.error.length > 0) {
        errorMessage = payload.error;
      } else if (typeof payload.message === "string" && payload.message.length > 0) {
        errorMessage = payload.message;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text.trim().length > 0) {
        errorMessage = text.trim();
      }
    }
    throw new ApiRequestError(response.status, errorMessage);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  getBranding(): Promise<BrandingConfig> {
    return requestJson<BrandingConfig>(API_ENDPOINTS.branding);
  },

  getAuthMe(): Promise<AuthMeResponse> {
    return requestJson<AuthMeResponse>(API_ENDPOINTS.authMe);
  },

  login(token: string): Promise<AuthLoginResponse> {
    return requestJson<AuthLoginResponse>(API_ENDPOINTS.authLogin, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  logout(): Promise<{ ok: true }> {
    return requestJson<{ ok: true }>(API_ENDPOINTS.authLogout, {
      method: "POST",
    });
  },

  getSessions(): Promise<SessionsListResponse> {
    return requestJson<SessionsListResponse>(API_ENDPOINTS.sessions);
  },

  exportSession(): Promise<SessionExportResponse> {
    return requestJson<SessionExportResponse>(API_ENDPOINTS.sessionsExport, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  uploadFile(file: File): Promise<UploadedFileRecord> {
    const formData = new FormData();
    formData.append("file", file);
    return requestJson<UploadedFileRecord>(API_ENDPOINTS.uploads, {
      method: "POST",
      body: formData,
    });
  },

  getFiles(): Promise<FilesListResponse> {
    return requestJson<FilesListResponse>(API_ENDPOINTS.files);
  },

  getSecrets(): Promise<SecretsListResponse> {
    return requestJson<SecretsListResponse>(API_ENDPOINTS.secrets);
  },

  createSecret(input: {
    label: string;
    secretValue: string;
    scope: string;
  }): Promise<CreateSecretResponse> {
    return requestJson<CreateSecretResponse>(API_ENDPOINTS.secrets, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  submitSecretRequest(token: string, secretValue: string): Promise<SubmitSecretResponse> {
    return requestJson<SubmitSecretResponse>(API_ENDPOINTS.secretSubmit(token), {
      method: "POST",
      body: JSON.stringify({ secretValue }),
    });
  },

  getStatus(): Promise<SystemStatusResponse> {
    return requestJson<SystemStatusResponse>(API_ENDPOINTS.status);
  },

  getMirrorDocs(): Promise<MirrorDocsResponse> {
    return requestJson<MirrorDocsResponse>(API_ENDPOINTS.mirrorDocs);
  },

  getMirrorExcerpt(doc: string, ver: string, lines: string): Promise<MirrorExcerptResponse> {
    return requestJson<MirrorExcerptResponse>(API_ENDPOINTS.mirrorExcerpt(doc, ver, lines));
  },
};
