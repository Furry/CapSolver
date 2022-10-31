import { GenericObject } from "../types.js";

export class APIError extends Error {
    public code: number;
    constructor(resp: GenericObject) {
        super(resp.errorCode);
        this.code = resp.errorId;
        this.message = resp.errorDescription;
    }
}