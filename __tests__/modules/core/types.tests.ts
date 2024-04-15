import { isOfClass } from "../../../src/modules/core/types";

test('isOfClass: direct test success', () => {
    class Test {};
    var x: Test = new Test();
    expect(isOfClass(x, Test)).toBe(true);
});

test('isOfClass: direct test failure', () => {
    class Test {};
    class Test2 {};
    var x: Test = new Test();
    expect(isOfClass(x, Function)).toBe(false);
    expect(isOfClass(x, Test2)).toBe(false);
});

test('isOfClass: prototype chain success', () => {
    class Test {
        test: number;
        constructor() {
            this.test = 3;
        }
    };
    class TestChild extends Test {
        test2: number;
        constructor() {
            super();
            this.test2 = 5;
        }
    };
    var x: TestChild = new TestChild();
    expect(isOfClass(x, Test)).toBe(true);
});

test('isOfClass: prototype chain failure', () => {
    class Test {};
    class TestChild extends Test {};
    class Test2 {};
    class TestChild2 extends Test2 {};
    var x: TestChild2 = new TestChild2();
    expect(isOfClass(x, TestChild)).toBe(false);
    expect(isOfClass(x, Test)).toBe(false);
});

test('isOfClass: is parent child test', () => {
    class Test {};
    class TestChild extends Test {};
    var x: Test = new Test();
    expect(isOfClass(x, TestChild)).toBe(false);
});