<template>
<div style="height:300px;">
  <div class="ui icon message"
       v-if="isEmpty">
    <i class="notched circle loading icon"></i>
    <div class="content">
      <div class="header">
        Esperando logs
        <hr>
      </div>
      <p>Este servicio se encarga de monitorear redis y los diferentes WORKERS en ejecución.</p>
      <p>Si el problema persiste ejecute el siguiente comando en el servidor desde la carpeta del backend:</p>
      <code>
        pkill -f supervisord && 
        supervisord -c supervisord.conf
      </code>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <input disabled=""
             type="text"
             class="form-control"
             v-model="supervisordPath">
      <button @click="clearLogs()"
              class="btn btn-danger float-right mt-1"><i class="icon trash"></i>Limpiar</button>
    </div>
  </div>
  <div style="margin-top:5px;"
       v-if="logs.length > 0"
       id="terminal-logs"
       class="terminal-logs"
       v-loading="isEmpty()">
    <ul style="list-style-type: none;">
      <li v-if="log"
          v-for="log in logs">{{log}}</li>
    </ul>
  </div>
</div>

</template>

<script>
import api from '../../api/process.js';
import _ from 'lodash';
import config from '../../config'
export default {
  /*
  * Nombre del componente
  */
  name: 'SupervisorConsole',
  /*
  * Parametros asociados al scope
  */
  data() {
    return {
      logs: [],
      supervisordPath: config.supervisordLogPath
    }
  },
  /*
  * Acción que se ejecuta al montar el componente
  */
  mounted() {
    this.registerListener()
  },
  /*
  * Metodos publicos
  */
  methods: {
    /*
    * Permite limpiar la pantalla de logs
    */
    clearLogs() {
      api.clearLogs('processes')
    },
    /*
    * Lleva el scroll de la consola al bottom
    */
    gotoBottom(id) {
      var element = document.getElementById('terminal-logs')
      if (!_.isNil(element)) {
        element.scrollTop = element.scrollHeight - element.clientHeight
      }
    },
    /*
    * Determina si existen logs
    */
    isEmpty() {
      return this.logs.length < 1
    },
    /*
    * Escucha los eventos provenientes del servidor 
    */
    registerListener() {
      this.$options.sockets.logsSupervisor = (data) => {
        this.logs = data.split('\n')
        this.$forceUpdate()
        setTimeout(() => {
          this.gotoBottom('terminal-logs')
        }, 3000)
      }
    }
  }
}

</script>
