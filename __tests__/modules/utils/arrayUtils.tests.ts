import { ArrayView, getArrayView } from "../../../src/modules/core/utils/arrayUtils";

test('ArrayView: getter success', () => {
    var arr: number[] = [1, 5, 4, 3, 2];
    var view: ArrayView<number> = getArrayView(arr, 2, 3);

    expect(view.length).toBe(3)
    expect(view[0]).toBe(4);
});

test('ArrayView: setter success', () => {
    var arr: number[] = [1, 5, 4, 3, 2];
    var view: ArrayView<number> = getArrayView(arr, 2, 3);

    view[0] = 15;

    expect(view.length).toBe(3)
    expect(view[0]).toBe(15);
    expect(arr[2]).toBe(15);
});