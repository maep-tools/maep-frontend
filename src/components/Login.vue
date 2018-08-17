<template>
<div>
  <el-dialog
  title="Términos y condiciones"
  :visible.sync="visibleModalTerms"
  width="50%">
  <span>Autorizo expresamente a MAEP quien, actuando en calidad de Responsable del Tratamiento de Datos Personales, está recolectando información personal para el adecuado desarrollo de sus actividades comerciales, así como para el fortalecimiento de sus relaciones con terceros, pudiendo almacenar, usar, circular y suprimir estos Datos Personales considerando, más no limitando, el uso siguiente a los datos personales: • Permitir la participación de los Titulares en actividades de mercadeo y promocionales (incluyendo la participación en concursos, rifas y sorteos) realizados por MAEP;  • Evaluar la calidad del servicio, realizar estudios de mercado sobre necesidades, hábitos de consumo y análisis estadísticos para usos internos;  • Dar respuesta a consultas, peticiones, quejas y reclamos que sean realizadas por los Titulares y organismos de control y trasmitir los Datos Personales a las demás autoridades que en virtud de la ley aplicable deban recibir los Datos Personales;  • Para eventualmente contactar, vía correo electrónico, o por cualquier otro medio, a personas naturales con quienes tiene o ha tenido relación, tales como, sin que la enumeración signifique limitación, trabajadores y familiares de éstos, accionistas, consumidores, clientes, distribuidores, proveedores, acreedores y deudores, para las finalidades antes mencionadas.  • Transferir la información recolectada a distintas áreas de MAEP para el desarrollo de sus operaciones (recaudo de cartera y cobros administrativo, tesorería, contabilidad, entre otros); • Para la atención de requerimientos judiciales o administrativos y el cumplimiento de mandatos judiciales o legales;  • Registrar sus datos personales en los sistemas de información de MAEP y en sus bases de datos comerciales y operativas;  • Cualquier otra actividad de naturaleza similar a las anteriormente descritas que sean necesarias para desarrollar el objeto social de MAEP con el propósito de su uso para contacto posterior.
</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="visibleModalTerms = false">Cerrar</el-button>
  </span>
