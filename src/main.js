import { createApp } from 'vue'
import App from './App.vue'
import Button from 'vue-devui/button';
import Dropdown from 'vue-devui/dropdown';
import Icon from 'vue-devui/icon';
import InputNumber from 'vue-devui/input-number'
import Select from 'vue-devui/select'
import 'vue-devui/button/style.css';
import 'vue-devui/dropdown/style.css';
import 'vue-devui/input-number/style.css'
import 'vue-devui/select/style.css'
import '@devui-design/icons/icomoon/devui-icon.css';

import { ThemeServiceInit, infinityTheme } from 'devui-theme';
ThemeServiceInit({ infinityTheme }, 'infinityTheme');

createApp(App)
	.use(Button)
	.use(Dropdown)
	.use(Icon)
	.use(InputNumber)
	.use(Select)
	.mount('#app');
