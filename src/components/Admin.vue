<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-12">
      <h3><i class="tasks icon circular inverted red"></i>ADMINISTRACIÓN</h3>
      <div class="ui four item menu grey inverted">
        <a v-bind:class="{ active: isActive('info') }"
           @click="selectInfo()"
           class="item"><i class="info icon"></i>Información General</a>
        <a v-bind:class="{ active: isActive('categories')}"
           @click="selectCategories()"
           class="item">
                            <i class="icon sitemap"></i>
                            Administrar contenido</a>
        <a v-bind:class="{ active: isActive('process')}"
           @click="selectProcess()"
           class="item"><i class="cubes icon"></i>Información de casos</a>
        <a v-bind:class="{ active: isActive('queue') }"
           @click="selectQueue()"
           class="item"><i class="server icon"></i>Información de colas</a>
      </div>
    </div>
  </div>
  <div class="row mt-2"
       v-if="selected == 'process'">
    <div class="col-md-12">
      <supervisor-console></supervisor-console>
    </div>
  </div>
  <div class="row mt-2"
       v-if="selected == 'queue'">
    <div class="col-md-12">
      <queue-console></queue-console>
    </div>
  </div>
  <div class="row-mt-2"
       v-if="selected === 'categories'">
    <categories :data="categories"></categories>
  </div>
  <div class="row mt-3"
       v-if="selected == 'info'">
    <div class="col-md-6">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Procesados"
                     name="processed">
          <el-input placeholder="Búsqueda rápida de casos procesados"
                    @change="getModels"
                    v-model="searchProcessed"
                    class="input-with-select">
            <el-button slot="append"
                       icon="el-icon-search"></el-button>
          </el-input>
          <processed :registers="processed.data"></processed>
          <div v-if="processed.data.length > 0"
               class="mt-1">
            <el-pagination small
                           @current-change="changeProcessedList"
                           :page-size="limit"
                           layout="prev, pager, next"
                           :total="totalProcessed">
            </el-pagination>
          </div>
          <div v-if="processed.data.length < 1 && !loading">
            <center>
          <img class="fadeIn animated"
               height="105"
               src="/static/finish.svg"
               style="margin-top:30px">
              <h3 style="margin-top:0px;">Nadie tiene casos <br> procesados</h3>
            </center>
          </div>
          <div v-if="loading"
               v-loading="loading">
            <h4>esperando casos..</h4>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Pendientes por procesar"
                     name="queue">
          <el-input placeholder="Búsqueda rápida de casos en cola"
                    @change="filterQueue"
                    v-model="searchQueue"
                    class="input-with-select">
            <el-button slot="append"
                       icon="el-icon-search"></el-button>
          </el-input>
          <queue :registers="queue.data"></queue>
          <div v-if="queue.data.length > 0"
               class="mt-1">
            <el-pagination small
                           @current-change="changeQueueList"
                           :page-size="limit"
                           layout="prev, pager, next"
                           :total="totalQueue">
            </el-pagination>
          </div>
          <div v-if="queue.data.length < 1 && !loading">
            <center>
          <img class="fadeIn animated"
               height="105"
               src="/static/database.svg"
               style="margin-top:30px">
              <h3 style="margin-top:0px;">Nadie tiene casos <br> pendientes por procesar.</h3>
            </center>
          </div>
          <div v-if="loading"
               v-loading="loading">
            <h4>esperando casos..</h4>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="col-md-6">
      <div class="row">
        <div class="col-md-12">
          <div class="ui  statistics mini float-right"
               v-loading="workers < 1"
               element-loading-spinner="el-icon-loading"
               element-loading-text="Cargando">
            <div class="statistic red animated  fadeIn">
              <div class="value">
                <i class="microchip circular small icon"></i> {{workers}}
              </div>
              <div class="label">
                WORKERS
                <br>CONECTADOS
              </div>
            </div>
            <div class="statistic red animated fadeIn">
              <div class="value">
                <i class="bullseye circular small icon"></i> {{totalProcessed + totalQueue}}
              </div>
              <div class="label">
                CASOS
                <br>CREADOS
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-12"
             v-loading="!info.free">
          <div class="row">
            <div class="col-md-12">
              <label class="float-right"
                     v-if="info.free"><i class="tasks icon circular"></i>{{bytesToSize(info.free)}} DISPONIBLES DE {{bytesToSize(info.total)}}</label>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <label class="float-right"><i class="chart line icon circular"></i> USO DE LA CPU</label>
              <el-progress v-if="info.cpuUsage"
                           :text-inside="true"
                           :stroke-width="18"
                           :percentage="info.cpuUsage"
                           status="primary"></el-progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import navBar from './utils/Navbar';