</el-dialog>
  <!-- DIALOGO QUE CAPTURA COMO USARA EL SISTEMA EL USUARIO -->
  <el-dialog title="Uso del sistema"
             :visible.sync="visibilityDialogHowUserKnowUs"
             width="30%"
             center>
    <span>Es muy importante para nosotros saber como vas a usar el sistema.</span>
    <hr>
    <center>
      <button @click="setUse('comercial')" class="btn btn-outline-primary">Uso comercial</button>
      <button @click="setUse('academico')" class="btn btn-outline-primary">Uso academico</button>
      <button @click="setUse('desarrollo')" class="btn btn-outline-primary">Desarrollo</button>
    </center>
    <span slot="footer"
          class="dialog-footer">
    <el-button @click="visibilityDialogHowUserKnowUs = false">Cancelar</el-button>
    <el-button v-if="use" type="primary" @click="registerNew()">Continuar registro</el-button>
  </span>
  </el-dialog>


  <section class="bg-white hero p-0">
    <div class="container-fluid">
      <div class="row">
        <!-- EMPIEZA LA PANTALLA QUE MUESTRA EL LOGO Y UNA FRASE SOBRE EL SOFTWARE -->
        <div class="col-md-6 col-sm-12 bg-light text-center col-fixed hidden-mobile">
          <div>
            <img class="animated fadeIn"
                 width="200"
                 src="/static/Vector.svg">
          </div>
          <h3 class="pt-4">
                  <span style="display: none;">MAEP</span><br/>
                  <span style="color:black;">
                     <vue-typer style="color:black;" text='Modelo de Análisis Eléctrico y Planeamiento'></vue-typer>
                  </span>
               </h3>
          <p class="mt-4"
             style="color:black;">
                Herramienta para el planeamiento de la operación de sistemas hidrotérmicos.
          </p>
          <div class="pt-1">
            <button @click="displayPopUp()" style="color:black;"
                    class="button ui yellow">
              <i class="icon info"></i> Información del sistema
            </button>
          </div>
        </div>
        <!-- FINALIZA LA PANTALLA QUE MUESTRA EL LOGO Y UNA FRASE SOBRE EL SOFTWARE -->
        <!-- EMPIEZA LA PANTALLA QUE MUESTRA EL LOGIN -->
        <div class="col-md-6 ml-auto fixed-left"
             v-if="!register && !forgotPassword && !activateAccount">
          <section class="bg-white">
            <div class="container">
              <div class="row">
                <div class="col-sm-8 mx-auto text-center">
                  <h2>
                              INICIAR SESIÓN
                           </h2>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-sm-10 mx-auto mt-2">
                  <div class="ui error message"
                       v-if="loginError">
                    <ul class="list-unstyled">
                      <li>Revisa que los datos de acceso sean validos.</li>
                    </ul>
                  </div>
                  <div id="main-offer-form">
                    <div class="form-group required">
                      <label class="control-label">Email</label>
                      <input v-model="email"
                             type="text"
                             name="email"
                             class="form-control login-input lowercase"
                             placeholder="Dirección de correo">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Contraseña</label>
                      <input v-model="password"
                             type="password"
                             name="password"
                             class="form-control login-input"
                             placeholder="Contraseña">
                    </div>
                    <center>
                      <button :disabled="!this.email || !this.password"
                              @click="login"
                              class="btn btn-primary">
                        <i class="icon play"></i>Iniciar sesión
                      </button>
                      <button @click="registerPage()"
                              class="btn btn-dark">
                        <i class="icon pencil"></i>Registro
                      </button>
                      <hr>
                      <a @click="forgotPasswordPage()"
                         style="font-weight:bold; cursor:pointer;">Olvidaste tu contraseña <i class="icon question circular small"></i></a>
                    </center>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- FINALIZA LA PANTALLA QUE MUESTRA EL LOGIN -->
        <!-- INICIA LA PANTALLA QUE MUESTRA EL REGISTRO -->
        <div class="col-md-6 ml-auto fixed-left"
             v-if="register">
          <section class="bg-white">
            <div class="container">
              <div class="row">
                <div class="col-sm-8 mx-auto text-center">
                  <h2>
                              REGISTRO DE NUEVOS USUARIOS
                           </h2>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-sm-10 mx-auto mt-2">
                  <div class="ui error message"
                       v-if="registerError">
                    <ul class="list-unstyled">
                      <li v-for="error in errors">{{error}}</li>
                    </ul>
                  </div>
                  <div id="main-offer-form">
                    <div class="form-group required">
                      <label class="control-label">Nombre</label>
                      <input v-model="name"
                             type="text"
                             name="name"
                             class="form-control login-input register-input"
                             placeholder="Nombre*">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Apellido</label>
                      <input v-model="lastname"
                             type="text"
                             name="lastname"
                             class="form-control login-input register-input"
                             placeholder="Apellido*">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Empresa</label>
                      <input v-model="company"
                             type="text"
                             name="company"
                             class="form-control login-input register-input"
                             placeholder="Empresa*">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Teléfono de contacto</label>
                      <input v-model="phone"
                             type="text"
                             name="phone"
                             class="form-control login-input register-input"
                             placeholder="Teléfono">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Email</label>
                      <input @change="validateEmail()"
                             v-model="email"
                             type="text"
                             name="email"
                             class="form-control login-input register-input"
                             placeholder="Dirección de correo*">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Contraseña</label>
                      <input v-model="password"
                             type="password"
                             name="password"
                             class="form-control login-input register-input"
                             placeholder="Contraseña*">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Confirmación de contraseña</label>
                      <input v-model="passwordConfirm"
                             type="password"
                             name="password"
                             class="form-control login-input register-input"
                             placeholder="Repetir contraseña*">
                    </div>
                    <div class="form-group">
                          <el-checkbox v-model="checked"> Acepto condiciones de uso de acuerdo a la ley 1581 de 2012</el-checkbox>
                          <small style="cursor: pointer;" @click="visibleModalTerms = true">(Información)</small>
                    </div>
                    <center>
                      <button :disabled="passwordConfirm == '' || !checked || name == '' || lastname == '' || company == '' || phone == '' || email == ''" @click="visibilityDialogHowUserKnowUs = true" 
                              class="btn btn-primary">
                        <i class="icon pencil"></i>Registro
                      </button>
                      <button @click="cancelRegister()"
                              class="btn btn-dark">
                        <i class="icon cancel"></i>Cancelar
                      </button>
                    </center>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- FINALIZA LA PANTALLA QUE MUESTRA EL REGISTRO -->
        <!-- INICIA LA PANTALLA QUE MUESTRA EL FORMULARIO PARA RESTABLECER PASSWORD -->
        <div class="col-md-6 ml-auto fixed-left"
             v-if="forgotPassword">
          <section class="bg-white">
            <div class="container">
              <div class="row">
                <div class="col-sm-8 mx-auto text-center">
                  <h2>
                              RESTABLECER CUENTA DE USUARIO
                           </h2>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-sm-10 mx-auto mt-2">
                  <div class="ui error message"
                       v-if="loginError">
                    <ul class="list-unstyled">
                      <li>Revisa que los datos de acceso sean validos.</li>
                    </ul>
                  </div>
                  <div id="main-offer-form">
                    <div class="form-group required">
                      <label class="control-label">Email</label>
                      <input v-model="email"
                             type="text"
                             name="email"
                             class="form-control login-input"
                             placeholder="Email">
                    </div>
                    <center>
                      <button :disabled="this.email === ''"
                              @click="reset"
                              class=" btn btn-primary">
                        <i class="icon mail"></i>Restablecer
                      </button>
                      <button @click="cancelReset()"
                              class="btn btn-dark">
                        <i class="icon cancel"></i>Cancelar
                      </button>
                    </center>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- FINALIZA LA PANTALLA QUE MUESTRA EL FORMULARIO PARA RESTABLECER PASSWORD -->
        <!-- INICIA LA PANTALLA QUE MUESTRA EL FORMULARIO PARA RESTABLECER CONTRASEÑA DESPUES DE EL CORREO -->
        <div class="col-md-6 ml-auto fixed-left"
             v-if="activateAccount">
          <section class="bg-white">
            <div class="container">
              <div class="row">
                <div class="col-sm-8 mx-auto text-center">
                  <h2>
                              RESTABLECER CUENTA DE USUARIO
                           </h2>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-sm-10 mx-auto mt-2">
                  <div class="ui error message"
                       v-if="errors.length > 0">
                    <ul class="list-unstyled">
                      <li v-for="error in errors">{{error}}</li>
                    </ul>
                  </div>
                  <div id="main-offer-form">
                    <div class="form-group required">
                      <label class="control-label">Email</label>
                      <input v-model="email"
                             type="text"
                             name="email"
                             class="form-control login-input"
                             placeholder="Email">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Password</label>
                      <input v-model="password"
                             type="password"
                             name="email"
                             class="form-control login-input"
                             placeholder="Password"
                             required="">
                    </div>
                    <div class="form-group required">
                      <label class="control-label">Confirmación de password</label>
                      <input v-model="password_confirmation"
                             type="password"
                             class="form-control login-input"
                             placeholder="Escriba otra vez su contraseña"
                             required="">
                    </div>
                    <center>
                      <button :disabled="this.email === '' || this.password === '' || this.password_confirmation ==''"
                              @click="resetAfter()"
                              class=" btn btn-primary">
                        <i class="icon flag checkered"></i>Finalizar
                      </button>
                      <button @click="cancelResetAfter()"
                              class="btn btn-dark">
                        <i class="icon cancel"></i>Cancelar
                      </button>
                    </center>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- FINALIZA LA PANTALLA QUE MUESTRA EL FORMULARIO PARA RESTABLECER CONTRASEÑA DESPUES DE EL CORREO -->
      </div>
    </div>
  </section>
  <!-- INICIA EL FOOTER -->
  <!--
   <footer class="footer hidden-mobile">
      <div class="container">
         <center>
            <span>Documentación | Preguntas frecuentes | Contacto | © 2018 Universidad de los Andes</span>
         </center>
      </div>
   </footer>
  -->
  <!-- FINALIZA EL FOOTER -->
