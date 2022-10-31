import * as CaptchaAI from "../dist/index.js"
import dotenv from "dotenv"
import chai from "chai"

const { expect } = chai;

dotenv.config();

describe("recaptchaV2 Test", () => {
    it("Should return a recaptcha v2 solve string.", async () => {
        const solver = new CaptchaAI.Solver(process.env.APIKEY);

        // Solve the captcha
        const resp = await solver.recaptchaV2("https://patrickhlauke.github.io/recaptcha/", "6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5")

        console.log(resp)
    })
})