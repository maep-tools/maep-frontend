<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8">
      <h3><i class="icon question circular olive inverted"></i>PREGUNTAS FRECUENTES</h3>
      <h4>¿Cuantos modelos puedo crear?</h4>
      <p class="terms">Puedes crear 3 modelos por defecto, si necesitas crear mas debes ponerte en contacto con el administrador.</p>
      <h4>¿Quienes son los creadores del software?</h4>
      <p class="terms">
        

<p>Este software fue desarrollado por la Universidad de los Andes y ha sido soportado y financiado en
parte por las instituciones mencionadas a continuación.

<ul style="font-weight: bold; margin-top: 10px;">
  <li>1. Universidad de los Andes</li>
  <li>2. Universidad del Rosario</li>
  <li>3. Cornell University</li>
  <li>4. ISAGEN</li>
  <li>5. CEIBA</li>

</ul>
      </p>
      <h4>¿Donde puedo encontrar la documentación del sistema?</h4>
      <p class="terms">
          <a download class="btn btn-primary" href="/static/doc.pdf">Descargar información técnica</a>

      </p>
    </div>
    <div class="col-md-4">
      <el-menu default-active="3"
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

export default {
  name: 'Main',
  components: {
    navBar
  },
  methods: {
    goToProfile() {
      this.$router.push({
        name: 'profile'
      })
    },
    goToDeleteAccount() {
      this.$router.push({
        name: 'deleteAccount'
      })
    },
    goToMain() {
      this.$router.push({
        name: 'main'
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
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
