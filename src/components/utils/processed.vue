<template>
<div style="margin-top:5px;">
  <ul class="list-group">
    <li v-for="register in registers" v-if="register.name"
        class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-1" v-if="register.name">{{register.name}}</h5>
        <small style="color:grey;"><i class="calendar alternate black icon"></i>
                <timeago :since="register.created_at"></timeago>
              </small>
        <br>
        <small style="color:grey;" v-if="register.user"><i class="user circle outline black icon"></i>{{register.user.name}} {{register.user.lastname}}</small>
      </div>
      <div>
        <button @click="goToModel(register)"
                class="btn btn-sm btn-outline-primary"><i class="eye  icon"></i>Acceder</button>
        <button v-if="canDeleteProcess()"
                @click="remove(register)"
                class="btn btn-sm btn-outline-danger"><i class="trash icon"></i>Eliminar</button>
      </div>
    </li>
  </ul>
</div>

</template>

<script>
import Vue from 'vue';
import api from '../../api/process.js';
export default {
  props: [
    'registers'
  ],
  methods: {
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
    goToModel(register) {
      this.$router.push({
        name: 'process',
        params: {
          id: register.id
        },
        query: {
          step: 3
        }
      })
    },
    remove(register) {
      this.$confirm('Esto borrara el modelo por completo. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then((r) => {
        if (r) {
          api.delete(register.id).then(() => {
            this.$auth.fetch()
            this.registers.splice(register, 1)
            this.$message({
              type: 'success',
              message: 'Eliminado con exito'
            }
            )
            this.$parent.$emit('reloadModels')
          })
        }
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: 'Eliminación cancelada'
        })
      })
    }

  }
}

</script>

<style>
</style>
