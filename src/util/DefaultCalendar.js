import Calendar from './Calendar.js';

class DefaultCalendar extends Calendar {
	name = 'defaultCalendar'
	weekOffset = 1
	weekLength() {
		return 7
	}
	monthLengths(year) {
		let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
		if (year % 4 == 0 && (year % 100 != 0 || year % 16 == 0))
			days[1] = 29
		return days
	}
	day(day) {
		let timestamp = (day - 2440588) * 86400000
		let obj = new Date(timestamp)
		return [obj.getFullYear(), obj.getMonth(), obj.getDate()]
	}
	dayCaptions(start, count) {
		for (var i = 0; i < count; ++i) {
			const [ , month, date ] = this.day(start + i)
			return (1 + month) + '月' + date + '日'
		}
	}
	julian(year, month, date) {
		const obj = new Date(year, month, date)
		const realTime = obj.getTime() - obj.getTimezoneOffset() * 60000
		return Math.floor(realTime / 86400000) + 2440588
	}
}

export default DefaultCalendar
