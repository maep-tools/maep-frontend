<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8">
      <h3><i class="users icon circular inverted yellow"></i>USUARIOS {{userScreen()}}</h3>
      <el-input placeholder="Búsqueda rápida de usuarios"
                @change="filterUser"
                v-model="searchUser"
                class="input-with-select">
        <el-button slot="append"
                   icon="el-icon-search"></el-button>
      </el-input>
      <users :online="info.users"
             :registers="users.data"></users>
      <div v-if="users.data.length > 0"
           class="mt-1">
        <el-pagination small
                       @current-change="changeUsersList"
                       :page-size="limit"
                       layout="prev, pager, next"
                       :total="totalUsers">
        </el-pagination>
      </div>
      <el-alert v-if="!loading && users.data.length < 1"
                title="No hay usuarios con esa descripción"
                type="info"
                :closable="false"
                :show-icon="false"
                description="No encontramos usuarios con esa descripción"
                show-icon>
      </el-alert>
      <div v-if="loading"
           v-loading="loading">
        <h4>esperando..</h4>
      </div>
    </div>
    <div class="col-md-4">
      <el-menu default-active="1"
               class="el-menu-vertical-demo"
               background-color="#545c64"
               text-color="#ffffff"
               active-text-color="#ffd04b">
        <el-menu-item index="1"
                      @click="showAllUsers()">
          <i class="el-icon-menu white"></i>
          <span slot="title">Usuarios</span>
        </el-menu-item>
        <el-menu-item index="2"
                      @click="showConnected()">
          <i class="el-icon-sort white"></i>
          <span slot="title">Usuarios activos</span>
        </el-menu-item>
        <el-menu-item v-if="canDownloadUsers()"
                      index="3"
                      @click="downloadUsers()">
          <i class="el-icon-download white"></i>
          <span slot="title">Descargar en excel</span>
        </el-menu-item>
        <el-menu-item v-if="canShowRoles()"
                      index="4"
                      @click="goToRoles()">
          <i class="el-icon-setting white"></i>
          <span slot="title">Roles y permisos</span>
        </el-menu-item>
        <el-menu-item v-if="canShowStatistics()"
                      index="6"
                      @click="goToAnalytics()">
          <i class="el-icon-info white"></i>
          <span slot="title">Google Analytics</span>
        </el-menu-item>
      </el-menu>
      <hr>
      <div class="ui horizontal statistics blue"
           v-if="canShowStatistics()">
        <div class="statistic white">
          <div class="value">
            <i class="chart bar small circular outline icon"></i> {{totalUsers}}
          </div>
          <div class="label">
            Usuarios registrados
          </div>
        </div>
        <div class="statistic white animated  fadeIn"
             element-loading-spinner="el-icon-loading"
             element-loading-text="Conectando..."
             v-loading="!info.connected">
          <div class="value">
            <i class="user circular small icon"></i> {{info.connected}}
          </div>
          <div class="label">
            Usuarios conectados
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import navBar from './utils/Navbar';
import users from './utils/Users';
import api from '../api/process.js';
import q from 'q';

export default {
  /*
  * Nombre del componente
  *
  */
  name: 'Users',
  /*
  * Acción que se ejecuta cuando el componente se monta
  *
  */
  mounted() {
    this.getUsers()
    this.$socket.emit('adminUsers')
    this.registerListener()
    this.addCurrentConnection()
  },
  /*
  * Acción que se ejecuta cuando el componente se desmonta
  *
  */
  destroyed() {
    clearInterval(this.interval)
    clearInterval(this.IntervalConnection)
    this.$off('reloadModels')
    this.$socket.emit('adminUsers-leave')
  },
  /*
  * Registro de componentes usados en el sistema
  *
  */
  components: {
    users,
    navBar
  },
  /*
  * Metodos publicos
  *
  */
  methods: {
    /*
    * Permite ir a la página de roles
    *
    */    
    goToRoles() {
      this.$router.push({
        name: 'roles'
      })
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

    canDownloadUsers() {
      var canDownloadUsers = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canDownloadUsers) {
          canDownloadUsers = this.eachRolesPermissions(rol, this.havePermissionToDownloadUsers)
        }
      })
      return canDownloadUsers
    },

    canShowRoles() {
      var canSeeRoles = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canSeeRoles) {
          canSeeRoles = this.eachRolesPermissions(rol, this.havePermissionToSeeRoles)
        }
      })
      return canSeeRoles
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
    havePermissionToSeeStatistics(permission) {
      return (permission.trim() === 'seeStatistics')
    },

    havePermissionToSeeRoles(permission) {
      return (permission.trim() === 'seeRoles')
    },
    havePermissionToDownloadUsers(permission) {
      return (permission.trim() === 'downloadUsers')
    },
    /*
    * Permite ir a la página de estadisticas
    *
    */    
    goToAnalytics() {
      var url = 'https://analytics.google.com/analytics'
      window.open(url, '_blank')
    },
    /*
    * Muestra conectados en el título si se esta mostrando
    * la pestaña de usuarios conectados
    */    
    userScreen() {
      if (this.showing !== 'users') {
        return 'CONECTADOS'
      }
    },
    /*
    * Permite determinar si el elemento esta activo
    */    
    isActive(tab) {
      if (this.showing === tab) {
        return true
      }
    },
    /*
    * Permite descargar excel con todos los usuarios
    */    
    downloadUsers() {
      api.downloadExcel().then((response) => {
        var a = document.createElement('a')
        a.href = response.data.file
        a.download = response.data.name
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
    },
    /*
    * Muestra todos los usuarios
    */  
    showAllUsers() {
      this.showing = 'users'
      this.users.data = this.usersCopy.data
    },
    /*
    * Muestra solo usuarios conectados
    */  
    showConnected() {
      this.showing = 'connected'
      this.users.data = this.info.users
    },
    addCurrentConnection() {
      this.IntervalConnection = setInterval(() => {
        api.addCurrentConnection(this)
      }, 5000)
    },
    filterUser() {
      this.showing = 'users'
      this.pageUsers = 0
      this.getUsers()
    },
    createProcess() {
      this.$router.push({
        name: 'process'
      })
    },
    intervalModels() {
      this.inverval = setInterval(() => {
        this.getUsers()
      }, 30000)
    },
    registerListener() {
      this.$on('reloadModels', this.getUsers)

      this.$options.sockets.users = (data) => {
        this.info = data
        if (this.showing !== 'users') {
          this.showConnected()
        }
      }

      this.$socket.emit('connected', {
        user: this.$auth.user(),
        date: new Date()
      })
    },
    changeUsersList(page) {
      this.pageUsers = page
      this.getUsers()
    },
    /*
    * Obtiene todos los usuarios
    */  
    getUsers() {
      q.all([
        api.getUsers(this.limit, this.offset, this.pageUsers, null, this.searchUser)
      ]).then((response) => {
        this.usersCopy = _.clone(response[0].data, true)
        this.users = response[0].data
        this.totalUsers = response[0].data.total
        this.loading = false
      })
    }
  },
  data() {
    return {
      loading: true,
      showing: 'users',
      info: {
        users: []
      },
      usersCopy: {
        data: []
      },
      users: {
        data: []
      },
      limit: 5,
      offset: 0,
      pageUsers: 0,
      totalUsers: 0,
      searchUser: ''
    }
  }
}

</script>
