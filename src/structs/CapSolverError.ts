import { ErrorResponse, GenericObject } from "../types.js";

export class APIError extends Error {
    public code: number;
    constructor(resp: GenericObject) {
        super(resp.errorCode);
        this.code = resp.errorId;
        this.message = resp.errorDescription;
    }
}

export class SolveError extends Error {
    public code: number;
    public taskId: null | string = null;
    constructor(response: ErrorResponse) {
        super(response.errorDescription);
        this.code = response.errorId
        this.taskId = response.taskId ? response.taskId : null;
    }
}