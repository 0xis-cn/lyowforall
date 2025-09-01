import { ref } from 'vue';

class Calendar {
	name;
	weekOffset;

	constructor(options) {
		if (options) {
			for (const o of options)
				o[1] = ref(o[1])
			this.options = options
		}
	}
}

export default Calendar
