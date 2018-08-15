<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-6">
      <h3><i class="user icon circular inverted blue"></i> {{user.name.toUpperCase()}}  {{user.lastname.toUpperCase()}}</h3>
    </div>
    <div class="col-md-6">
      <button @click="$router.go(-1)"
              class="btn btn-primary float-right"><i class="icon user"></i>Volver a {{user.name}}</button>
    </div>
  </div>
  <div class="row mt-5">
    <div class="col-md-6"
         v-if="user">
      <h4>CASOS PROCESADOS</h4>
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
          <h3 style="margin-top:0px;">{{this.user.name}} no tiene <br> casos procesados</h3>
        </center>
      </div>
      <div v-if="loading"
           v-loading="loading">
        <h4>esperando casos..</h4>
      </div>
    </div>
    <div class="col-md-6">
      <h4>CASOS PENDIENTES</h4>
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
          <h3 style="margin-top:0px;">{{this.user.name}} no tiene casos <br> pendientes por procesar.</h3>
        </center>
      </div>
      <div v-if="loading"
           v-loading="loading">
        <h4>esperando casos..</h4>
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
import q from 'q';

export default {
  mounted() {
    this.$auth.fetch()
    this.getModels()
    this.registerListener()
    this.checkUserIsValidated()
    this.addCurrentConnection()
  },
  destroyed() {
    clearInterval(this.interval)
    clearInterval(this.IntervalConnection)
  },
  name: 'Main',
  components: {
    navBar,
    processed,
    queue
  },
  methods: {
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
    registerListener() {
      this.$bus.off('refreshRegisters')
      this.$bus.on('refreshRegisters', this.getModels)
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
        api.getProcess(this.limit, this.offset, this.pageProcessed, 5, this.searchProcessed, this.$route.params.id),
        api.getProcess(this.limit, this.offset, this.pageQueue, 1, this.searchQueue, this.$route.params.id),
        api.getUser(this.$route.params.id)
      ]).then((response) => {
        this.processed = response[0].data
        this.queue = response[1].data
        console.log(response[1].data.total)
        this.totalQueue = response[1].data.total
        this.totalProcessed = response[0].data.total
        this.user = response[2].data
        this.loading = false
      })
    }
  },
  data() {
    return {
      user: {},
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