import processed from './utils/Processed';
import queue from './utils/Queue';
import api from '../api/process.js';
import supervisorConsole from './utils/SupervisorConsole';
import queueConsole from './utils/queueConsole';
import categories from './utils/Categories';
import q from 'q';

export default {
  mounted() {
    this.$socket.emit('admin')
    this.getModels()
    this.registerListener()
    this.checkUserIsValidated()
    this.addCurrentConnection()
  },
  destroyed() {
    clearInterval(this.interval)
    clearInterval(this.IntervalConnection)
    this.$off('reloadModels')
    this.$socket.emit('admin-leave')
  },
  name: 'Main',
  components: {
    navBar,
    processed,
    queue,
    supervisorConsole,
    queueConsole,
    categories
  },
  methods: {
    adminContent() {
      this.$router.push({
        name: 'categories'
      })
    },
    removeQueueRegister(register) {
      console.log(register)
      api.delete(register.id).then(() => {
        this.$auth.fetch()
        this.queue.data.splice(register, 1)
        this.$message({
          type: 'success',
          message: 'Eliminado con exito'
        })
        this.getModels()
      })
    },
    registerListener() {

      this.$bus.on('removeQueueRegister', this.removeQueueRegister)
      this.$bus.on('refreshRegisters', this.getModels)

      this.$options.sockets.processing = (data) => {
        this.processing = data
      }

      this.$options.sockets.diskInfo = (data) => {
        this.info = data
      }

      this.$options.sockets.logsSupervisorConfig = (data) => {
        var numprocs = data.match(/numprocs=\d{1,3}/)
        this.workers = numprocs[0].match(/\d{1,3}/)[0]
      }
    },
    bytesToSize(bytes) {
      var sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB'
      ]
      if (bytes === 0) {
        return '0 Byte'
      }
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    },
    isActive(v) {
      return this.selected === v
    },
    selectInfo() {
      this.selected = 'info'
    },
    selectProcess() {
      this.selected = 'process'
    },
    selectCategories() {
      this.selected = 'categories'
    },
    selectQueue() {
      this.selected = 'queue'
    },
    addCurrentConnection() {
      this.IntervalConnection = setInterval(() => {
        api.addCurrentConnection(this)
      }, 5000)
    },
    checkUserIsValidated() {
      if (!this.$auth.user().meta.is_active) {
        this.$alert('Al parecer no as validado tu dirección de correo, es necesario que la actives para poder acceder al sistema.', {
          confirmButtonText: 'Ok',
          type: 'error',
          title: 'Error de acceso',
          center: true
        }).then(this.sendOtherToken)
      }
    },
    sendOtherToken() {
      api.sendToken().then(() => {
        this.$auth.logout()
        this.$router.push({
          name: 'login',
          query: {
            message: 'Hemos enviado un nuevo correo de activación'
          }
        })
      })

    },
    filterQueue() {
      this.pageQueue = 0
      this.getModels()
    },
    createProcess() {
      this.$router.push({
        name: 'process'
      })
    },
    intervalModels() {
      this.inverval = setInterval(() => {
        this.getModels()
      }, 30000)
    },
    changeQueueList(page) {
      this.pageQueue = page
      this.getModels()
    },
    changeProcessedList(page) {
      this.pageProcessed = page
      this.getModels()
    },
    getModels() {
      q.all([
        api.getProcess(this.limit, this.offset, this.pageProcessed, 5, this.searchProcessed, null),
        api.getProcess(this.limit, this.offset, this.pageQueue, 1, this.searchQueue, null),
        api.getCategories()
      ]).then((response) => {
        this.processed = response[0].data
        this.queue = response[1].data
        console.log(this.queue)
        this.totalQueue = response[1].data.total
        this.totalProcessed = response[0].data.total
        this.categories = response[2].data
        this.loading = false
      })
    }
  },
  data() {
    return {
      categories: [],
      processing: 0,
      info: {},
      workers: 0,
      freeSpace: 0,
      totalSpace: 0,
      takenPercent: 0,
      availablePercent: 0,
      selected: 'info',
      activeTab: 'queue',
      loading: true,
      queue: {
        data: []
      },
      processed: {
        data: []
      },
      limit: 5,
      offset: 0,
      pageQueue: 0,
      pageProcessed: 0,
      totalQueue: 0,
      totalProcessed: 0,
      searchQueue: '',
      searchProcessed: ''
    }
  }
}

</script>

<style lang="css">
</style>
