<template>
  <button @click=prevPage>上翻</button>
  <button @click=nextPage>下翻</button>
  <CalendarDisplay 
    :calendar=this.calendar
    :secondCalendar=this.secondCalendar
    :monthLength=this.monthLength
    :monthStart=this.monthStart
    :offset=this.offset
    :lastLength=this.lastLength />
</template>

<script>
import DefaultCalendar from '@/util/DefaultCalendar.js'
const defaultCalendar = new DefaultCalendar()
import SeptimalCalendar from '@/util/SeptimalCalendar.js'
const septimalCalendar = new SeptimalCalendar()
import CalendarDisplay from "@/components/CalendarDisplay.vue"

function julianDayToday() {
  return 2440588 + Math.floor(new Date().getTime() / 86400000)
}

export default {
  name: 'CalendarMain',
  props: {
    calendar: { type: Object, default: defaultCalendar }
  },
  data() {
    return {
      secondCalendar: septimalCalendar,
      year: 0,    month: 0,   title: 0,   // 翻月时 title 不变 day 变
      day: julianDayToday(),  monthLengths: new Array(),
      lastLength: 0, monthLength: 0, monthStart: 0, offset: 0,
    }
  },
  methods: {
    prevPage() {
      --this.month
      console.log(this.year, this.month)
      this.boundary()
      console.log(this.year, this.month)
    },
    nextPage() {
      ++this.month
      console.log(this.year, this.month)
      this.boundary()
      console.log(this.year, this.month)
    },
    boundary() {
      while (this.month < 0) {
        this.monthLengths = this.calendar.monthLengths(--this.year)
        this.month += this.monthLengths.length
      }
      this.monthLengths = this.calendar.monthLengths(this.year)
      while (this.month >= this.monthLengths.length) {
        this.month -= this.monthLengths.length
        this.monthLengths = this.calendar.monthLengths(++this.year)
      }
      const weekLength = this.calendar.weekLength()
      this.monthLength = this.monthLengths[this.month]
      console.log(this.day)
      this.day = this.calendar.julian(this.year, this.month, this.title)
      console.log(this.title, this.month, this.year)
      console.log(this.day)
      this.monthStart = this.day - this.title + 1
      this.offset = (this.monthStart + this.calendar.weekOffset) % weekLength
      if (this.month == 0) {
        const lastLengths = this.calendar.monthLengths(this.year - 1)
        this.lastLength = lastLengths[lastLengths.length - 1]
      } else {
        this.lastLength = this.monthLengths[this.month - 1]
      }
    },
  },
  created() {
    [this.year, this.month, this.title] = this.calendar.day(this.day)
    // TODO: 判定被除数为负
    this.boundary()
  },
  components: { CalendarDisplay }
}
</script>

<style>
</style>
