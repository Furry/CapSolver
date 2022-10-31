import { GenericObject, SolveResult, TaskType, Response, RecaptchaV2Options, PendingCaptchaStorage, PendingCaptcha, CaptchaResult, ErrorResponse } from "../types.js";
import fetch from "../utils/fetch.js";
import { APIError, SolveError } from "./CaptchaAIError.js";

export default class Solver {
    private token: string;
    private _pending: { [key: string]: PendingCaptchaStorage } = {};
    private _processing: boolean = false;
    private _rates = 0;
    private _pollInterval: number;

    constructor(token: string, pollInterval: number = 1000) {
        this.token = token;
        this._pollInterval = pollInterval;
    }

    private async createTask(taskType: TaskType, taskParams: GenericObject): Promise<CaptchaResult> {
        const body = {
            clientKey: this.token,
            task: {
                type: taskType,
                ...taskParams
            }
        };

        const response = await fetch("https://api.captchaai.io/createTask", {
            method: "POST",
            body: JSON.stringify(body),
        }).then((res) => res.json()) as Response;

        if (response.errorId == 0) {
            switch (response.status) {
                case "ready":
                    return {
                        id: response.taskId ? response.taskId : null,
                        data: response.solution.text
                    }
                case "idle":
                case "processing":
                    console.log("Returning poll entry")
                    return this.registerPollEntry(response.taskId as string);
                case "failed":
                    console.log("failed i guess?")
                default:
                    console.log("Hit Default")
                    return null as any;
            } 
        } else {
            throw new APIError(response);
        }
    }


    private async getTaskResult(p: PendingCaptchaStorage) {
        const body = {
            clientKey: this.token,
            taskId: p.id
        };

        const response = await fetch("https://api.captchaai.io/getTaskResult", {
            method: "POST",
            body: JSON.stringify(body)
        }).then((r) => r.json()) as Response;

        if (response.errorId == 0) {
            console.log(response)
            switch (response.status) {
                case "ready":
                    delete this._pending[p.id];
                    return {
                        id: response.taskId ? response.taskId : null,
                        data: response.solution.text
                    }
                case "failed":
                    delete this._pending[p.id];
                    throw new SolveError(response as unknown as ErrorResponse);
                case "idle":
                case "processing":
                default:
                    // Pass
            } 
        } else {
            delete this._pending[p.id];
            throw new APIError(response);
        }
    }

    private async getSolutions() {
        this._rates++;

        while (Object.keys(this._pending).length > 0) {
            // Filter '_pending' by oldest.
            let pending = Object.keys(this._pending).sort((a, b) => {
                return this._pending[a].startTime - this._pending[b].startTime;
            });

            // Get the oldest pending captcha.
            for (const c of pending) {
                const captcha = this._pending[c];

                // Increment the polls.
                captcha.polls++;
                await this.getTaskResult(captcha);
                console.log("Sleeping..")
                await new Promise((resolve) => setTimeout(resolve, this._pollInterval));
            }
        }

        this._processing = false;
    }

    public async registerPollEntry(id: string): Promise<CaptchaResult> {
        const captchaPromiseObject: PendingCaptchaStorage = {
            startTime: Date.now(),
            id: id,
            polls: 0,
        } as any;

        captchaPromiseObject.promise = new Promise<CaptchaResult>((resolve, reject) => {
            captchaPromiseObject.resolve = resolve;
            captchaPromiseObject.reject = reject;
        });

        // Add the promise to the pending cache.
        this._pending[id] = captchaPromiseObject;

        if (this._processing == false) {
            this._processing = true;
            this.getSolutions();
        }

        console.log("Returning promise")
        return captchaPromiseObject.promise;
    }

    public getPending(): PendingCaptcha[] {
        const pendingCache: PendingCaptcha[] = [];

        // Shallow clone isn't enough, so they need to be iterated manually.
        for (const pending of Object.keys(this._pending)) {
            const c = this._pending[pending];
            pendingCache.push({
                id: c.id,
                polls: c.polls,
                startTime: c.startTime
            });
        }

        return pendingCache;
    }

    //////////////////////////////
    // START OF SOLVE FUNCTIONS //
    //////////////////////////////
    public imageToText(image: String | Buffer): Promise<CaptchaResult> {
        // If image is a buffer, convert it to a base64 string.
        if (image instanceof Buffer) {
            image = image.toString("base64");
        }

        return this.createTask(TaskType.ImageToText, { body: image });
    }

    public async recaptchaV2(websiteUrl: string, websiteKey: string, options: RecaptchaV2Options = {}) {
        return this.createTask(TaskType.RecaptchaV2, {
            websiteURL: websiteUrl,
            websiteKey: websiteKey,
            ...options
        })
    }
}