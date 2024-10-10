import Vue from 'vue'
import Chart from 'chart.js'
import VueChartkick from 'vue-chartkick'

Vue.config.productionTip = false
Vue.use(VueChartkick, { adapter: Chart })
