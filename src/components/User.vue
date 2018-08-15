<template>
<div class="container"
     v-loading="loading">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8"
         v-if="user">
      <h3><i class="user icon circular inverted yellow"></i>{{this.user.name.toUpperCase()}} {{this.user.lastname.toUpperCase()}}</h3>
      <el-tag :key="rol.id"
              type="danger"
              v-if="user.roles"
              style="margin-right:10px;"
              v-for="rol in user.roles"><i class="icon key"></i><b>{{rol.label}}</b></el-tag>
      <el-tag style="margin-right:10px;"
              v-if="user.meta"
              type="warning">{{user.meta.models}} <b>disponibles</b></el-tag>
      <hr>
      <div id="main-offer-form">
        <div class="form-group required">
          <label class="control-label">Nombre</label>
          <input :disabled="!canEdit()"
                 v-model="user.name"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Nombre"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Apellido</label>
          <input :disabled="!canEdit()"
                 v-model="user.lastname"
                 type="text"
                 name="lastname"
                 class="form-control"
                 placeholder="Apellido"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Compañia</label>
          <input :disabled="!canEdit()"
                 v-model="user.meta.company"
                 type="text"
                 name="company"
                 class="form-control"
                 placeholder="Empresa"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Teléfono</label>
          <input :disabled="!canEdit()"
                 v-model="user.meta.phone"
                 type="text"
                 name="phone"
                 class="form-control"
                 placeholder="Teléfono"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Email</label>
          <input :disabled="!canEdit()"
                 v-model="user.email"
                 type="text"
                 name="email"
                 class="form-control"
                 placeholder="Dirección de correo"
                 required="">
        </div>
        <button @click="changePassword = true"
                class="btn btn-outline-danger"
                v-if="!changePassword">
          <i class="icon key"></i> Solicitar cambio de contraseña</button>
        <div v-if="changePassword">
          <div class="form-group required">
            <label class="control-label">Contraseña</label>
            <input :disabled="!canEdit()"
                   v-model="user.password"
                   type="password"
                   name="password"
                   class="form-control"
                   placeholder="Contraseña*"
                   required="">
          </div>
          <div class="form-group required">
            <label class="control-label">Repetir contraseña</label>
            <input :disabled="!canEdit()"
                   v-model="user.password_confirmation"
                   type="password"
                   name="password"
                   class="form-control"
                   placeholder="Repetir contraseña*"
                   required="">
          </div>
        </div>
        <center>
          <button style="margin-left:10px;"
                  @click="goToMain()"
                  class="btn btn-dark float-right">
            <i class="icon cancel"></i>Cancelar
          </button>
          <button :disabled="!canEdit()"
                  @click="saveUser()"
                  class="btn btn-primary float-right">
            <i class="icon save"></i>Actualizar
          </button>
        </center>
      </div>
    </div>
    <div class="col-md-4">
      <h3><i class="cube icon circular inverted yellow"></i>PROPIEDADES</h3>
      <el-tabs style="height: 200px;">
        <el-tab-pane label="Configuración de usuario">
          <div class="form-group">
            <label>Casos disponibles</label>
            <br>
            <el-input-number :min="0" size="mini"
                             :disabled="!canEdit()"
                             v-model="user.meta.models"></el-input-number>
          </div>
          <el-switch :disabled="!canEdit()"
                     v-model="user.meta.is_active"
                     style="display: block"
                     active-text="Cuenta Activada"
                     inactive-text="Cuenta Desactivada"
                     active-color="#13ce66"
                     inactive-color="#ff4949">
          </el-switch>
          <hr>
          <el-menu v-if="canSeeUserModels()"
                   default-active="0"
                   class="el-menu-vertical-demo"
                   background-color="#545c64"
                   text-color="#ffffff">
            <el-menu-item @click="goToUserModel()"
                          index="1">
              <i class="el-icon-menu"></i>
              <span slot="title">Modelos asociados</span>
            </el-menu-item>
          </el-menu>
        </el-tab-pane>
        <el-tab-pane label="Roles">
          <p>Los privilegios le permitiran a un usuario acceder a ciertas areas del sistema.</p>
          <hr>
          <div class="row">
            <div class="col-md-12">
              <button :disabled="!canCreateOrEditRol()"
                      @click="goToRoles()"
                      class="btn btn-outline-danger float-right">
                <i class="icon key"></i>Personalizar</button>
              <button :disabled="!canEdit()"
                      @click="saveRoles()"
                      class="btn btn-outline-primary float-left">
                <i class="icon save"></i> Guardar privilegios</button>
            </div>
          </div>
          <hr>
          <div class="row">
            <div class="col-md-12">
              <div :key="rol.id"
                   v-for="rol in roles"
                   style="margin-bottom:10px;">
                <el-switch :disabled="!canEdit()"
                           @change="addRoleIfNotExist(rol)"
                           :value="checkIfHaveThisRole(rol)"
                           style="display: block"
                           active-color="#13ce66"
                           inactive-color="#ff4949"
                           :active-text="rol.label">
                </el-switch>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</div>

</template>

<script>
import navBar from './utils/Navbar';
import api from '../api/process.js';
import q from 'q';

