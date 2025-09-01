import Calendar from '@/util/Calendar.js';

class DefaultCalendar extends Calendar {
	name = '默认'
	weekOffset = 1
	weekdays = ['日', '一', '二', '三', '四', '五', '六']
	yearRange = [-271820, 275759]
	yearAlias(year) {
		return year > 0 ? year : '前' + (1 - year)
	}
	monthLengths(year) {
		let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
		if (year % 4 == 0 && (year % 100 != 0 || year % 16 == 0))
			days[1] = 29
		return days
	}
	monthAliases() {
		return Array.from({length: 12}, (_, i) => (1 + i + '月'))
	}
	day(day) {
		let timestamp = (day - 2440588) * 86400000
		let obj = new Date(timestamp)
		return [obj.getFullYear(), obj.getMonth(), obj.getDate()]
	}
	dayCaptions(start, count) {
		const result = new Array(count)
		for (var i = 0; i < count; ++i) {
			const [ , month, date ] = this.day(start + i)
			result[i] = date == 1 ? (1 + month) + '月🏕️' : date + '日'
		}
		return result
	}
	julian(year, month, date) {
		const obj = new Date()
		obj.setFullYear(year, month, date)
		const realTime = obj.getTime() - obj.getTimezoneOffset() * 60000
		return Math.floor(realTime / 86400000) + 2440588
	}
}

export default DefaultCalendar
