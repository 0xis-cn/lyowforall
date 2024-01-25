import Calendar from './Calendar.js';

class HetesflusCalendar extends Calendar {
	name = '夏花历'
	weekOffset = 1
	weekLength = 7
	yearRange = [1, 6005]
	monthLengths(year) {
		let days = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30]
		if (year % 4 == 1 && (year % 100 != 77 || year % 16 == 5))
			days[11] = 31
		return days
	}
	yearAlias(year) {
		const a7 = 'tbpmfvd'.charAt(year % 7)
		const a11 = 'ZnlrgkNxjqS'.charAt(year % 11)
		const a13 = 'eDcszywhAaoiu'.charAt(year % 13)
		return [
			[a7,  a11, a13], [a7,  a13, a11], [a11, a7,  a13],
			[a11, a7,  a13], [a13, a7,  a11], [a13, a11, a7]
		][Math.floor(year / 1001)].join('')
	}
	monthAliases() {
		return ['春月', '收月', '祭月', '夏月', '航月', '酒月',
			'秋月', '种月', '雨月', '冬月', '寒月', '花月']
	}
	day(day) {
		if (day > 2299160) {
			day -= Math.floor((day - 2159410) / 146097)
			day += Math.floor((day - 2268984) / 36524)
			day += 10
		}
		const pos = (day + 1381) % 1461
		const y = Math.floor(pos / 365) + Math.floor((day + 1381) / 1461) * 4 - 2038
		if (pos == 1460) {
			return [y - 1, 11, 31]
		} else {
			const doy = pos % 365
			if (doy < 155)
				return [y, Math.floor(doy / 31), doy % 31 + 1]
			else
				return [y, Math.floor((doy - 155) / 30) + 5, (doy - 155) % 30 + 1]
		}
	}
	dayCaptions(start, count) {
		const result = new Array(count)
		for (var i = 0; i < count; ++i) {
			const [ , month, date ] = this.day(start + i)
			result[i] = date == 1 ? this.monthAliases()[month] + '1日' : date + '日'
		}
		return result
	}
	julian(year, month, date) {
		if (year > 4259 || year == 4259 && (month > 6 || month > 6 && date > 15)) {
			date -= 10 
			date += Math.floor((year - 3877) / 400)
			date -= Math.floor((year - 4177) / 100)
		}
		date += 30 * month + Math.min(month, 5)
		return (year - 1) * 365 + Math.floor((year + 2) / 4) + date + 743362
	}
}

export default HetesflusCalendar
