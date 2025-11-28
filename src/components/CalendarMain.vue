<template>
  <main>
    <div id=left-column>
      <nav>
        <div>
          <d-button variant=text id=year-button v-show=!this.editYear
            @click=openEditYear>{{ this.yearAlias }}年</d-button>
          <d-input-number v-show=this.editYear @blur=changeYear v-model=this.inputYear ref=inputYear
            :min="this.calendar.yearRange[0]" :max="this.calendar.yearRange[1]" size=lg />
          <d-dropdown>
            <d-button variant=text id=month-button>{{ this.monthAliases[this.month] }}</d-button>
            <template #menu>
              <ul class=month-menu>
                <li class=menu-item v-for="(month, idx) in this.monthAliases"
                    :key=idx @click="this.changeMonth(idx)">
                  {{ month }}
                </li>
              </ul>
            </template>
          </d-dropdown>
          <d-button variant=text id=day-button v-show=!this.editDay
            @click=openEditDay>{{ this.appointedDays ? this.appointedDays[this.dayMonth - 1] : this.dayMonth }}日</d-button>
          <input type=date v-show=this.editDay ref=inputDay v-model="inputDate"
            @change="onDateChange" @blur="onDateBlur" />
        </div>
        <div id=buttons>
          <d-button-group>
            <d-button icon=icon-collapse :disabled="this.prevDisabled()" @click=prevPage />
            <d-button @click=backToday color=fake-icon>今</d-button>
            <d-button icon=icon-chevron-right :disabled="this.nextDisabled()" @click=nextPage />
          </d-button-group>
          <d-button icon=icon-setting @click="this.showSettings = !this.showSettings"/>
        </div>
      </nav>
      <CalendarDisplay 
        @click=this.dateClick @redraw=this.toggleHighlight
        :calendar=this.calendar
        :secondCalendar=this.secondCalendar
        :monthLength=this.monthLength
        :monthStart=this.monthStart
        :offset=this.offset
        :appointedDays=this.appointedDays
        :prevAppointedDays=this.prevAppointedDays
        :nextAppointedDays=this.nextAppointedDays
        :lastLength=this.lastLength />
    </div>
    <div id=right-column>
      <nav>{{ this.todayDifference }}</nav>
      <d-form v-show=this.showSettings>
        <d-form-item label="主显">
          <d-select v-model=this.calendarIdx @value-change=calendarChange>
            <d-option v-for="(i, idx) in allCalendars" :key=idx :value=idx :name=i.name />
          </d-select>
        </d-form-item>
        <d-form-item label="次显">
          <d-select v-model=this.secondCalendarIdx @value-change=calendarChange>
            <d-option v-for="(i, idx) in allCalendars" :key=idx :value=idx :name=i.name />
          </d-select>
        </d-form-item>
        <d-form-item :key=idx v-for="(o, idx) in this.calendarOptions" :label="o.name" >
          <d-switch v-model="o.value" v-if="typeof o.value == 'boolean'" @change="syncOptionToCalendar(idx)"></d-switch>
        </d-form-item>
      </d-form>
      <CalendarAside :day=this.day />
    </div>
  </main>
</template>

<script>
import CalendarDisplay from "@/components/CalendarDisplay.vue"
import CalendarAside from "@/components/CalendarAside.vue"

const calendarFiles = require.context('@/util/calendars', false, /\.js$/)
const calendarInstances = []

calendarFiles.keys().forEach(key => {
  const module = calendarFiles(key)
  const CalendarClass = module.default
  if (CalendarClass) {
    calendarInstances.push(new CalendarClass())
  }
})

function julianDayToday() {
  return 2440588 + Math.floor(new Date().getTime() / 86400000)
}

