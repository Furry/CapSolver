import { GenericObject, TaskType, Response, RecaptchaV2Options, PendingCaptchaStorage, PendingCaptcha, CaptchaResult, ErrorResponse, Status, ReadyResponse, RecaptchaEnterpriseOptions, RecaptchaV3Options, HCaptchaOptions } from "../types.js";
import fetch from "../utils/fetch.js";
import { APIError, SolveError } from "./CapSolverError.js";

export default class Solver {
    private token: string;
    private _pending: { [key: string]: PendingCaptchaStorage } = {};
    private _processing: boolean = false;
    private _rates = 0;
    private _pollInterval: number;
    private _defaultPayload: GenericObject = { AppID: " " };

    constructor(token: string, pollInterval: number = 1000) {
        this.token = token;
        this._pollInterval = pollInterval;
    }

    private async createTask(taskType: TaskType, taskParams: GenericObject): Promise<CaptchaResult> {
        const body = {
            clientKey: this.token,
            task: {
                type: taskType,
                ...taskParams,
                ...this._defaultPayload
            }
        };

        const response = await fetch("https://api.capsolver.com/createTask", {
            method: "POST",
            body: JSON.stringify(body),
        }).then((res) => res.json()) as Response;

        if (response.errorId == 0) {
            switch ((response.status ? response.status : (response as any).state) as Status) {
                case "ready":
                    return {
                        id: response.taskId ? response.taskId : null,
                        data: (response as ReadyResponse).solution.text
                    }
                case "idle":
                case "processing":
                    return this.registerPollEntry(response.taskId as string);
                case "failed":
                default:
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

        const response = await fetch("https://api.capsolver.com/getTaskResult", {
            method: "POST",
            body: JSON.stringify(body)
        }).then((r) => r.json()) as Response;

        if (response.errorId == 0) {
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
                default: // Pass
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

        return captchaPromiseObject.promise;
    }

    /**
     * Gets all pending/outsanding captchas.
     * @returns The current list of all unsolved captchas.
     */
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
    // START OF ACCOUNT METHODS //
    //////////////////////////////

    /**
     * Gets the balance and package information of the account.
     * @returns The current balance of the account & any packages.
     */
    public async getBalance() {
        const body = {
            clientKey: this.token
        };

        const response = await fetch("https://api.capsolver.com/getBalance", {
            method: "POST",
            body: JSON.stringify(body)
        }).then((r) => r.json()) as Response;

        if (response.errorId == 0) {
            return {
                balance: (response as any).balance,
                packages: (response as any).packages
            };
        } else {
            throw new APIError(response);
        }
    }

    //////////////////////////////
    // START OF SOLVE FUNCTIONS //
    //////////////////////////////

    /**
     * Solves an image 
     * @param image The image to solve in base64 or Buffer format.
     * @returns CaptchaResult containing the solution text.
     */
    public imageToText(image: String | Buffer): Promise<CaptchaResult> {
        // If image is a buffer, convert it to a base64 string.
        if (image instanceof Buffer) {
            image = image.toString("base64");
        }

        return this.createTask(TaskType.ImageToText, { body: image });
    }

    /**
     * Solves a reCAPTCHA v2 with or without a proxy.
     * @param websiteUrl The URL of the website where the reCAPTCHA is located.
     * @param websiteKey The sitekey of the reCAPTCHA.
     * @param options An object containing additional options, including proxy.
     * @returns CaptchaResult containing the solution key.
     * @throws {SolveError}
     */
    public async recaptchaV2(websiteUrl: string, websiteKey: string, options: RecaptchaV2Options = {}) {
        const body = {
            websiteURL: websiteUrl,
            websiteKey: websiteKey,
            ...(options.proxy ? options.proxy : {}),
            ...options
        }

        
        let type = TaskType.ReCaptchaV2;
        if ((options as any).type == "enterprise") {
            type = body.proxy ? TaskType.ReCaptchaV2EnterpriseProxied : TaskType.ReCaptchaV2Enterprise
        } else {
            type = body.proxy ? TaskType.ReCaptchaV2Proxied : TaskType.ReCaptchaV2;
        }

        delete body.proxy;

        return this.createTask(type, body)
    }

    /**
     * Solves a reCAPTCHA v2 Enterprise with or without a proxy.
     * @param websiteUrl The URL of the website where the reCAPTCHA is located.
     * @param websiteKey The sitekey of the reCAPTCHA.
     * @param options An object containing additional options, including proxy & enterprise flags.
     * @returns CaptchaResult containing the solution key.
     * @throws {SolveError}
     */
    public async recaptchaV2Enterprise(websiteUrl: string, websiteKey: string, options: RecaptchaEnterpriseOptions = {}) {
        return this.recaptchaV2(websiteUrl, websiteKey, {
            ...options,
            type: "enterprise"
        } as any);
    }

    /**
     * Solves a reCAPTCHA v3 with or without a proxy.
     * @param websiteUrl The URL of the website where the reCAPTCHA is located.
     * @param websiteKey The sitekey of the reCAPTCHA.
     * @param pageAction The action value in the widget.
     * @param options An object containing additional options, including proxy & minScore.
     * @returns CaptchaResult containing the solution key.
     * @throws {SolveError}
     */
    public async recaptchaV3(websiteUrl: string, websiteKey: string, pageAction: string, options: RecaptchaV3Options = {}) {
        const body = {
            websiteURL: websiteUrl,
            websiteKey: websiteKey,
            pageAction: pageAction,
            ...(options.proxy ? options.proxy : {}),
            ...options
        }

        return this.createTask(body.proxy ? TaskType.ReCaptchaV3Proxied : TaskType.ReCaptchaV3, body) 
    }

    /**
     * Solves a hCaptcha with or without a proxy.
     * @param websiteUrl The URL of the website where the reCAPTCHA is located.
     * @param websiteKey The sitekey of the hcaptcha
     * @param options An object containing aditional options, including proxy.
     * @returns CaptchaResult containing solution key.
     * @throws {SolveError}
     */
    public async hcaptcha(websiteUrl: string, websiteKey: string, options: HCaptchaOptions) {
        const body = {
            websiteURL: websiteUrl,
            websiteKey: websiteKey,
            ...(options.proxy ? options.proxy : {}),
            ...options
        }

        return this.createTask(body.proxy ? TaskType.HCaptchaProxied : TaskType.HCaptcha, body)
    }

    /**
     * Classifies a list of images hcaptcha images to a given question.
     * @param queries An array of base64 encoded images or buffers. 
     * @param question The question to slove.
     * @param coordinate If coordnates are required in the response.
     * @returns CaptchaResult containing the response data.
     * @throws {SolveError}
     */
    public async hcaptchaClassification(queries: (Buffer | string)[], question: string, coordinate = false) {
        const body = {
            queries: queries[0] instanceof Buffer ? queries.map((q) => q.toString("base64")) : queries,
            question: question,
            coordinate: coordinate
        }

        return this.createTask(TaskType.HCaptchaClassification, body)
    }
}