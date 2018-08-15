<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8"
         v-if="$auth">
      <h3><i class="icon user circular olive inverted"></i>ACTUALIZAR DATOS DE {{name.toUpperCase()}}</h3>
      <el-tag :key="rol.id"
              type="danger"
              v-if="$auth.user().roles"
              style="margin-right:10px;"
              v-for="rol in $auth.user().roles"><i class="icon key"></i>{{rol.label}}</el-tag>
      <el-tag v-if="$auth.user().meta"
              type="warning">{{$auth.user().meta.models}} disponibles</el-tag>
      <hr>
      <div id="main-offer-form">
        <div class="form-group required">
          <label class="control-label">Nombre</label>
          <input v-model="name"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Nombre"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Apellido</label>
          <input v-model="lastname"
                 type="text"
                 name="lastname"
                 class="form-control"
                 placeholder="Apellido"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Compañia</label>
          <input v-model="company"
                 type="text"
                 name="company"
                 class="form-control"
                 placeholder="Empresa"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Teléfono</label>
          <input v-model="phone"
                 type="text"
                 name="phone"
                 class="form-control"
                 placeholder="Teléfono"
                 required="">
        </div>
        <div class="form-group required">
          <label class="control-label">Email</label>
          <input v-model="email"
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
            <input v-model="password"
                   type="password"
                   name="password"
                   class="form-control"
                   placeholder="Contraseña"
                   required="">
          </div>
          <div class="form-group required">
            <label class="control-label">Repetir contraseña</label>
            <input v-model="password_confirmation"
                   type="password"
                   name="password"
                   class="form-control"
                   placeholder="Repetir contraseña"
                   required="">
          </div>
        </div>
        <center>
          <button style="margin-right:10px;"
                  @click="goToMain"
                  class="btn btn-dark float-right">
            <i class="icon cancel"></i>Cancelar </button>
          <button style="margin-right:10px;"
                  @click="update"
                  class="btn btn-primary float-right">
            <i class="icon save"></i>Actualizar
          </button>
        </center>
      </div>
    </div>
    <div class="col-md-4">
      <el-menu default-active="1"
               class="el-menu-vertical-demo"
               background-color="#545c64"
               text-color="#ffffff"
               active-text-color="#ffd04b">
        <el-menu-item index="1">
          <i class="el-icon-tickets white"></i>
          <span slot="title">Datos personales</span>
        </el-menu-item>
        <el-menu-item @click="goToTerms()"
                      index="2">
          <i class="el-icon-printer white"></i>
          <span slot="title">Terminos y condiciones</span>
        </el-menu-item>
        <el-menu-item index="3"
                      @click="goToAnswers()">
          <i class="el-icon-info white"></i>
          <span slot="title">Preguntas frecuentes</span>
        </el-menu-item>
        <el-menu-item index="3"
                      @click="goToDeleteAccount()">
          <i class="el-icon-delete white"></i>
          <span slot="title">Eliminar cuenta</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</div>

</template>

<script>
import navBar from './utils/Navbar';
import api from '../api/process.js';

export default {
  /* Nombre del componente */
  name: 'Profile',
  /*
  * Constructor
  */
  mounted() {
    this.setData()
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
    * Setea las variables iniciales
    */
    setData() {
      this.email = this.$auth.user().email
      this.name = this.$auth.user().name
      this.lastname = this.$auth.user().lastname
      this.company = this.$auth.user().meta.company
      this.phone = this.$auth.user().meta.phone
    },
    /*
    * Permite capitalizar un string
    */
    capitalize(s) {
      return s.toLowerCase().replace(/\b./g, function(a) {
        return a.toUpperCase()
      })
    },
    /*
    * Permite formatear nombre
    *
    */
    formatName() {
      return this.capitalize(this.name.toLowerCase())
    },
    /*
    * Permite formatear apellido
    *
    */
    formatLastName() {
      return this.capitalize(this.lastname.toLowerCase())
    },
    /*
    * Permite formatear email
    *
    */
    formatEmail() {
      return this.email.toLowerCase()
    },
    /*
    * Permite formatear el nombre de la compañia
    *
    */
    formatCompany() {
      return this.company.toUpperCase()
    },
    /*
    * Permite modificar datos usuarios
    *
    */
    update() {
      if (this.changePassword) {
        if (this.password !== this.password_confirmation) {
          this.$message({
            type: 'error',
            message: 'El password y la confirmación del password no coinciden'
          })
          return
        }
      }

      var user = {
        id: this.$auth.user().id,
        name: this.formatName(this.name),
        email: this.formatEmail(this.email),
        lastname: this.formatLastName(this.lastname),
        roles: this.$auth.user().roles,
        meta: {
          company: this.company,
          terms_and_cond: 1,
          marketing: 0,
          phone: this.phone
        }
      }

      if (this.password !== '') {
        user.password = this.password
      }

      this.$confirm('Estas modificando tu usuario. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        api.updateUser(user).then(() => {
          this.$auth.fetch()
          this.setData()
          this.$message({
            message: 'Adverencia, Los permisos ya estan guardados.',
            type: 'success'
          })
        })
      })
    },
    /*
    * Permite ir a eliminar cuenta
    *
    */
    goToDeleteAccount() {
      this.$router.push({
        name: 'deleteAccount'
      })
    },
    /*
    * Permite ir a la pagina principal
    *
    */
    goToMain() {
      this.$router.push({
        name: 'main'
      })
    },
    /* Permite ir a la pagina de preguntas */
    goToAnswers() {
      this.$router.push({
        name: 'answers'
      })
    },
    /*
    * Permite ir a la pagina de terminos y condiciones
    */
    goToTerms() {
      this.$router.push({
        name: 'terms'
      })
    }
  },
  data() {
    return {
      changePassword: false,
      name: '',
      lastname: '',
      company: '',
      password: '',
      phone: '',
      password_confirmation: '',
      email: '',
      loading: true
    }
  }
}

</script>