export default {
  /*
  * Nombre del componente
  */
  name: 'User',
  /*
  * Acción que se ejecuta al montar
  */
  mounted() {
    this.getUser()
  },
  /*
  * Componentes asociados
  */
  components: {
    navBar
  },
  /*
  * Metodos publicos
  */
  methods: {
    /*
    * Permite capitalizar un string
    */
    capitalize(s) {
      return s.toLowerCase().replace(/\b./g, function(a) {
        return a.toUpperCase()
      })
    },
    /*
    * Agrega formato al nombre
    */
    formatName(name) {
      return this.capitalize(name)
    },
    /*
    * Agrega formato al apellido
    */
    formatLastName(lastname) {
      return this.capitalize(lastname)
    },
    /*
    * Agrega formato al email
    */
    formatEmail(email) {
      return email.toLowerCase()
    },
    /*
    * Agrega formato a la empresa
    */
    formatCompany(company) {
      return company.toUpperCase()
    },
    /*
    * Permite guardar los roles asociados al usuario
    */
    saveRoles() {
      this.$confirm('Estas modificando los permisos del usuario. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        api.updateUser(this.user).then(() => {
          this.$auth.fetch()
          this.$message({
            message: 'Adverencia, Los permisos ya estan guardados.',
            type: 'success'
          })
        })
      })
    },
    /*
    * Permite ir a visualizar los modelos del usuario
    */
    goToUserModel() {
      this.$router.push({
        name: 'userModel',
        params: {
          id: this.user.id
        }
      })
    },
    /*
    * Permite guardar un usuario
    */
    saveUser() {

      if (this.changePassword) {

        if (this.user.password !== this.user.password_confirmation && this.changePassword) {
          this.$message({
            type: 'error',
            message: 'La confirmación del password y el password no coincide'
          })
          return
        }

        if (!this.user.password) {
          this.$message({
            type: 'error',
            message: 'El password es requerido'
          })
          return
        }

        if (this.user.password.length < 6) {
          this.$message({
            type: 'error',
            message: 'El password debe de tener mínimo 6 caracteres'
          })
          return
        }

      }

      if (((this.user.password !== this.user.password_confirmation) && this.changePassword) || this.user.password === '') {
        this.$message({
          type: 'error',
          message: 'La confirmación del password y el password no coincide'
        })
        return
      }

      if (this.user.name === '' || this.user.lastname === '' || this.user.meta.company === '' || this.user.meta.phone === '' || this.user.email === '') {

        this.$message({
          type: 'error',
          message: 'Debes agregar todos los campos'
        })

        return false

      }

      this.user.meta.company = this.formatCompany(this.user.meta.company)
      this.user.name = this.formatName(this.user.name)
      this.user.lastname = this.formatLastName(this.user.lastname)
      this.user.email = this.formatEmail(this.user.email)

      this.$confirm('Estas modificando el usuario. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        api.updateUser(this.user).then(() => {
          this.$auth.fetch()
          this.$message({
            message: 'Adverencia, El usuario ya esta guardado.',
            type: 'success'
          })
        })
      })
    },
    /*
    * Permite validar si el usuario tiene el rol
    */
    checkIfHaveThisRole(rol) {
      var rol = _.find(this.user.roles, {
        name: rol.name
      })
      if (rol) {
        return true
      }
    },
    /*
    * Permite agregar el rol si el usuario no lo tiene
    */
    addRoleIfNotExist(rol) {
      var exist = _.find(this.user.roles, {
        name: rol.name
      })

      if (exist) {
        this.user.roles = this.user.roles.filter(function(item) {
          return item.id !== rol.id
        })
      } else {
        this.user.roles.push(rol)
      }
    },
    /*
    * Redirige a la pagina de roles
    */
    goToRoles() {
      this.$router.push({
        name: 'roles'
      })
    },
    /*
    * Redirige a la página principal
    */
    goToMain() {
      this.$router.push({
        name: 'users'
      })
    },
    /*
    * Permite obtener el usuario
    */
    getUser() {
      q.all([
        api.getUser(this.$route.params.id),
        api.getRoles()
      ]).then((response) => {
        this.user = _.clone(response[0].data, true)
        this.user.meta.is_active = (this.user.meta.is_active === 1) ? true : false
        this.roles = response[1].data
        this.loading = false
      })
    },
    canEdit() {
      var canEdit = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canEdit) {
          canEdit = this.eachRolesPermissions(rol, this.havePermissionToEditUser)
        }
      })
      return canEdit
    },
    canCreateOrEditRol() {
      var canCreateOrEditRol = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canCreateOrEditRol) {
          canCreateOrEditRol = this.eachRolesPermissions(rol, this.havePermissionToEditRolOrCreateRol)
        }
      })
      return canCreateOrEditRol
    },
    canSeeUserModels() {
      var canSeeUserModels = false
      _.each(this.$auth.user().roles, (rol) => {
        if (!canSeeUserModels) {
          canSeeUserModels = this.eachRolesPermissions(rol, this.havePermissionToSeeUserModels)
        }
      })
      return canSeeUserModels
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
    havePermissionToEditUser(permission) {
      return (permission.trim() === 'editUser')
    },
    havePermissionToEditRolOrCreateRol(permission) {
      return (permission.trim() === 'editRoles' || permission.trim() === 'createRoles')
    },
    havePermissionToSeeUserModels(permission) {
      return (permission.trim() === 'seeUserModels')
    }
  },
  data() {
    return {
      changePassword: false,
      loading: true,
      roles: [],
      user: {
        roles: [],
        meta: {
          company: '',
          phone: '',
          models: ''
        },
        name: '',
        lastname: '',
        email: '',
        company: '',
        password: '',
        password_confirmation: '',
        phone: ''
      }
    }
  }
}

</script>
