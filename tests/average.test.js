const average = require('../utils/for_testing').average

describe('average', () => {
	test('of one value is the value itself', () => {
		expect(average([1])).toBe(1)
	})
	test('of many is calculated right', () => {
		expect(average([1, 3, 5])).toBe(3)
	})
	test('of empty array is 0', () => {
		expect(average([])).toBe(0)
	})
})