import * as CaptchaAI from "../dist/index.js"
import dotenv from "dotenv"
import chai from "chai"
import { APIError } from "../dist/structs/CaptchaAIError.js";

const { expect } = chai;

dotenv.config();

describe("recaptchaV2 Test", () => {
    const solver = new CaptchaAI.Solver(process.env.APIKEY);

    it("Should return a recaptcha v2 solve string.", async () => {
        try {
            const resp = await solver.recaptchaV2("https://patrickhlauke.github.io/recaptcha/", "6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5")
            expect(resp.data).to.be.a("string")
        } catch (e) {
            expect(e).to.be.instanceOf(APIError)
        }
    })
})