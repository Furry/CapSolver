import { GenericObject, SolveResult, TaskType, Response, RecaptchaV2Options, PendingCaptchaStorage, PendingCaptcha, CaptchaResult } from "../types.js";
import fetch from "../utils/fetch.js";
import { APIError } from "./CaptchaAIError.js";

export default class Solver {
    private token: string;
    private _pending: { [key: string]: PendingCaptchaStorage } = {};
    private _interval: NodeJS.Timeout | null = null;

    constructor(token: string) {
        this.token = token;
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

        if (response.errorId == 0 && response.state == "ready") {
            return {
                id: response.taskId ? response.taskId : null,
                data: response.solution.text
            }
        } else {
            throw new APIError(response);
        }
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

        if (!this._interval) {
            this._interval = setInterval(() => {
                this.getSolutions();
            });
        }
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
    public imageToText(image: String | Buffer): Promise<string> {
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