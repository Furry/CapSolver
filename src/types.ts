import { APIError } from "./structs/CaptchaAIError.js";

export type SolveResult = { id: string, value: string };
export type GenericObject = { [key: string]: any };

export enum TaskType {
    ImageToText = "ImageToTextTask",
    RecaptchaV2 = "ReCaptchaV2TaskProxyLess"
}


export interface ErrorResponse {
    errorCode: string,
    errorDescription: string,
    errorId: 1,
    taskId?: string
}

export interface ReadyResponse {
    errorId: 0,
    status: "ready",
    taskId: string,
    solution: {
        text: string
    }
}
export interface SuccessResponse {
    errorId: 0,
    status: "idle" | "processing" | "failed",
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

// Types unique for each solve request //
export interface RecaptchaV2Options {
    recaptchaDataSValue?: string,
    isInvisible?: string,
    userAgent?: string,
    cookies?: string
}