export default {
  name: 'CalendarMain',
  data() {
    return {
      calendarIdx: 0,
      secondCalendarIdx: 1,
      lastCalendarIdx: 0,
      lastSecondCalendarIdx: 1,
      year: 0,
      month: 0,
      dayMonth: 0,
      editYear: false,
      editDay: false,
      inputYear: 0,
      showSettings: false,
      day: julianDayToday(),
      monthLengths: new Array(),
      monthAliases: new Array(),
      lastLength: 0,
      monthLength: 0, 
      monthStart: 0,
      offset: 0,
      highlightBlock: null,
      calendarOptions: new Array(),
      allCalendars: calendarInstances,
      inputDate: '',
    }
  },
  methods: {
    isoFromJulian(jd) {
      if (!Number.isFinite(jd)) return ''
      const ms = (jd - 2440588) * 86400000
      const d = new Date(ms)
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth() + 1
      const day = d.getUTCDate()
      const yy = String(y).padStart(4, '0')
      return yy + '-' + String(m).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    },

    julianFromIso(iso) {
      if (!iso || typeof iso !== 'string') return NaN
      // accept YYYY-MM-DD, optionally with leading +/- for extended years
      const m = iso.match(/^([+-]?\d{1,6})-(\d{2})-(\d{2})$/)
      if (!m) return NaN
      const year = Number(m[1])
      const month = Number(m[2])
      const day = Number(m[3])
      if (!Number.isFinite(year) || month < 1 || month > 12 || day < 1 || day > 31) return NaN
      const ms = Date.UTC(year, month - 1, day)
      if (!Number.isFinite(ms)) return NaN
      return 2440588 + Math.floor(ms / 86400000)
    },
    openEditYear() {
      this.inputYear = this.year
      this.editYear = true
      this.$refs.inputYear.select()
    },
    openEditDay() {
      // initialize the native date input from current julian day
      this.inputDate = this.isoFromJulian(this.day)
      this.editDay = true
      this.$nextTick(() => {
        if (this.$refs.inputDay && this.$refs.inputDay.focus)
          this.$refs.inputDay.focus()
      })
    },
    onDateChange() {
      // parse ISO date (YYYY-MM-DD) and compute julian day
      const jd = this.julianFromIso(this.inputDate)
      if (Number.isFinite(jd)) {
        this.day = jd
        this.adjustWithJulian()
        this.toggleHighlight()
      }
      this.editDay = false
    },
    onDateBlur() {
      // apply change on blur too
      this.onDateChange()
    },
    changeYear() {
      this.year = this.inputYear
      this.adjustWithYmd()
      this.editYear = false
    },
    dateClick(e) {
      let target = e.target
      if (target && target.parentNode && target.parentNode.nodeName == 'TD')
        target = target.parentNode
      if (target && target.nodeName == 'TD') {
        this.dayMonth = +target.dataset.idx
        const classes = target.classList
        if (classes.contains('padded-left'))
          this.prevPage()
        else if (classes.contains('padded-right'))
          this.nextPage()
        else {
          if (this.highlightBlock)
            this.highlightBlock.classList.remove('highlight-block')
          this.day += this.dayMonth - this.highlightBlock.dataset.idx
          this.highlightBlock = target
          target.classList.add('highlight-block')
        }
      }
    },
    prevPage() {
      --this.month
      this.adjustWithYmd()
    },
    nextPage() {
      ++this.month
      this.adjustWithYmd()
    },
    changeMonth(idx) {
      this.month = idx
      this.adjustWithYmd()
    },
    toggleHighlight() {
      if (this.highlightBlock)
        this.highlightBlock.classList.remove('highlight-block')
      for (const i of document.getElementsByTagName('td')) {
        if (i.dataset.idx && i.dataset.idx == this.dayMonth &&
            !i.classList.contains('padded-left') && 
            !i.classList.contains('padded-right')) {
          this.highlightBlock = i
          i.classList.add('highlight-block')
          break
        }
      }
    },
    adjustMonthWithYear(monthDiff) {
      let { year, month, monthLengths } = this
      month += monthDiff
      while (month < 0) {
        monthLengths = this.calendar.monthLengths(--year)
        month += monthLengths.length
      }
      while (month >= monthLengths.length) {
        month -= monthLengths.length
        monthLengths = this.calendar.monthLengths(++year)
      }
      return { year, month, monthLengths }
    },
    adjustWithYmd() {
      const { year, month, monthLengths } = this.adjustMonthWithYear(0);
      [this.year, this.month, this.monthLengths] = [year, month, monthLengths];
      console.log(year, month, monthLengths)
      this.monthLength = this.monthLengths[this.month]
      this.day = this.calendar.julian(this.year, this.month, this.dayMonth)
      this.adjustCommon()
    },
    backToday() {
      this.day = julianDayToday()
      this.adjustWithJulian()
      this.toggleHighlight()
    },
    adjustWithJulian() {
      [this.year, this.month, this.dayMonth] = this.calendar.day(this.day)
      this.monthLengths = this.calendar.monthLengths(this.year)
      this.monthLength = this.monthLengths[this.month]
      this.adjustCommon()
    },
    adjustCommon() {
      const weekLength = this.calendar.weekdays.length
      this.monthStart = this.day - this.dayMonth + 1
      this.offset = ((this.monthStart + this.calendar.weekOffset) % weekLength + weekLength) % weekLength
      if (this.month == 0) {
        const lastLengths = this.calendar.monthLengths(this.year - 1)
        this.lastLength = lastLengths[lastLengths.length - 1]
      } else {
        this.lastLength = this.monthLengths[this.month - 1]
      }
    },
    prevDisabled() {
      return this.calendar.yearRange[0] == this.year && this.month == 0
    },
    nextDisabled() {
      return this.calendar.yearRange[1] == this.year && this.month == this.monthLengths.length - 1
    },
    calendarChange() {
      if (this.calendarIdx == this.secondCalendarIdx) {
        this.calendarIdx = this.lastSecondCalendarIdx
        this.secondCalendarIdx = this.lastCalendarIdx
      }
      this.lastCalendarIdx = this.calendarIdx
      this.lastSecondCalendarIdx = this.secondCalendarIdx
    },
    syncOptionToCalendar(idx) {
      // Sync reactive option value back to the calendar's plain options
      if (this.calendar.options && 
          this.calendar.options[idx] && 
          this.calendarOptions[idx]) {
        this.calendar.options[idx][1] = this.calendarOptions[idx].value
      }
    },
    loadCalendarOptions() {
      // Load calendar options into reactive state for Vue binding
      if (this.calendar.options && Array.isArray(this.calendar.options)) {
        this.calendarOptions = this.calendar.options
          .filter(o => Array.isArray(o) && o.length >= 2)
          .map(o => ({
            name: o[0],
            value: o[1]
          }))
      } else {
        this.calendarOptions = []
      }
    },
  },
  created() {
    this.backToday()
    this.loadCalendarOptions()
  },
  watch: {
    year() {
      this.monthAliases = this.calendar.monthAliases(this.year)
    },
    calendarIdx() {
      const oldYear = this.year
      const [ minYear, maxYear ] = this.calendar.yearRange
      this.adjustWithJulian()
      if (this.year < minYear) {
        this.year = minYear
        this.adjustWithYmd()
      } else if (this.year > maxYear) {
        this.year = maxYear
        this.adjustWithYmd()
      }
      if (this.year == oldYear)
        this.monthAliases = this.calendar.monthAliases(this.year)
      this.loadCalendarOptions()
    }
  },
  components: { CalendarDisplay, CalendarAside },
  computed: {
    calendar() {
      return this.allCalendars[this.calendarIdx]
    },
    secondCalendar() {
      return this.allCalendars[this.secondCalendarIdx]
    },
    yearAlias() {
      const aliasFunc = this.calendar.yearAlias
      return aliasFunc ? aliasFunc(this.year) : this.year
    },
    todayDifference () {
      function displayNumber(x) {
        return x > 9999 ? x.toLocaleString() : x
      }
      const diff = this.day - julianDayToday()
      if (diff > -3 && diff < 3)
        return ['前天', '昨天', '今天', '明天', '后天'][diff + 2]
      else if (diff < 0)
        return displayNumber(-diff) + ' 天前'
      else
        return displayNumber(diff) + ' 天后'
    },
    appointedDays() {
      return this.calendar.appointedDays ? this.calendar.appointedDays(this.year, this.month) : null
    },
    nextAppointedDays() {
      const { year, month } = this.adjustMonthWithYear(1)
      return this.calendar.appointedDays ? this.calendar.appointedDays(year, month) : null
    },
    prevAppointedDays() {
      const { year, month } = this.adjustMonthWithYear(-1)
      return this.calendar.appointedDays ? this.calendar.appointedDays(year, month) : null
    },
  }
}
</script>

