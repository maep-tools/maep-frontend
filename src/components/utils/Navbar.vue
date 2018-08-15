<template>
<div class="row"
     style="margin-top:20px;">
  <div class="col-md-12">
    <img v-bind:class="{ animated: isActive('main'), rotateIn: isActive('main') }"
         src="/static/logo-bubbles.svg"
         height="70"
         style="margin-top:0px;">
    <h6 style="margin-top:5px; color: #5b5851; font-weight:bold;"> Modelo de Análisis Eléctrico y Planeamiento</h6>
    <div class="ui secondary pointing menu">
      <a @click="goToMain()"
         v-bind:class="{ active: isActive('main') }"
         class="item">
         <i class="icon ui chart line blue"></i>           
         Dashboard
         </a>
      <a v-if="canManageUsers()"
         @click="goToUsers()"
         v-bind:class="{ active:isActive('userModel') || isActive('users') || isActive('roles') || isActive('user') }"
         class="item">
         <i class="icon ui users yellow"></i>          
         Usuarios
         </a>
      <a @click="goToAdmin()"
         v-if="canAdministrate()"
         class="item"
         v-bind:class="{ active: isActive('admin') }">
         <i class="icon ui configure red"></i>          
         Administración
         </a>
      <div class="right menu">
        <a v-if="canCreateProcess()"
           @click="createProcess"
           class="item"
           v-bind:class="{ active: isActive('process') }">
            <i class="icon ui plus inverted blue"></i>           
            Nuevo caso de estudio
            </a>
        <a class="ui item"
           v-bind:class="{ active: isActive('profile') || isActive('terms') || isActive('answers') || isActive('deleteAccount') }"
           @click="goToProfile">
            <i class="icon ui user olive"></i>
             {{$auth.user().email}}
            </a>
        <a class="ui item"
           @click="logout">
            <i class="icon ui red close"></i>
            <b>Cerrar sesión</b>
            </a>
      </div>
    </div>
  </div>
</div>
</div>

</template>

<script>
export default {
  mounted() {},
  name: 'component_name',
  methods: {
    /* Permite determinar si esta activo el elemento */
    isActive(name) {
      return this.$route.name === name
    },
    /*
    * Crea un nuevo proceso
    */
    createProcess() {
      if (this.$auth.user().meta.models < 1) {
        this.$alert('Puedes solicitar mas procesos o eliminar alguno que no necesites.', 'No tienes procesos disponibles', {
          type: 'error'
        })
        return
      }

      if (this.$route.name === 'process') {
        this.$router.push({
          name: 'process',
          params: {
            id: null
          }
        })
        window.location.reload()
      } else {
        this.$router.push({
          name: 'process',
          params: {
            id: null
          }
        })
      }
    },
    /*
    * Realiza logout
    */
    logout() {
      this.$confirm('Deseas cerrar sesión. Continuar?', 'Cerrar sesión', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        this.$auth.logout()
        window.location.reload()
      })
    },
    /*
    * Redirige al main
    */
    goToMain() {
      if(this.$route.name === "process") {
        window.location.href = "/"
      } else {
        this.$router.push({
          name: 'main'
        })
      }
    },
    /*
    * Redirige a pagina de usuarios
    */
    goToUsers() {
      this.$router.push({
        name: 'users'
      })
    },
    /*
    * Redirige al perfil
    */
    goToProfile() {
      this.$router.push({
        name: 'profile'
      })
    },
    /*
    * Redirige a la zona de administración
    */
    goToAdmin() {
      this.$router.push({
        name: 'admin'
      })
    },
    canManageUsers() {
      var canManageUsers = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canManageUsers) {
          canManageUsers = this.eachRolesPermissions(rol, this.havePermissionToManageUser)
        }
      })

      return canManageUsers
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
    canAdministrate() {
      var canAdministrate = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canAdministrate) {
          canAdministrate = this.eachRolesPermissions(rol, this.havePermissionToAdministrate)
        }
      })
      return canAdministrate
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
    },
    havePermissionToManageUser(permission) {
      return (permission.trim() === 'seeUsers')
    },
    havePermissionToAdministrate(permission) {
      return (permission.trim() === 'administrate')
    }
  },
  data() {
    return {
      userInfo: {},
      loading: false
    }
  }
}

</script>

