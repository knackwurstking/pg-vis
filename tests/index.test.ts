import { convert } from "../src";

describe("testing fixFormatString function", () => {
    test(`test: 24"X24"`, () => {
        expect(convert.fixFormatString(`24"X24"`)).toBe(`24"X24"`);
    });
});

describe("testing fixFormatString function", () => {
    test(`test: 60X120`, () => {
        expect(convert.fixFormatString(`60X120`)).toBe(`120X60`);
    });
});

describe("testing fixFormatString function", () => {
    test(`test: 120X60`, () => {
        expect(convert.fixFormatString(`120X60`)).toBe(`120X60`);
    });
});

describe("testing fixFormatString function", () => {
    test(`test: 150X75`, () => {
        expect(convert.fixFormatString(`150X75`)).toBe(`150X75`);
    });
});

describe("testing fixFormatString function", () => {
    test(`test: 75X150`, () => {
        expect(convert.fixFormatString(`75X150`)).toBe(`150X75`);
    });
});

describe("testing fixFormatString function", () => {
    test(`test: 100x100X2`, () => {
        expect(convert.fixFormatString(`100X100X2`)).toBe(`100X100X2`);
    });
});
