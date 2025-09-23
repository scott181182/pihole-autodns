import { describe, it, expect } from "bun:test"
import { diffArrays } from "./utils"


describe("diffArrays", () => {
    it("should show no difference between similar arrays", () => {
        const res1 = diffArrays([],[]);
        expect(res1.add).toBeEmpty();
        expect(res1.remove).toBeEmpty();

        const res2 = diffArrays(["test"],["test"]);
        expect(res2.add).toBeEmpty();
        expect(res2.remove).toBeEmpty();

        const res3 = diffArrays(["test1", "test2"],["test2", "test1"]);
        expect(res3.add).toBeEmpty();
        expect(res3.remove).toBeEmpty();
    });

    it("should calculate additions", () => {
        const res1 = diffArrays([],["t1", "t2"]);
        expect(res1.add).toEqual(new Set(["t1", "t2"]));
        expect(res1.remove).toBeEmpty();
    });

    it("should calculate removals", () => {
        const res1 = diffArrays(["t1", "t2"],[]);
        expect(res1.add).toBeEmpty();
        expect(res1.remove).toEqual(new Set(["t1", "t2"]));
    });

    it("should calculate additions and removals", () => {
        const res1 = diffArrays(["t1", "t2", "t3", "t4"],["t1", "t2", "t5", "t4", "t6"]);
        expect(res1.add).toEqual(new Set(["t5", "t6"]));
        expect(res1.remove).toEqual(new Set(["t3"]));
    });
});