</div>

</template>

<script>
import { VueTyper } from 'vue-typer';
import api from '../api/process';
import _ from 'lodash';
export default {
  components: {
    'vue-typer': VueTyper
  },
  name: 'Login',
  mounted() {
    var that = this
    this.getMessages()
    this.registerEvents()
    this.detectPage()
  },
  data() {
    return {
      visibleModalTerms: false,
      checked:false,
      use: null,
      visibilityDialogHowUserKnowUs: false,
      activateAccount: false,
      errors: [],
      loading: null,
      forgotPassword: false,
      register: false,
      email: '',
      password: '',
      loginError: false,
      registerError: false,
      name: '',
      lastname: '',
      company: '',
      phone: '',
      passwordConfirm: '',
      password_confirmation: ''
    }
  },
  methods: {
    setUse (use) {
      this.use = use
    },
    validateEmail(email) {
      return api.validateEmail(this.email).then((r) => {
        if (!r.data[0]) {
          this.$alert('La dirección de correo no existe, ¿Puedes revisar la dirección de correo? Te vamos a enviar un correo de activación despues del registro, Es fundamental que ingreses un correo existente para poder usar el sistema.', {
            title: 'Advertencia',
            type: 'warning',
            center: true
          })
        }
      })
    },
    validateResetAfter() {
      this.errors = []
      var errors = []
      if (this.email === '') {
        errors.push('El email no puede estar vacio.')
      }
      if (this.password === '') {
        errors.push('El password no puede estar vacio.')
      }
      if (this.password_confirmation === '') {
        errors.push('La confirmación de password no puede estar vacio.')
      }

      if (this.password.length < 6) {
        errors.push('El password debe de tener mínimo 6 caracteres')
      }

      if (this.password_confirmation !== this.password) {
        errors.push('Las contraseñas no coinciden.')
      }
      if (errors.length > 0) {
        this.errors.push(errors[0])
      }
      if (this.errors.length < 1) {
        return true
      }
    },
    resetAfter() {
      if (this.validateResetAfter()) {
        api.resetPassword({
          token: this.$route.params.id,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation
        }).then((response) => {
          if (response.data.status === 'success') {
            this.showSuccessResetMessage()
            this.login()

          }

          if (response.data.status === 'error') {
            this.showErrorResetMessage()
          }

        })
      }
    },
    showErrorResetMessage() {
      this.errors.push('No se ha podido cambiar la contraseña, la solicitud ya ha sido ejecutada o a caducado.')
    },
    showSuccessResetMessage() {
      this.activateAccount = false

      this.$alert('La contraseña fue restablecida.', {
        title: 'Advertencia',
        type: 'warning',
        center: true
      })
    },
    cancelResetAfter() {
      this.activateAccount = false
      this.$router.push({
        name: 'login',
        query: {}
      })
    },
    registerPage() {
      this.errors = []
      this.$router.push({
        name: 'login',
        query: {
          show: 'register'
        }
      })
      this.register = 1

    },
    cancelRegister() {
      this.errors = []
      this.registerError = false
      this.$router.push({
        name: 'login',
        query: {}
      })
      this.register = 0
    },
    cancelReset() {
      this.errors = []
      this.$router.push({
        name: 'login',
        query: {}
      })
      this.forgotPassword = 0
    },
    forgotPasswordPage() {
      this.errors = []
      this.$router.push({
        name: 'login',
        query: {
          show: 'reset'
        }
      })
      this.forgotPassword = true
    },
    detectPage() {
      if (this.$route.query.show === 'reset') {
        this.forgotPassword = true
        this.register = false
      }

      if (this.$route.query.show === 'register') {
        this.register = true
      }

      if (this.$route.query.show === 'reset-after') {
        this.activateAccount = true
        this.register = false
      }

    },
    registerEvents() {
      this.$parent.$on('login-error', (k) => {
        console.log('si aparece esto y no estamos en la pagina de login posicionados')
        console.log('es porque debemos apagar el evento. !! IMPORTANTE !!')
        this.loginError = k
      })
    },
    getMessages() {
      if (!_.isNil(this.$route.query.message)) {

        if (this.$route.query.message === 'Cuenta activada') {
          this.$router.replace({
            query: {}
          })
          this.$alert('La cuenta ha sido activada', {
            title: 'Advertencia',
            confirmButtonText: 'Gracias',
            type: 'warning',
            center: true
          })
        }

        if (this.$route.query.message === 'No hemos podido validar tu cuenta') {
          this.$router.replace({
            query: {}
          })
          this.$alert('No hemos podido validar tu cuenta, debes usar el ultimo correo de activación enviado.', {
            title: 'Advertencia',
            confirmButtonText: 'Gracias',
            type: 'error',
            center: true
          })
        }

        if (this.$route.query.message === 'Cuenta eliminada') {
          this.$router.replace({
            query: {}
          })
          this.$alert('Hemos eliminado tu cuenta en MAEP.', {
            title: 'Advertencia',
            confirmButtonText: 'Ok',
            type: 'warning',
            center: true
          })
        }
      }
    },
    showErrorReset() {
      this.$alert('Al parecer tu correo de registro no existe en nuestra base de datos, prueba con otra dirección de correo.', {
        confirmButtonText: 'Ok',
        title: 'Error al restablecer password',
        type: 'error',
        center: true
      })
    },
    showSuccessReset() {
      this.$alert('El correo fue enviado con exito, porfavor revisa tu bandeja de entrada.', {
        confirmButtonText: 'Gracias',
        title: 'Notificación del sistema',
        type: 'warning',
        center: true
      })
      this.forgotPassword = false
    },
    reset() {
      this.showLoading()
      var that = this
      api.reset(this.email).then(function(response) {
        that.hideLoading()
        if (response.data.status === 'error') {
          that.showErrorReset()
        } else {
          that.showSuccessReset()
        }
      })
    },
    capitalize(s) {
      return s.toLowerCase().replace(/\b./g, function(a) {
        return a.toUpperCase()
      })
    },
    formatName() {
      return this.capitalize(this.name.toLowerCase())
    },
    formatLastName() {
      return this.capitalize(this.lastname.toLowerCase())
    },
    formatEmail() {
      return this.email.toLowerCase()
    },
    formatCompany() {
      return this.company.toUpperCase()
    },
    login() {
      this.$auth.login({
        data: {
          email: this.email,
          password: this.password
        },
        rememberMe: true
      })
    },
    validateUser() {

      this.errors = []
      this.registerError = false
      var errors = []
      if (this.name === '') {
        errors.push('El nombre es obligatorio')
      }

      if (this.lastname === '') {
        errors.push('El apellido es requerido')
      }

      if (this.company === '') {
        errors.push('La empresa es requerida')
      }

      if (this.phone === '') {
        errors.push('El teléfono es requerido')
      }

      if (this.email === '') {
        errors.push('El email es requerido')

      }

      if (this.password === '') {
        errors.push('El password es requerido')
      }

      if (this.password.length < 6) {
        errors.push('El password debe de tener mínimo 6 caracteres')
      }

      if (this.passwordConfirm === '') {
        errors.push('La confirmación de password es requerida')
      }

      if (this.password !== this.passwordConfirm) {
        errors.push('El password y la confirmación del password no coinciden.')
      }

      if (this.company === '') {
        errors.push('La empresa es requerida')
      }

      if (errors.length > 0) {
        this.errors.push(errors[0])
      }

      if (this.errors.length > 0) {
        this.registerError = true
      } else {
        return true
      }

    },
    showLoading() {
      this.loading = this.$loading({
        lock: true,
        text: 'Por favor espere mientras enviamos el correo...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    showSuccessMessage() {
      this.$alert('Para finalizar el registro revisa tu buzón de correo.', 'El usuario se ha creado correctamente', {
        confirmButtonText: 'Gracias',
        type: 'warning',
        center: true
      })
    },
    displayPopUp () {
      window.open("https://github.com/maep-tools/maep-documentation",'Documentación','height=1000,width=1500');

    },
    hideLoading() {
      this.loading.close()
      this.$forceUpdate()
    },
    changeUseRadio(o) {
      console.log(o)
    },
    registerNew() {
      this.visibilityDialogHowUserKnowUs = false
      var that = this
      if (this.validateUser()) {
        this.showLoading()
        api.register({
          email: this.formatEmail(this.email),
          password: this.password,
          passwordConfirm: this.passwordConfirm,
          company: this.company,
          phone: this.phone,
          name: this.formatName(this.name),
          use: this.use,
          lastname: this.formatLastName(this.lastname)
        }).then(function(r) {
          if (!_.isNil(r.data)) {
            that.register = false
            that.showSuccessMessage()
            that.hideLoading()
          } else {
            that.hideLoading()
            that.registerError = true
            that.errors.push('El email ya existe en la base de datos.')
          }

        })
      }
    }
  }
}

</script>
