import { formatTimeHM } from './util'


test("format 42845 as '11:54'", () => {
    expect(formatTimeHM(42845)).toBe('11:54')
})
