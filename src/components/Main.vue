<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-6">
      <h3><i class="tasks icon circular inverted blue"></i>CASOS PROCESADOS</h3>
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
               height="100"
               src="/static/finish.svg"
               style="margin-top:35px;">
          <h3 style="margin-top:10px;">No hay casos procesados</h3>
          <el-badge v-if="canCreate()"
                    :value="$auth.user().meta.models + ' restantes'"
                    class="item">
            <button v-if="canCreate()"
                    @click="createProcess"
                    class="btn-outline-primary btn"><i class="icon plus"></i>Nuevo Caso</button>
          </el-badge>
        </center>
      </div>
      <div v-if="loading"
           v-loading="loading">
        <h4>esperando casos..</h4>
      </div>
    </div>
    <div class="col-md-6">
      <h3><i class="cube icon circular inverted blue"></i> CASOS PENDIENTES</h3>
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
          <h3 style="margin-top:10px;">No hay casos pendientes por procesar.</h3>
          <el-badge v-if="canCreate()"
                    :value="$auth.user().meta.models + ' restantes'"
                    class="item">
            <button v-if="canCreate()"
                    @click="createProcess"
                    class="btn btn-outline-primary"><i class="icon plus"></i>Nuevo caso</button>
          </el-badge>
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
import processed from './utils/Processed';
import api from '../api/process.js';
import navBar from './utils/Navbar';
import queue from './utils/Queue';
import q from 'q';

export default {
  /*
  * Nombre del componente
  *
  */
  name: 'Main',
  /*
  * Constructor del componente.
  *
  */
  mounted() {
    // smartlook('identify', this.$auth.user().email)
    this.$auth.fetch()
    this.getModels()
    this.registerListener()
    this.checkUserIsValidated()
    this.addCurrentConnection()

  },
  /*
  * Acción que se ejecuta al desmontar el componente
  *
  */
  destroyed() {
    clearInterval(this.interval)
    clearInterval(this.IntervalConnection)
    this.$bus.off('removeQueueRegister')
    this.$bus.off('refreshRegisters')
    this.$off('reloadModels')
    clearInterval(this.intervalGetModels)
  },
  /*
  * Componentes usados por este componente
  *
  */
  components: {
    navBar,
    processed,
    queue
  },
  /*
  * Metodos publicos
  *
  */
  methods: {
    /*
    * Redirige a la página principal y cierra sesión
    *
    */
    logout() {
      this.$auth.logout()
      this.$router.push({
        name: 'login'
      })
    },
    /*
    * Se ejecuta al cambiar el imput de la cola
    *
    */
    filterQueue() {
      this.pageQueue = 0
      this.getModels()
    },
    /*
    * Redirige a la página que permite crear un proceso
    *
    */
    createProcess() {
      this.$router.push({
        name: 'process'
      })
    },
    /*
    * Permite registrar eventos o tareas
    *
    */
    registerListener() {
      this.$on('reloadModels', this.getModels)
      this.$bus.on('removeQueueRegister', this.removeQueueRegister)
      this.$bus.on('refreshRegisters', this.getModels)
      this.intervalGetModels = setInterval(this.getModels, 30000)
    },
    /*
    * Permite eliminar un registro en cola
    *
    */
    removeQueueRegister(register) {
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
    /*
    * Permite cambiar la pagina de encolados
    *
    */
    changeQueueList(page) {
      this.pageQueue = page
      this.getModels()
    },
    /*
    * Permite cambiar la pagina de procesados
    *
    */
    changeProcessedList(page) {
      this.pageProcessed = page
      this.getModels()
    },
    /*
    * Obtiene todos los modelos
    *
    */
    getModels() {
      q.all([
        api.getProcess(this.limit, this.offset, this.pageProcessed, 5, this.searchProcessed, this.$auth.user().id),
        api.getProcess(this.limit, this.offset, this.pageQueue, 1, this.searchQueue, this.$auth.user().id)
      ]).then((response) => {
        this.processed = response[0].data
        this.queue = response[1].data
        this.totalQueue = response[1].data.total
        this.totalProcessed = response[0].data.total
        this.loading = false
      })
    },
    addCurrentConnection() {
      this.IntervalConnection = setInterval(() => {
        api.addCurrentConnection(this)
      }, 5000)
    },
    checkUserIsValidated() {
      if (!this.$auth.user().meta.is_active) {
        this.$alert('Tu cuenta esta desactivada. Para activarla debes acceder a tu buzón de correo.', {
          confirmButtonText: 'Ok',
          type: 'error',
          title: 'Error de acceso',
          center: true
        }).then(this.logout)
      }
    },
    canCreate() {
      return (this.$auth.user().meta.models > 0) && this.canCreateProcess()
    },
    canCreateProcess() {
      var canCreateProcess = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canCreateProcess) {
          canCreateProcess = this.eachRolesPermissions(rol, this.havePermissionToCreateProcess)
        }
      })
      return canCreateProcess
    },
    eachRolesPermissions(rol, validation) {
      var permissions = []
      var canManage = false
      permissions = rol.permissions
      if (permissions) {
        _.each(permissions.split(','), (permission) => {
          if (permission) {
            if (validation(permission)) {
              canManage = true
            }
          }
        })
      }
      return canManage
    },
    havePermissionToCreateProcess(permission) {
      return (permission.trim() === 'createProcess')
    }

  },
  /*
  * Variables asociadas al scope.
  *
  */
  data() {
    return {
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
