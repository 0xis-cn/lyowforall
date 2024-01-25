<template>
  <table>
    <tr v-for="row in cells" :key="row.week">
      <td v-for="cell in row" :key="cell.day" :data-title=cell.title
          v-bind:class="{ 'padded-left':  cell.padded == 'left',
                          'padded-right': cell.padded == 'right' }">
        <time>{{ this.dayAliases ? this.dayAliases[cell.title] : cell.title }}</time>
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
        const { monthLength, lastLength, monthStart, offset } = this
        const weekLength = this.calendar.weekLength
        const rightOffset = (offset + monthLength - 1) % weekLength
        function getLeftOffset() {
          const row = []
          for (let i = 0; i < offset; i++) {
            const delta = offset - i
            row.push({ title: lastLength + 1 - delta, day: monthStart - delta, padded: 'left' })
          }
          return row
        }
        function getRightOffset() {
          const row = []
          for (let i = 1; i < weekLength - rightOffset; i++) {
            const delta = monthLength
            row.push({ title: i, day: monthStart + delta + i, padded: 'right' })
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
          row.push({ title: i, day: monthStart + i })
          if (++week == weekLength) {
            row.week = ++rowCount
            this.cells.push(row)
            row = new Array()
            week = 0
          }
        }
        row.push(...getRightOffset())
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
