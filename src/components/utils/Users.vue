<template>
<div style="margin-top:5px;">
  <ul class="list-group">
    <li :key="register.id"
        v-for="register in registers"
        class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-1">{{register.name.toUpperCase()}} {{register.lastname.toUpperCase()}} 
                <el-tag :key="rol.id" style="margin-right:2px;" :type="getColorType(rol)" size="mini" v-for="rol in register.roles.slice(0, 3)">{{rol.name}}</el-tag> <el-tag type="danger" size="mini">{{register.meta.models}} casos restantes</el-tag></h5>
        <small style="color:grey;"><i class="user circle outline black icon"></i> {{register.email}} &nbsp; <i class="building circle black icon"></i>{{register.meta.company}}</small>
        <small v-if="isOnline(register)"><i class="icon ui circle green"></i> Online</small>
        <small v-if="isActivated(register)"><i class="icon ui circle yellow"></i>Cuenta activa</small>
        <small v-if="!isActivated(register)"><i class="icon ui circle red"></i> Cuenta inactiva</small>
      </div>
      <div>
        <button v-if="canShowUser()"
                @click="editUser(register)"
                class="btn btn-sm btn-outline-primary"><i class="cube icon"></i>Propiedades</button>
        <button v-if="isNotCurrent(register) && canDeleteUser()"
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
    'registers',
    'online'
  ],
  methods: {
    editUser(register) {
      this.$router.push({
        name: 'user',
        params: {
          id: register.id
        }
      })
    },
    isActivated(user) {
      return user.meta.is_active
    },
    isOnline(user) {
      return _.find(this.online, {
        id: user.id
      })
    },
    getColorType(rol) {
      if (rol.name === 'admin') {
        return 'danger'
      }

      if (rol.name === 'member') {
        return 'warning'
      }

      if (rol.name === 'visitor') {
        return 'success'
      }

    },
    isNotCurrent(register) {
      return register.id !== this.$auth.user().id
    },
    sendSuccessDeleteMessage() {
      this.$message({
        type: 'success',
        message: 'Eliminado con exito'
      })
    },
    canDeleteUser() {
      var canDeleteUser = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canDeleteUser) {
          canDeleteUser = this.eachRolesPermissions(rol, this.havePermissionToDeleteUser)
        }
      })
      return canDeleteUser
    },
    canEditUser() {
      var canEditUser = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canEditUser) {
          canEditUser = this.eachRolesPermissions(rol, this.havePermissionToEditUser)
        }
      })
      return canEditUser
    },
    canShowUser() {
      var canShowUser = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canShowUser) {
          canShowUser = this.eachRolesPermissions(rol, this.havePermissionToSeeUser)
        }
      })
      return canShowUser
    },
    canShowStatistics() {
      var canShowStatistics = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canShowStatistics) {
          canShowStatistics = this.eachRolesPermissions(rol, this.havePermissionToSeeStatistics)
        }
      })
      return canShowStatistics
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
    havePermissionToDeleteUser(permission) {
      return (permission.trim() === 'deleteUsers')
    },
    havePermissionToEditUser(permission) {
      return (permission.trim() === 'editUsers')
    },
    havePermissionToSeeUser(permission) {
      return (permission.trim() === 'seeUser')
    },
    havePermissionToSeeStatistics(permission) {
      return (permission.trim() === 'seeStatistics')
    },
    cancelDelete() {
      this.$message({
        message: 'Eliminación cancelada',
        type: 'warning'
      })
    },
    deleteUser(r) {
      if (r) {
        api.deleteUser(this.register.id).then(() => {
          this.registers.splice(this.register, 1)
          this.sendSuccessDeleteMessage()
          this.$parent.$emit('reloadUsers')
        })
      }
    },
    remove(register) {
      this.register = register
      this.$confirm('Esto borrara el usuario por completo. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      })
        .then(this.deleteUser)
        .catch(this.cancelDelete)
    }

  }
}

</script>

<style>
</style>
