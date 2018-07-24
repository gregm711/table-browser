import Vue from 'vue'
import App from './App'
import BootstrapVue from 'bootstrap-vue'
import VueVega from 'vue-vega'
import VueWorker from 'vue-worker';
Vue.use(VueWorker);

Vue.use(VueVega);

Vue.use(BootstrapVue);

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
