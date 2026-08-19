class Calendar {
	name;
	weekOffset;

	constructor(options) {
		if (options) {
			// Store plain values without Vue reactivity
			// Vue components can wrap with ref() if reactivity is needed
			this.options = options
		}
	}
}

export default Calendar
