<template>
<div>
  <!-- Muestra los diferentes tabs, dentro de los tabs hay subcomponentes! -->
  <el-tabs tab-position="top" :value="getSelected()">
    <el-tab-pane name="info" label="INFORMACIÓN DEL CASO">
      <basicConfig :templates="templates" :data="infoData"></basicConfig>
    </el-tab-pane>
    <el-tab-pane name="process" label="PROCESAMIENTO" v-if="$route.query.deploy">
      <modelConfig :infoData="infoData" :data="configData"></modelConfig>
    </el-tab-pane>
    <el-tab-pane  name="wind" label="PROCESO ESTOCÁSTICO" v-if="infoData.form.generate_wind && $route.query.deploy">
      <windConfig :data="windData"></windConfig>
    </el-tab-pane>
  </el-tabs>
</div>

</template>

<script>
import basicConfig from './basicConfig';
import modelConfig from './modelConfig';
import windConfig from './WindConfig';
import api from '../../api/process.js';
import _ from 'lodash';
export default {
  /* Nombre del componente */
  name: 'ConfigStep',
  components: {
    basicConfig,
    modelConfig,
    windConfig
  },
  /* Constructor */
  mounted() {
    this.registerListener()
  },
  /* Destructor*/
  destroyed() {
    this.$bus.$off('submited')
    this.$bus.$off('submitedWind')
    this.$bus.$off('submitedModelConfig')
  },
  /* Props */
  props: [
    'configData',
    'infoData',
    'windData',
    'templates'
  ],
  /* Metodos publicos */
  methods: {
    getSelected () {
      var deploy = this.$route.query.deploy
      if (deploy) {
        return "process"
      } 
      return "info"
    },
    /*
    * Registra cambios en los siguientes
    * grupos de variables para enviar a guardar o modificar
    */
    registerListener() {
      this.$bus.on('submitedWind', (event) => {
        if (event.type === 'windConfig') {
          this.windData = event.data
          this.$bus.emit('sendUpdate', {
            infoData: this.infoData,
            configData: this.configData,
            windData: this.windData,
            reload: false
          })


        }        
      })


      this.$bus.on('submitedModelConfig', (event) => {
        if (event.type === 'modelConfig') {
          this.configData = event.data
          this.$bus.emit('sendUpdate', {
            infoData: this.infoData,
            configData: this.configData,
            windData: this.windData,
            reload: false
          })
        }        
      })


      this.$bus.on('submited', (event) => {
        if (event.type === 'windConfig') {
          this.windData = event.data
        }

        if (event.type === 'modelConfig') {
          this.configData = event.data
        }

        if (event.type === 'basicConfig') {
          this.infoData = event.data
        }
        this.updateOrSave()

      })
    },
    /*
    * Envia a guardar o modificar
    *
    */
    updateOrSave() {
      if (!_.isNil(this.$route.params.id)) {
        this.$bus.emit('sendUpdate', {
          infoData: this.infoData,
          configData: this.configData,
          windData: this.windData,
          reload: false
        })
      } else {
        this.$bus.emit('sendCreate', {
          infoData: this.infoData,
          configData: this.configData,
          windData: this.windData,
          reload: true  
        })
      }
    }
  }
}

</script>
