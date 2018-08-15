// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.devtools = true
Vue.config.performance = true

Vue.router = router
Vue.config.productionTip = false

import axios from 'axios';
import VueAxios from 'vue-axios';

import VueSocketio from 'vue-socket.io';
Vue.use(VueSocketio, window.pathBase + ':3000');

import 'bootstrap/dist/css/bootstrap.css'
import 'semantic-ui/dist/semantic.min.css'

import locale from 'element-ui/lib/locale/lang/es'
import { VuePlugin } from 'vuera'
Vue.use(VuePlugin)

import VueBus from 'vue-bus';

Vue.use(VueBus);

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-fresh.css";

Vue.use(VueAxios, axios);
Vue.axios.defaults.baseURL = window.pathBase + ':' + window.portBaseLaravel + '/api/v1';
console.log(Vue.axios.defaults.baseURL)

import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'

loadProgressBar()

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'animate.css/animate.css'


import 'vue-progress-path/dist/vue-progress-path.css'
import VueProgress from 'vue-progress-path'

import VueNumeric from 'vue-numeric' 
Vue.use(VueNumeric)

Vue.use(VueProgress, {
  // defaultShape: 'circle',
})


import './../static/styles.css'

import VueTimeago from 'vue-timeago'

Vue.use(VueTimeago, {
  name: 'timeago',
  locale: 'es-ES',
  locales: {
    'es-ES': require('vue-timeago/locales/es-ES.json')
  }
})

Vue.use(ElementUI,  { locale })

Vue.use(require('@websanova/vue-auth'), {
  auth: require('@websanova/vue-auth/drivers/auth/bearer.js'),
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
  rolesVar: 'permissions'
})


    /* eslint-disable no-new */
    var instance = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    })


    axios.interceptors.response.use(function(response) {
        return response;      
    }, function(res) {
        
      if (res.response.status === 401 && ['invalid_credentials'].indexOf(res.response.data.error) > -1 ) {
        instance.$children[0].$emit('login-error', true)
      }

        if (
            res.response.status === 401 &&
            ['UnauthorizedAccess', 'InvalidToken', 'token_not_provided'].indexOf(res.response.data.error) > -1
        ) {


            Vue.auth.logout({
                redirect: {name: 'login'}
            });
        }
        
        // System Error

        else if (res.response.status === 500) {
           Vue.router.push({name: 'main'});
        }

        return res
    });
