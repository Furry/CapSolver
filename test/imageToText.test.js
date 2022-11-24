import * as CapSolver from "../dist/index.js"
import dotenv from "dotenv"
import fs from "fs";
import chai from "chai"

const { expect } = chai;

dotenv.config();

describe("imageToText", () => {
    const solver = new CapSolver.Solver(process.env.APIKEY);

    it("Should return a string containing the predicted characters.", async () => {
        // Read the image as a base64 string from "./resources/textImage.png"
        const b64Image = fs.readFileSync("./test/resources/testImage.png", "base64");
        const bufferImage = Buffer.from(b64Image, "base64");

        // Solve the captcha
        const results = await Promise.all([
            solver.imageToText(b64Image),
            solver.imageToText(bufferImage)
        ])

        expect(
            // results.filter(x => x.toLowerCase() == "w68hp").length
            results.length
        ).to.equal(2);
    })
})