<template>
  <main>
    <div id=left-column>
      <nav>
        <div>
          <d-button variant=text id=year-button v-show=!this.editYear
            @click=openEditYear>{{ this.year }}</d-button>
          <d-input-number v-show=this.editYear @blur=changeYear v-model=this.inputYear ref=inputYear
            :min="this.calendar.yearRange[0]" :max="this.calendar.yearRange[1]" size=lg />&#8194;
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
        :calendar=this.calendar
        :secondCalendar=this.secondCalendar
        :monthLength=this.monthLength
        :monthStart=this.monthStart
        :offset=this.offset
        :lastLength=this.lastLength />
    </div>
    <div id=right-column>
      <ul id=settings v-show=this.showSettings>
        <li>主显<d-select v-model=this.calendarIdx @value-change=calendarChange>
          <d-option v-for="(i, idx) in allCalendars" :key=idx :value=idx :name=i.name />
        </d-select></li>
        <li>次显<d-select v-model=this.secondCalendarIdx @value-change=calendarChange>
          <d-option v-for="(i, idx) in allCalendars" :key=idx :value=idx :name=i.name />
        </d-select></li>
      </ul>
      <CalendarAside />
    </div>
  </main>
</template>

<script>
import CalendarDisplay from "@/components/CalendarDisplay.vue"
import CalendarAside from "@/components/CalendarAside.vue"

import DefaultCalendar from '@/util/DefaultCalendar.js'
const defaultCalendar = new DefaultCalendar()
import SeptimalCalendar from '@/util/SeptimalCalendar.js'
const septimalCalendar = new SeptimalCalendar()

function julianDayToday() {
  return 2440588 + Math.floor(new Date().getTime() / 86400000)
}

export default {
  name: 'CalendarMain',
  data() {
    return {
      calendarIdx: 0, secondCalendarIdx: 1, lastCalendarIdx: 0, lastSecondCalendarIdx: 1,
      year: 0, month: 0, title: 0, editYear: false, inputYear: 0, showSettings: false,
      day: julianDayToday(), monthLengths: new Array(), monthAliases: new Array(),
      lastLength: 0, monthLength: 0, monthStart: 0, offset: 0,
    }
  },
  methods: {
    openEditYear() {
      this.inputYear = this.year
      this.editYear = true
      this.$refs.inputYear.select()
    },
    changeYear() {
      this.year = this.inputYear
      this.adjustWithYmd()
      this.editYear = false
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
    adjustWithYmd() {
      while (this.month < 0) {
        this.monthLengths = this.calendar.monthLengths(--this.year)
        this.month += this.monthLengths.length
      }
      this.monthLengths = this.calendar.monthLengths(this.year)
      while (this.month >= this.monthLengths.length) {
        this.month -= this.monthLengths.length
        this.monthLengths = this.calendar.monthLengths(++this.year)
      }
      this.monthLength = this.monthLengths[this.month]
      this.day = this.calendar.julian(this.year, this.month, this.title)
      this.adjustCommon()
    },
    backToday() {
      this.day = julianDayToday()
      this.adjustWithJulian()
    },
    adjustWithJulian() {
      [this.year, this.month, this.title] = this.calendar.day(this.day)
      this.monthLengths = this.calendar.monthLengths(this.year)
      this.monthLength = this.monthLengths[this.month]
      this.adjustCommon()
    },
    adjustCommon() {
      const weekLength = this.calendar.weekLength
      this.monthStart = this.day - this.title + 1
      this.offset = (this.monthStart + this.calendar.weekOffset) % weekLength
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
  },
  created() {
    this.backToday()
  },
  watch: {
    year() {
      this.monthAliases = this.calendar.monthAliases(this.year)
    },
    calendarIdx() {
      this.adjustWithJulian()
      const [ minYear, maxYear ] = this.calendar.yearRange
      if (this.year < minYear) {
        this.year = minYear
        this.adjustWithYmd()
      } else if (this.year > maxYear) {
        this.year = maxYear
        this.adjustWithYmd()
      }
    }
  },
  components: { CalendarDisplay, CalendarAside },
  computed: {
    allCalendars() {
      return [defaultCalendar, septimalCalendar] // TODO: 拆至独立文件
    },
    calendar() {
      return this.allCalendars[this.calendarIdx]
    },
    secondCalendar() {
      return this.allCalendars[this.secondCalendarIdx]
    }
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

nav {
  display: flex;
  padding: 0.5em 2em;
  justify-content: space-between;
  align-items: center;
}

#year-button .button-content, #month-button .button-content {
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

#settings {
  background: var(--devui-base-bg);
  border-radius: var(--devui-border-radius-card);
}

#settings li {
  padding: 0.5rem;
}

.devui-button--outline--fake-icon:hover {   /* hack */
  background: var(--devui-list-item-hover-bg);
  color: var(--devui-brand-active);
}
</style>
