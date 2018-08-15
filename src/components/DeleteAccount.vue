<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8">
      <h3><i class="icon trash circular grey inverted"></i>ELIMINAR CUENTA</h3>
      <p class="terms">Al eliminar la cuenta borraremos todos tus modelos de la base de datos y sera imposible recuperarlos. Ademas eliminaremos todos los datos personales de nuestro sistema.
      </p>
      <p class="terms">No volveras a recibir actualizaciones por correo electronico.</p>
      <button style="margin-right:10px;"
              @click="deleteAccount()"
              class="btn btn-danger"><i class="icon trash"></i>ELIMINAR CUENTA</button>
      <button @click="goMain()"
              class="btn btn-primary"><i class="icon cancel"></i>CANCELAR</button>
    </div>
    <div class="col-md-4">
      <el-menu default-active="4"
               class="el-menu-vertical-demo"
               background-color="#545c64"
               text-color="#ffffff"
               active-text-color="#ffd04b">
        <el-menu-item @click="goToProfile()"
                      index="1">
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
        <el-menu-item index="4"
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
import q from 'q';

export default {
  mounted() {
    this.email = this.$auth.user().email
    this.name = this.$auth.user().name
  },
  name: 'Main',
  components: {
    navBar
  },
  methods: {
    deleteAccount() {
      this.$confirm('Vamos a borrar tu cuenta. Estas completamente seguro?', 'Notificación importante', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        api.deleteUser(this.$auth.user().id).then(this.goLogin)
      })
    },
    goMain() {
      this.$router.push({
        name: 'main'
      })
    },
    goLogin() {
      this.$auth.logout()
      this.$router.push({
        name: 'login',
        query: {
          message: 'Cuenta eliminada'
        }
      })
    },
    goToAnswers() {
      this.$router.push({
        name: 'answers'
      })
    },
    goToTerms() {
      this.$router.push({
        name: 'terms'
      })
    },
    goToProfile() {
      this.$router.push({
        name: 'profile'
      })
    }
  },
  data() {
    return {

    }
  }
}

</script>

<style lang="css" scoped="">
</style>
