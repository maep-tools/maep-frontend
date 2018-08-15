<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8">
      <h3><i class="key icon circular inverted red"></i> ROLES Y PERMISOS</h3>
      <hr>
      <div class="row">
        <div class="col-md-12">
          <h3><i class="icon plus circular"></i>Agregar rol</h3>
          <div class="form-group">
            <label for="exampleInputEmail1">Nombre del rol</label>
            <input :disabled="!canCreateRol()"
                   v-model="rolName"
                   type="text"
                   class="form-control"
                   placeholder="Nombre del rol">
          </div>
          <button :disabled="!canCreateRol()"
                  @click="addRole()"
                  type="button"
                  class="btn btn-primary">
            <i class="icon save"></i> Agregar
          </button>
          <hr>
          <h3><i class="icon pencil circular"></i>Edición de rol</h3>
          <el-select @change="changeRol"
                     v-model="selectedRol"
                     placeholder="Seleccione">
            <el-option v-for="rol in roles"
                       :key="rol.id"
                       :label="rol.label"
                       :value="rol.id">
            </el-option>
          </el-select>
          <button :disabled="!canDeleteRole()"
                  @click="deleteRole()"
                  type="submit"
                  class="btn float-right btn-danger">
            <i class="icon ui trash"></i> Eliminar
          </button>
          <button style="margin-right:2px;"
                  @click="refresh()"
                  type="submit"
                  class="btn float-right btn-dark">
            <i class="icon ui cancel"></i> Cancelar
          </button>
          <button :disabled="!canEditRol()"
                  v-if="canCreateRole()"
                  style="margin-right:2px;"
                  @click="savePermission()"
                  type="submit"
                  class="btn float-right btn-primary">
            <i class="icon ui save"></i> Guardar cambios</button>
          <hr>
          <div class="form-group">
            <label for="exampleInputEmail1">Nombre del rol</label>
            <input :disabled="!canCreateRole()"
                   v-model="selectedRolObject.label"
                   type="text"
                   class="form-control"
                   placeholder="Nombre del rol">
          </div>
          <div class="row"
               style="margin-top:10px;"
               v-for="permission in permissions"
               v-if="selectedRol">
            <div class="col-md-12">
              <h3>{{permission.group}}</h3>
            </div>
            <div class="col-md-12">
              <div class="row"
                   style="margin-top:10px;"
                   v-if="permission.permissions.length > 0">
                <div :key="perm.name"
                     style="margin:10px"
                     class="col-md-4"
                     v-for="perm in permission.permissions">
                  <el-switch active-color="#13ce66"
                             inactive-color="#ff4949"
                             :disabled="!canCreateRole() || !canEditRol()"
                             @change="changePermission(perm)"
                             :active-text="perm.label"
                             :value="isCheched(perm)">
                  </el-switch>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <!--
                    <div class="list-group" id="list-tab" role="tablist">
                        <a @click="showAllUsers()" class="list-group-item list-group-item-action" id="list-home-list" data-toggle="list" role="tab" aria-controls="home"><i class="icon users"></i>Mostrar todos los usuarios</a>
                        <a class="list-group-item list-group-item-action active"><i class="icon key"></i>Roles y Permisos</a>
                    </div>
                    -->
      <el-menu default-active="2"
               class="el-menu-vertical-demo"
               background-color="#545c64"
               text-color="#ffffff"
               active-text-color="#ffd04b">
        <el-menu-item index="1"
                      @click="showAllUsers()">
          <i class="el-icon-menu white"></i>
          <span slot="title">Mostrar todos los usuarios</span>
        </el-menu-item>
        <el-menu-item index="2"
                      @click="goToRoles()">
          <i class="el-icon-setting white"></i>
          <span slot="title">Roles y permisos</span>
        </el-menu-item>
      </el-menu>
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
  mounted() {
    this.getRoles()
  },
  destroyed() {
    this.$off('reloadModels')
  },
  name: 'Main',
  components: {
    users,
    navBar
  },
  methods: {
    capitalize(s) {
      return s.toLowerCase().replace(/\b./g, function(a) {
        return a.toUpperCase()
      })
    },
    formatRolName(name) {
      return this.capitalize(name.toLowerCase())
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

    canEditRol() {
      var canEditRol = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canEditRol) {
          canEditRol = this.eachRolesPermissions(rol, this.havePermissionToEditRol)
        }
      })
      return canEditRol
    },
    canCreateRol() {
      var canCreateRol = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canCreateRol) {
          canCreateRol = this.eachRolesPermissions(rol, this.havePermissionToCreateRol)
        }
      })
      return canCreateRol
    },
    canDeleteRol() {
      var canDeleteRol = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canDeleteRol) {
          canDeleteRol = this.eachRolesPermissions(rol, this.havePermissionToDeleteRol)
        }
      })
      return canDeleteRol
    },

    havePermissionToCreateRol(permission) {
      return (permission.trim() === 'createRoles')
    },
    havePermissionToEditRol(permission) {
      return (permission.trim() === 'editRoles')
    },
    havePermissionToDeleteRol(permission) {
      return (permission.trim() === 'deleteRoles')
    },

    canCreateRole() {
      if (!_.isNil(this.selectedRolObject)) {
        return (this.selectedRolObject.name !== 'Administrador')
      }
    },
    canDeleteRole() {
      if (!_.isNil(this.selectedRolObject)) {
        return (this.selectedRolObject.name !== 'Miembro' && this.selectedRolObject.name !== 'Administrador' && this.canDeleteRol())
      }
    },
    addRole() {
      if (this.rolName !== '') {
        api.createRol({
          name: this.rolName.replace(/\s/g, ''),
          label: this.formatRolName(this.rolName),
          permissions: 'createProcess,editProcess,deleteProcess,SeeProcess'
        })
          .then(this.showSuccessCreateMessage)
          .catch(this.showErrorCreateMessage)
      } else {
        this.showEmptyMessage()
      }
    },
    savePermission() {
      if (this.selectedRolObject.label === '') {
        this.$message({
          message: 'Debes introducir un nombre para el rol.',
          type: 'error'
        })
        return
      }

      this.selectedRolObject.label = this.formatRolName(this.selectedRolObject.label)

      api.updateRol(this.selectedRolObject.id, this.selectedRolObject).then(this.showSuccessUpdateMessage)
    },
    refresh() {
      this.getRoles()
    },
    deleteRole() {
      api.removeRol(this.selectedRolObject.id).then(this.showSuccessRemoveMessage)
    },
    showErrorCreateMessage() {
      this.$message({
        message: 'El nombre del rol ya existe.',
        type: 'error'
      })
    },
    showEmptyMessage() {
      this.$message({
        message: 'Debes introducir un nombre para el rol.',
        type: 'error'
      })
    },
    showSuccessUpdateMessage() {
      this.$auth.fetch()
      this.$message({
        message: 'El rol se ha actualizado correctamente',
        type: 'success'
      })
    },
    showSuccessCreateMessage() {
      this.getRoles()
      this.$message({
        message: 'El rol se ha creado correctamente',
        type: 'success'
      })
    },
    showSuccessRemoveMessage(response) {
      if (response.data.status === 'success') {
        this.getRoles()
        this.$message({
          message: 'El rol se ha eliminado correctamente',
          type: 'success'
        })
      } else {
        this.$message({
          message: 'El rol no se ha podido eliminar, verifique que no este en uso.',
          type: 'error'
        })
      }
    },
    isCheched(perm) {
      var checked = false
      if (this.selectedRolObject) {
        var permissions = this.selectedRolObject.permissions.split(',')
        if (permissions) {
          _.each(permissions, (permision) => {
            if (permision === perm.name) {
              checked = true
            }
          })
        }
      }
      return checked
    },
    showAllUsers() {
      this.$router.push({
        name: 'users'
      })
    },
    changeRol(rol) {
      var rol = _.find(this.roles, {
        id: rol
      })
      if (!rol.permissions) {
        rol.permissions = ''
      }
      this.selectedRolObject = rol
    },
    changePermission(v) {
      var currentPermissions = this.selectedRolObject.permissions.split(',')

      console.log(currentPermissions)

      var exist = false
      var position = null
      _.each(currentPermissions, function(permision, k) {
        if (permision === v.name) {
          exist = true
          position = k
        }
      })

      if (exist) {
        currentPermissions.splice(position, 1)
        this.selectedRolObject.permissions = currentPermissions.join(',')
      } else {
        currentPermissions.push(v.name)
        this.selectedRolObject.permissions = currentPermissions.join(',')
      }

    },
    getRoles() {
      q.all([
        api.getRoles(this.limit, this.offset, this.pageUsers, null, this.searchUser)
      ]).then((response) => {
        this.roles = _.clone(response[0].data, true)
        this.selectedRol = this.roles[0].id
        this.selectedRolObject = this.roles[0]
        this.loading = false
      })
    }
  },
  data() {
    return {
      selectedRolObject: {},
      rolName: '',
      permissions: [
        {
          group: 'Procesos',
          permissions: [
            {
              name: 'createProcess',
              label: 'Crear procesos'
            },
            {
              name: 'editProcess',
              label: 'Editar procesos'
            },
            {
              name: 'deleteProcess',
              label: 'Eliminar procesos'
            },
            {
              name: 'SeeProcess',
              label: 'Ver procesos'
            },
            {
              name: 'changeConfiguration',
              label: 'Configurar proceso'
            },
            {
              name: 'administrate',
              label: 'Administrar'
            },
            {
              name: 'generateWind',
              label: 'Generar datos de viento'
            },
            {
              name: 'createTemplates',
              label: 'Crear plantillas'
            },
            {
              name: 'useTemplate',
              label: 'Crear plantillas'
            },
            {
              name: 'changeInitialConfigData',
              label: 'Cambiar configuración'
            },
            {
              name: 'Experimental',
              label: 'Agregar funcionalidad experimental'
            },
            {
              name: 'areas',
              label: 'Áreas'
            },
            {
              name: 'rationingCost',
              label: 'Costos de Racionamiento'
            },
            {
              name: 'fuels',
              label: 'combustibles'
            },
            {
              name: 'segments',
              label: 'Segmentos'
            },
            {
              name: 'blocks',
              label: 'Bloques'
            },
            {
              name: 'scenarios',
              label: 'Escenarios'
            },
            {
              name: 'demands',
              label: 'Demanda'
            },
            {
              name: 'fuelCosts',
              label: 'Costo de combustible'
            },
            {
              name: 'thermalConfigs',
              label: 'Plantas termicas'
            },
            {
              name: 'thermalExpansions',
              label: 'Expansión termicas'
            },
            {
              name: 'smallConfigs',
              label: 'Plantas menores'
            },
            {
              name: 'smallExpansions',
              label: 'Expansión planta menor'
            },
            {
              name: 'hydroConfigs',
              label: 'Plantas hydro'
            },
            {
              name: 'hydroExpansions',
              label: 'Expansión hydro'
            },
            {
              name: 'inflows',
              label: 'Afluentes hidricos'
            },
            {
              name: 'windConfigs',
              label: 'Plantas eólicas'
            },
            {
              name: 'windExpansions',
              label: 'Expansiones eólicas'
            },
            {
              name: 'speedIndices',
              label: 'Indices de velocidad eólicos'
            },
            {
              name: 'inflowWinds',
              label: 'Velocidad del viento'
            },
            {
              name: 'storageConfigs',
              label: 'Almacenamiento'
            },
            {
              name: 'storageExpansions',
              label: 'Expansion de almacenamiento'
            },
            {
              name: 'lines',
              label: 'Red de transmisión'
            },
            {
              name: 'linesExpansions',
              label: 'Expansión de transmisión'
            }
          ]
        },
        {
          group: 'Usuarios',
          permissions: [
            {
              name: 'seeUsers',
              label: 'Ver listado de usuarios'
            },
            {
              name: 'seeUser',
              label: 'Ver usuario'
            },
            {
              name: 'seeUserModels',
              label: 'Ver modelos de usuario'
            },
            {
              name: 'editUser',
              label: 'Editar usuario'
            },
            {
              name: 'deleteUsers',
              label: 'Eliminar usuarios'
            },
            {
              name: 'createUsers',
              label: 'Crear usuarios'
            },
            {
              name: 'downloadUsers',
              label: 'Descargar usuarios'
            },
            {
              name: 'seeStatistics',
              label: 'Ver estadisticas'
            }
          ]
        },
        {
          group: 'Roles',
          permissions: [
            {
              name: 'seeRoles',
              label: 'Ver roles'
            },
            {
              name: 'editRoles',
              label: 'Editar roles'
            },
            {
              name: 'deleteRoles',
              label: 'Eliminar roles'
            },
            {
              name: 'createRoles',
              label: 'Crear roles'
            }
          ]
        }
      ],
      selectedRol: null,
      options: [],
      loading: true,
      roles: {
        data: []
      }
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
