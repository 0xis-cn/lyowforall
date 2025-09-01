<template>
  <table>
    <tr>
      <th v-for="(day, idx) in this.calendar.weekdays" :key="idx">{{ day }}</th>
    </tr>
    <tr v-for="row in cells" :key="row.week">
      <td v-for="cell in row" :key="cell.day" :data-idx=cell.title
          v-bind:class="{ 'padded-left':  cell.padded == 'left',
                          'padded-right': cell.padded == 'right' }">
        <time>{{ this.dayAliases ? this.dayAliases[cell.appointedDay] : cell.appointedDay }}</time>
        <div>{{ cell.caption }}</div>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'CalendarDisplay',
  data() {
    return {
      cells: new Array(),
    }
  },
  props: {
    calendar: { type: Object },
    secondCalendar: { type: Object },
    monthLength: { type: Number },
    lastLength: { type: Number },
    monthStart: { type: Number },
    titleDay: { type: Number },
    offset: { type: Number },
    appointedDays: { type: Array },
    prevAppointedDays: { type: Array },
    nextAppointedDays: { type: Array },
  },
  computed: {
    calendarPage() {
      const {  calendar, secondCalendar, monthStart } = this
      return { calendar, secondCalendar, monthStart }
    },
    dayAliases() {
      return this.calendar.dayAliases
    }
  },
  watch: {
    calendarPage: {
      handler() {
        this.cells = new Array()
        const { monthLength, lastLength, monthStart, offset, prevAppointedDays, nextAppointedDays } = this
        const weekLength = this.calendar.weekdays.length
        function getLeftOffset() {
          const row = []
          for (let i = 0; i < offset; i++) {
            const delta = offset - i
            const title = lastLength + 1 - delta
            const appointedDay = prevAppointedDays ? prevAppointedDays[title - 1] : title
            row.push({ title: title, day: monthStart - delta, padded: 'left', appointedDay })
          }
          return row
        }
        function getRightOffset(length) {
          const row = []
          for (let i = 1; i <= length; i++) {
            const delta = monthLength
            const appointedDay = nextAppointedDays ? nextAppointedDays[i - 1] : i
            row.push({ title: i, day: monthStart + delta + i, padded: 'right', appointedDay })
          }
          return row
        }
        function addCaption(cells, secondCalendar, start, count) {
          const captions = secondCalendar.dayCaptions(start, count)
          if (!captions)
            return
          let used = 0
          for (let row of cells)
            for (let cell of row)
              cell.caption = captions[used++]
        }
        let row = getLeftOffset(), week = offset, rowCount = 0
        for (let i = 1; i <= monthLength; i++) {
          const appointedDay = this.appointedDays ? this.appointedDays[i - 1] : i
          row.push({ title: i, day: monthStart + i, appointedDay })
          if (++week == weekLength) {
            row.week = ++rowCount
            this.cells.push(row)
            row = new Array()
            week = 0
          }
        }
        if (week)
          row.push(...getRightOffset(weekLength - week))
        row.week = ++rowCount
        this.cells.push(row)
        if (this.secondCalendar)
          addCaption(this.cells, this.secondCalendar,
            monthStart - offset, weekLength * this.cells.length)
      },
      immediate: true
    }
  },
  mounted() {
    this.$emit('redraw')
  },
  updated() {
    this.$emit('redraw')
  }
}
</script>

<style>
.padded-left, .padded-right {
  color: var(--devui-aide-text);
}
</style>
