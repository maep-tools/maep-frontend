<template>
<div>
  <div class="row">
    <div class="col-md-6">
      <h5 class="mb-1">{{register.name}} <el-tag size="mini" type="danger" v-if="register.phase == 5"><i class="icon warning"></i>Error de ejecución</el-tag></h5>
      <small style="color:grey;"><i class="calendar alternate black icon"></i>
        <timeago :auto-update="1" :since="register.created_at"></timeago>

      </small>
      <br>
      <small v-if="register.user" style="color:grey;"><i class="user circle outline black icon"></i>{{register.user.name}} {{register.user.lastname}}</small>
    </div>
    <div class="col-md-6">
      <div v-if="register.phase == 1">
        <button v-if="canDeleteProcess()"
                @click="remove(register)"
                class="btn btn-sm btn-outline-danger float-right"><i class="trash icon"></i>Eliminar</button>
        <button style="margin-right:10px;"
                v-if="canEditProcess() || canViewProcess()"
                @click="goToModel(register)"
                class="btn btn-sm btn-outline-primary float-right"><i class="eye  icon"></i>Acceder</button>
      </div>

      <div v-if="register.phase == 5">

        <button v-if="canDeleteProcess()"
                @click="remove(register)"
                class="btn btn-sm btn-outline-danger float-right"><i class="trash icon"></i>Eliminar</button>
        
        <button style="margin-right:10px;"
                v-if="canEditProcess() || canViewProcess()"
                @click="goToModel(register)"
                class="btn btn-sm btn-outline-primary float-right"><i class="eye  icon"></i>Acceder</button> 
      </div>



      <div v-if="register.phase == 3">
        <button class="btn btn-warning disabled float-right"><i class="loading spinner icon"></i>Procesando</button>
      </div>
    </div>
  </div>
  <div class="row"
       v-if="progress">
    <div class="col-md-12">
      <small>{{info}}</small>
      <el-progress :percentage="progress"></el-progress>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../api/process.js';
export default {
  name: 'QueueRegister',
  mounted() {
    this.listenModels()
  },
  destroyed () {
    this.$socket.emit('room-leave', this.register.id)
  },
  props: [
    'register'
  ],
  methods: {
    listenModels() {
      this.$options.sockets.message = (data) => {
        if (parseInt(data.data.id, 10) === this.register.id) {
          this.progress = data.data.percent
          this.info = data.data.message
          this.register.phase = data.data.phase
        }

        if (data.data.state === 'Finalizado') {
          this.$notify({
            title: 'Proceso completado',
            message: this.register.name + ' acaba de ser procesado',
            type: 'success'
          });
          this.$bus.emit('refreshRegisters')
        }
      }
    },
    registerModelListeners() {
      // por cada uno de los modelos nos unimos a la sala del modelo

      this.$socket.emit('room', this.register.id)
      this.listenModels()
    },
    goToModel(register) {

      if (register.type !== "Excel") {
      this.$router.push({
        name: 'process',
        params: {
          id: register.id
        },
        query: {
          step: 1
        }
      })
      }


      if (register.type === "Excel") {
        this.$router.push({
          name: 'process',
          params: {
            id: register.id
          },
          query: {
            step: 0,
            deploy: true
          }
        })
      }



    },
    remove(register) {
      this.$confirm('Esto borrara el modelo por completo. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then((r) => {
        if (r) {
          console.log(r)
          this.$bus.emit('removeQueueRegister', register)

        }
      }).catch((e) => {
        console.log(e)
        this.$message({
          type: 'warning',
          message: 'Eliminación cancelada'
        })
      })
    },

    canEditProcess() {
      var canEditProcess = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canEditProcess) {
          canEditProcess = this.eachRolesPermissions(rol, this.havePermissionToEditProcess)
        }
      })
      return canEditProcess
    },
    canViewProcess() {
      var canViewProcess = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canViewProcess) {
          canViewProcess = this.eachRolesPermissions(rol, this.havePermissionToViewProcess)
        }
      })
      return canViewProcess
    },
    canDeleteProcess() {
      var canDeleteProcess = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canDeleteProcess) {
          canDeleteProcess = this.eachRolesPermissions(rol, this.havePermissionToDeleteProcess)
        }
      })
      return canDeleteProcess
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
    havePermissionToDeleteProcess(permission) {
      return (permission.trim() === 'deleteProcess')
    },
    havePermissionToViewProcess(permission) {
      return (permission.trim() === 'seeProcess')
    },
    havePermissionToEditProcess(permission) {
      return (permission.trim() === 'editProcess')
    }
  },
  data() {
    return {
      progress: 0,
      info: ''
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
