// Re-exports for ES5 ES6 interpolation.
export { default as Solver } from "./structs/Solver.js";

// Tests
import dotenv from "dotenv";
import Solver from "./structs/Solver.js";

dotenv.config();

(async () => {
    
    const solver = new Solver(process.env.APIKEY as string);

    // Solve the captcha
    const resp = await solver.recaptchaV2("https://patrickhlauke.github.io/recaptcha/", "6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5")

    console.log(resp)
})();