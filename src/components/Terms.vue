<template>
<div class="container">
  <nav-bar></nav-bar>
  <div class="row mt-5">
    <div class="col-md-8">
      <h3><i class="icon check circular olive inverted"></i>TERMINOS Y CONDICIONES</h3>
      <div class="maia-article"
           role="article">
        <div class="maia-teleport"
             id="content"></div>
 <small>Autorizo expresamente a MAEP quien, actuando en calidad de Responsable del Tratamiento de Datos Personales, está recolectando información personal para el adecuado desarrollo de sus actividades comerciales, así como para el fortalecimiento de sus relaciones con terceros, pudiendo almacenar, usar, circular y suprimir estos Datos Personales considerando, más no limitando, el uso siguiente a los datos personales: • Permitir la participación de los Titulares en actividades de mercadeo y promocionales (incluyendo la participación en concursos, rifas y sorteos) realizados por MAEP;  • Evaluar la calidad del servicio, realizar estudios de mercado sobre necesidades, hábitos de consumo y análisis estadísticos para usos internos;  • Dar respuesta a consultas, peticiones, quejas y reclamos que sean realizadas por los Titulares y organismos de control y trasmitir los Datos Personales a las demás autoridades que en virtud de la ley aplicable deban recibir los Datos Personales;  • Para eventualmente contactar, vía correo electrónico, o por cualquier otro medio, a personas naturales con quienes tiene o ha tenido relación, tales como, sin que la enumeración signifique limitación, trabajadores y familiares de éstos, accionistas, consumidores, clientes, distribuidores, proveedores, acreedores y deudores, para las finalidades antes mencionadas.  • Transferir la información recolectada a distintas áreas de MAEP para el desarrollo de sus operaciones (recaudo de cartera y cobros administrativo, tesorería, contabilidad, entre otros); • Para la atención de requerimientos judiciales o administrativos y el cumplimiento de mandatos judiciales o legales;  • Registrar sus datos personales en los sistemas de información de MAEP y en sus bases de datos comerciales y operativas;  • Cualquier otra actividad de naturaleza similar a las anteriormente descritas que sean necesarias para desarrollar el objeto social de MAEP con el propósito de su uso para contacto posterior.
</small>


      </div>
    </div>
    <div class="col-md-4">
      <el-menu default-active="2"
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
import processed from './utils/Processed';
import api from '../api/process.js';
import navBar from './utils/Navbar';
import queue from './utils/Queue';
import q from 'q';

export default {
  /* Nombre del componente */
  name: 'Terms',
  /* Componentes usados */
  components: {
    navBar,
    processed,
    queue
  },
  /* Metodos publicos */
  methods: {
    /*
    * Redirige a la funcion principal
    */
    goToMain() {
      this.$router.push({
        name: 'main'
      })
    },
    /*
    * Redirige a eliminar cuenta
    */
    goToDeleteAccount() {
      this.$router.push({
        name: 'deleteAccount'
      })
    },
    /*
    * Redirige a la pagina de preguntas
    */
    goToAnswers() {
      this.$router.push({
        name: 'answers'
      })
    },
    /*
    * Redirige a la pagina de terminos y condiciones
    */
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
  }
}

</script>
