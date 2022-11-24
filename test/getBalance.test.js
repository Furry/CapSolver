import * as CapSolver from "../dist/index.js"
import dotenv from "dotenv"
import chai from "chai"

const { expect } = chai;

dotenv.config();

describe("getBalance", () => {
    const solver = new CapSolver.Solver(process.env.APIKEY);
    it("Should have a balance parameter of 0 or greater", async () => {
        const resp = await solver.getBalance()
        expect(
            resp.balance
        ).to.be.greaterThanOrEqual(0)
    })

    it("Should contain an array of packages", async () => {
        const solver = new CapSolver.Solver(process.env.APIKEY);
        const resp = await solver.getBalance()
        expect(
            resp.packages
        ).to.be.an("array")
    })
})