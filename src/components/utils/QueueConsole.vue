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
      <p>Esta consola muestra los logs de los workers (Ejecución de modelos).</p>
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
import _ from 'lodash'
import api from '../../api/process.js';
import config from '../../config'
export default {
  /*
  * Nombre del componente
  */
  name: 'SupervisorConsole',
  /* 
  * Parametros
  */
  data() {
    return {
      logs: [],
      supervisordPath: config.queuePath
    }
  },
  /* 
  * Acción que se llama al montar componente
  */
  mounted() {
    this.registerListener()
  },
  /* 
  * Acción que se llama al destrozar componente
  */
  destroyed() {
    delete this.$options.sockets.logsQueue
  },
  /* 
  * Metodos publicos
  */
  methods: {
    /* 
    * Permite limiar logs
    */
    clearLogs() {
      api.clearLogs('queues')
    },
    /* 
    * Permite ir al bottom de la consola
    */
    gotoBottom(id) {
      var element = document.getElementById('terminal-logs')
      if (!_.isNil(element)) {
        element.scrollTop = element.scrollHeight - element.clientHeight
      }
    },
    /* 
    * Permite determinar si existen logs
    */
    isEmpty() {
      return this.logs.length < 1
    },
    /* 
    * Registra escuchadores
    */
    registerListener() {
      this.$options.sockets.logsQueue = (data) => {
        this.logs = data.split('\n')
        this.$forceUpdate()
        setTimeout(() => {
          this.gotoBottom('terminal-logs')
        }, 5000)
      }
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