<style>
ul {
  list-style: none;
}

body {
  background: var(--devui-global-bg);
}

main {
  max-width: 72em;
  display: grid;
  color: var(--devui-text);
}

#left-column {
  grid-area: 1 / 1;
}

#right-column {
  grid-area: 2 / 1;
}

#buttons {
  display: flex;
}

@media screen and (min-width: 720px) {
  #right-column {
    grid-area: 1 / 2;
    width: 16rem;
  }
}

table {
  border-spacing: 0.25em;
  table-layout: fixed;
  text-align: center;
  width: 100%;
  font-size: 0.875em;
  line-height: 1.25em;
}

table time {
  font-size: 1.5em;
  line-height: 1.75em;
}

td div {
  white-space: nowrap;
}

td {
  height: 3.5em;
}

nav {
  display: flex;
  padding: 0.5em 1em;
  justify-content: space-between;
  align-items: center;
}

#year-button .button-content, #month-button .button-content, #day-button .button-content {
  font-size: 1.25em;
}

.month-menu {
  padding: 0.5em;
  display: grid;
  grid-template-columns: repeat(4, 3em);
  text-align: center;
}

.menu-item:hover {
  background: var(--devui-list-item-hover-bg);
  cursor: pointer;
}

#right-column {
  padding: 0.25rem;
}

.devui-form {
  background: var(--devui-base-bg);
  border-radius: var(--devui-border-radius-card);
  padding: 1em;
}

.devui-button--outline--fake-icon:hover {   /* hack */
  background: var(--devui-list-item-hover-bg);
  color: var(--devui-brand-active);
}

.highlight-block {
  background: var(--devui-brand-active-focus);
  color: var(--devui-light-text);
  border-radius: 8px;
}

.caption-badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  border-radius: 0.5rem;
  border: 1px solid var(--devui-brand-active-focus);
  color: var(--devui-brand-active-focus);
  background: transparent;
  font-size: 0.9em;
}

/* When the cell is highlighted, make the badge match the highlighted text color */
.highlight-block .caption-badge {
  color: var(--devui-light-text);
  border-color: var(--devui-light-text);
}
</style>
