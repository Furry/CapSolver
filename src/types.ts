import { APIError } from "./structs/CapSolverError.js";

export type SolveResult = { id: string, value: string };
export type GenericObject = { [key: string]: any };

export enum TaskType {
    ImageToText = "ImageToTextTask",

    ReCaptchaV2 = "ReCaptchaV2TaskProxyLess",
    ReCaptchaV2Proxied = "ReCaptchaV2Task",

    ReCaptchaV2Enterprise = "ReCaptchaV2EnterpriseTaskProxyless",
    ReCaptchaV2EnterpriseProxied = "ReCaptchaV2EnterpriseTask",

    ReCaptchaV3 = "ReCaptchaV3TaskProxyless",
    ReCaptchaV3Proxied = "ReCaptchaV3Task",

    HCaptcha = "HCaptchaTaskProxyless",
    HCaptchaProxied = "HCaptchaTask",
    HCaptchaClassification = "HCaptchaClassification"
}

export interface ErrorResponse {
    errorCode: string,
    errorDescription: string,
    errorId: 1,
    taskId?: string
}

export interface ReadyResponse {
    errorId: 0,
    status: Exclude<Status, "idle" | "processing" | "failed">,
    taskId: string,
    solution: {
        text: string
    }
}

export type Status = "idle" | "processing" | "ready" | "failed";
export interface SuccessResponse {
    errorId: 0,
    status: Exclude<Status, "ready">,
    taskId?: string,
}

export type Response = ErrorResponse | SuccessResponse | ReadyResponse;

export interface CaptchaResult {
    data: string,
    id: string | null
}

export interface PendingCaptcha {
    startTime: number,
    polls: number,
    id: string
}

// This was hell to implement.
export interface PendingCaptchaStorage extends PendingCaptcha {
    resolve: (value: CaptchaResult) => void,
    reject: (error?: APIError) => void,
    promise: Promise<CaptchaResult>
}

export interface ProxyOptions {
    proxyType: "HTTP" | "HTTPS" | "SOCKS4" | "SOCKS5",
    proxyAddress: string,
    proxyPort: number,
    proxyLogin?: string,
    proxyPassword?: string
}

export interface RecaptchaEnterpriseOptions extends RecaptchaV2Options {
    apiDomain?: string,
    enterprisePayload?: GenericObject
}

// Types unique for each solve request //
export interface RecaptchaV2Options {
    recaptchaDataSValue?: string,
    isInvisible?: string,
    userAgent?: string,
    cookies?: string
    proxy?: ProxyOptions
}

export interface RecaptchaV3Options {
    minScore?: 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9,
    proxy?: ProxyOptions,
    userAgent?: string,
    cookies?: string
}

export interface HCaptchaOptions {
    proxy?: ProxyOptions,
    enterprisePayload?: GenericObject,
    isEnterprise?: boolean,
    isInvisible?: boolean,
    userAgent?: string
}

export interface BalanceResult {
    balance: number,
    packages: GenericObject[]
}