<template>
  <CalendarMain />
</template>

<script>
import CalendarMain from '@/components/CalendarMain.vue'

export default {
  name: 'IndexView',
  components: {
		CalendarMain
  },
}
</script>

<style>
body {
  max-width: 72em;
  margin: 0 auto;
}
</style>
