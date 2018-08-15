<template>
<div class="container"
     v-loading="loading" :element-loading-text="loadingMessage">
  <!-- navbar de la pagina -->
  <nav-bar></nav-bar>
  <!-- cabecera -->
  <div class="row mt-5">
    <div class="col-md-12">
      <process-step :activeStep="activeStep"></process-step>
    </div>
  </div>
  <!-- errores -->
  <div class="row"
       v-if="errors.length > 0"
       style="margin-top:20px;">
    <div class="col-md-11 offset-md-1">
      <el-alert v-for="error in errors"
                :key="error"
                title="Errores de validación"
                :description="error.message"
                type="error">
      </el-alert>
    </div>
  </div>
  <!-- configuración de modelos -->
  <div class="row mt-3">
    <div v-if="activeStep === 0"
         class="col-md-11 offset-md-1">
      <configStep 
                  :templates="templates"
                  :configData="configData"
                  :windData="windData"
                  :infoData="infoData"></configStep>
    </div>
    <div class="col-md-12"
         v-if="activeStep === 1 && categories.length > 0 && modulesInfoLoaded">
         <hr>
      <inputStep :infoData="infoData" :configData="configData" :infoLoaded="modulesInfoLoadedInfo" :data="modulesInfo" :categories="categories"></inputStep>
    </div>
    <!-- visualización de progreso -->
    <div class="col-md-10 offset-md-1"
         v-if="activeStep === 2">
      <process-progress :info="info"
                        :progress="progress"></process-progress>
    </div>
    <!-- visualización de resultados -->
    <div v-if="activeStep === 3"
         class="col-md-12">
      <process-results :infoData="infoData"></process-results>
    </div>
  </div>
</div>

</template>

<script>
import processProgress from './utils/ProcessProgress';
import processResults from './utils/ProcessResults';
import processStep from './utils/ProcessStep';
import configStep from './utils/configStep';
import inputStep from './utils/inputStep';
import navBar from './utils/Navbar';
import api from '../api/process.js';
import q from 'q';
export default {
  /* Nombre del componente */
  name: 'Process',
  /* Constructor */
  mounted() {
    console.log(this.activeStep)
    this.activeStep = parseInt(this.$route.query.step, 10) || 0
    this.registerEvents()
    if (this.activeStep === 0) {
      api.getTemplates().then((r) => {
        this.templates = r.data
      })
    }
    if (this.activeStep === 1) {
      this.getCategories()
    }
    if (!_.isNil(this.$route.params.id)) {
      this.getProcessById(this.$route.params.id)
    } else {
      this.loading = false
    }
  },
  watch: {
    modulesInfo: {
      immediate: true,
      handler () {
      },
      deep: true
    }
  },
  /*
  * Apagamos todos los eventos para no generar falencias.
  *
  */
  destroyed() {
    this.$socket.emit('room-leave', this.$route.params.id)
    delete this.$options.sockets.message
    this.$bus.off('changeStep', this.changeStep)
    this.$bus.off('sendUpdate', this.sendUpdate)
    this.$bus.off('sendCreate', this.sendCreate)
    this.$bus.off('getModulesData', this.getModulesByReference)
  },
  /*
  * Componentes hijos
  *
  */
  components: {
    navBar,
    configStep,
    inputStep,
    process,
    processProgress,
    processResults,
    processStep
  },
  /*
  * Metodos publicos
  *
  */
  methods: {

    getModulesByReference (modules) {
      var total = modules.length 
        _.each(modules, (v, k) => {
            this.loading = true
            this.loadingMessage = "Organizando información"
            api[v.url](this.$route.params.id).then((r) => {
                
                if (total === (k + 1)) {
                  this.loading = false
                }
                this.modulesInfo[v.reference] = r.data
                this.modulesInfoLoadedInfo[v.reference + 'Loaded'] = true
                this.$forceUpdate()
            })
        })
    },
    /*
    * Permite obtener la información de todos los modulos.
    *
    */
    getModulesData() {
      q.all([
        api.getAreas(this.$route.params.id),
        api.getThermalConfig(this.$route.params.id),
        api.getTypes(),
        api.getEntranceStages(),
        api.getHorizontByProcessId(this.$route.params.id),
        api.getCombustiblesByProcessId(this.$route.params.id),
        api.getSegments(this.$route.params.id),
        api.getThermalConfigExpansion(this.$route.params.id),
        api.getSmallConfig(this.$route.params.id),
        api.getSmallConfigExpansion(this.$route.params.id),
        api.getHydroConfig(this.$route.params.id),
        api.getHydroExpansion(this.$route.params.id),
        api.getWindConfig(this.$route.params.id),
        api.getWindExpansion(this.$route.params.id),
        api.getBlocks(this.$route.params.id),
        api.getWindM2Config(this.$route.params.id),
        api.getScenarios(this.$route.params.id),
        api.getStorageConfig(this.$route.params.id),
        api.getStorageExpansion(this.$route.params.id),
        api.getLines(this.$route.params.id),
        api.getLinesExpansion(this.$route.params.id),
        api.getMonths(this.$route.params.id)
      ]).then((r) => {
          this.modulesInfo = {
            areas : r[0].data,
            thermalConfig : r[1].data,
            types : r[2].data,
            entranceStages : r[3].data,
            horizonts : r[4].data,
            fuels: r[5].data,
            segments: r[6].data,
            thermalConfigExpansion: r[7].data,
            smallConfig: r[8].data,
            smallConfigExpansion:r[9].data,
            hydroConfig: r[10].data,
            hydroExpansion: r[11].data,
            windConfig : r[12].data,
            windConfigExpansion : r[13].data,
            blocks: r[14].data,
            windM2Config: r[15].data,
            scenarios: r[16].data,
            storageConfig: r[17].data,
            storageExpansion: r[18].data,
            lines: r[19].data,
            linesExpansion: r[20].data,
            months: r[21].data
          }
         this.modulesInfoLoaded = true
          this.$forceUpdate()
        }).catch((err) => {
          console.log(err)
        })
    },
    /*
    * Obtiene las categorias de los modulos
    *
    */
    getCategories() {
      this.loading = true
      api.getCategories().then((response) => {
        this.loading = false
        this.categories = response.data
        // this.getModulesData()
      })
    },
    /*
    * Obtiene la información basica del proceso por id
    *
    */
    getProcessById(id) {
      api.getProcessById(id).then((response) => {
        // this.loading = false
        this.infoData.status_id = response.data.statusId
        this.infoData.phase = response.data.phase
        this.infoData.form.type = response.data.type
        this.infoData.form.name = response.data.name
        this.infoData.form.date = response.data.created_at
        this.infoData.form.template = response.data.template
        this.infoData.form.template_id = response.data.template_id      
        // this.infoData.form.template_id = 'En blanco'
        this.configData.segment_id = parseInt(response.data.segment_id);
       
        this.infoData.form.generate_wind = response.data.generate_wind
        this.configData.max_iter = response.data.max_iter
        this.configData.bnd_stages =  response.data.bnd_stages
        this.configData.stages = response.data.stages
        this.configData.seriesBack = response.data.seriesBack
        this.configData.seriesForw =  response.data.seriesForw
        this.configData.sensDem =  response.data.sensDem
        this.configData.eps_area =  response.data.eps_area
        this.configData.eps_all = response.data.eps_all
        this.configData.eps_risk = response.data.eps_risk
        this.configData.commit = response.data.commit

        this.configData.read_data = response.data.read_data
        this.configData.param_calculation = response.data.param_calculation
        this.configData.param_opf = response.data.param_opf
        this.configData.wind_model2 = response.data.wind_model2
        this.configData.flow_gates = response.data.flow_gates

        this.windData.lag_max = response.data.lag_max
        this.windData.testing_t = (response.data.testing_t) ? true : false;
        this.windData.d_correl =  (response.data.d_correl) ? true : false;
        this.windData.seasonality = response.data.seasonality
      })
    },
    /*
    * Petición para crear un nuevo proceso
    *
    */
    sendCreate(data) {
      this.infoData = data.infoData
      this.configData = data.configData
      this.windData = data.windData
      api.createProcess({
        phase: 1,
        statusId: 1,
        userId: this.$auth.user().id,
        name: this.infoData.form.name,
        date: this.infoData.form.date,
        template_id: this.infoData.form.template_id,
        generate_wind: this.infoData.form.generate_wind,
        template: this.infoData.form.template,
        type: this.infoData.form.type,
        blocks: this.infoData.form.blocks,
        scenarios: this.infoData.form.scenarios,
        max_iter:  this.configData.max_iter,
        bnd_stages:  this.configData.bnd_stages,
        stages:  this.configData.bnd_stages + this.configData.months,
        seriesBack:  this.configData.seriesBack,
        seriesForw:  this.configData.seriesForw,
        sensDem:  this.configData.sensDem,
        eps_area:  this.configData.eps_area,
        eps_all:  this.configData.eps_all,
        eps_risk:  this.configData.eps_risk,
        commit: this.configData.commit,
        fileCode: this.infoData.fileCode,
        read_data: this.configData.read_data,
        param_calculation:this.configData.param_calculation,
        param_opf:this.configData.param_opf,
        wind_model2:this.configData.wind_model2,
        flow_gates:this.configData.flow_gates,


        lag_max: this.configData.lag_max,
        testing_t: this.configData.testing_t,
        d_correl: this.configData.d_correl,
        seasonality: this.configData.seasonality,
        lag_max: this.windData.lag_max,
        testing_t: this.windData.testing_t,
        d_correl: this.windData.d_correl,
        seasonality: this.windData.seasonality
      }).then((response) => {
        if (!_.isNil(response.response)) {

        if (!_.isNil(response.response.status)) {
          if(response.response.status === 500) {
            this.$message({
              message: 'Notificación: El modelo no se pudo guardar, revise que el nombre no este duplicado.',
              type: 'error'
            })
            return
          }
        }
          this.errors = this.mapErrors(response.response.data.errors)
        } else {
          this.errors = []

          if (response.data.type === "Excel") {

            this.$router.push({
                name: 'process',
                params: {
                  id: response.data.id
                },
                query: {
                  step: 0,
                  deploy:true
                }
            })

          } else {
            this.changeStep(1, response.data.id)
          }
          this.$message({
            message: 'Notificación: El modelo se ha guardado correctamente.',
            type: 'success'
          })
        }
      })
    },
    /*
    * Petición para modificar un proceso
    *
    */
    sendUpdate(data) {
      this.infoData = data.infoData
      this.configData = data.configData
      this.windData = data.windData
      this.reload = data
      api.updateProcess({
        phase: this.infoData.phase,
        statusId: this.infoData.status_id,
        userId: this.$auth.user().id,
        name: this.infoData.form.name,
        date: this.infoData.form.date,
        template: this.infoData.form.template,        
        generate_wind: this.infoData.form.generate_wind,
        blocks: this.infoData.form.blocks,
        template_id: this.infoData.form.template_id,
        template: this.infoData.form.template,
        generate_wind: this.infoData.form.generate_wind,
        max_iter:  this.configData.max_iter,
        bnd_stages:  this.configData.bnd_stages,
        stages:  this.configData.bnd_stages + this.configData.months,
        seriesBack:  this.configData.seriesBack,
        seriesForw:  this.configData.seriesForw,
        sensDem:  this.configData.sensDem,
        eps_area:  this.configData.eps_area,
        eps_all:  this.configData.eps_all,
        eps_risk:  this.configData.eps_risk,
        commit: this.configData.commit,
        fileCode: this.infoData.fileCode,


        read_data: this.configData.read_data,
        param_calculation:this.configData.param_calculation,
        param_opf:this.configData.param_opf,
        wind_model2:this.configData.wind_model2,
        flow_gates:this.configData.flow_gates,

        lag_max: this.windData.lag_max,
        testing_t: (this.windData.testing_t) ? 1 : 0,
        d_correl: (this.windData.d_correl)? 1 : 0,
        seasonality: this.windData.seasonality
      }, this.$route.params.id).then((response) => {
        if (!_.isNil(response.response)) {
          this.errors = this.mapErrors(response.response.data.errors)
        } else {
          this.errors = []
          this.$message({
            message: 'Notificación: El modelo se ha actualizado correctamente',
            type: 'success'
          })
          if (this.reload) {

            if(response.data.type !== "Excel") {
              this.changeStep(1, response.data.id)
            }

          }
        }
      })
    },
    /*
    * Permite cambiar la subpantalla a visualizar
    *
    */
    changeStep(step, id) {
      this.activeStep = step
      var routeParams = {
        name: 'process',
        params: {
          id: null
        },
        query: {
          step: step
        }
      }

      if (!_.isNil(id)) {
         routeParams.params.id = id
      } else {
         routeParams.params.id = this.$route.params.id
      }
      this.$router.push(routeParams)
    },
    /*
    * Permite escuchar los mensajes provenientes de socket.io
    *
    */
    registerSocketMessages() {
      this.$options.sockets.message = (data) => {
        this.progress = data.data.percent
        console.log(this.progress)
        this.info = data.data.message
        if (this.progress === 100) {
          this.validateErrors()
        }
      }
    },
    validateErrors() {
      api.getErrorsBackend(this.$route.params.id).then((v) => {
        if (v.data != "") {
          if (this.infoData.type !== "Excel") {
            this.$router.push({
              name: 'process',
              params: {
                id: this.$route.params.id
              },
              query: {
                step: 1
              }
            })
          } else {
            this.$router.push({
              name: 'process',
              params: {
                id: this.$route.params.id
              },
              query: {
                step: 0,
                deploy: true
              }
            })
          }
        } else {
          this.$router.push({
            name: 'process',
            params: {
              id: this.$route.params.id
            },
            query: {
              step: 3
            }
          })
        }
      })
    },
    /*
    * Registro de eventos a escuchar
    *
    */
    registerEvents() {
      var that = this
      this.$bus.on('changeStep', this.changeStep)
      this.$bus.on('sendUpdate', this.sendUpdate)
      this.$bus.on('sendCreate', this.sendCreate)
      this.$bus.on('getModulesData', this.getModulesByReference)
      if (this.activeStep === 2) {
        this.$socket.emit('room', this.$route.params.id)
      }

      this.registerSocketMessages()
    },
    /*
    * Errores de validación
    *
    */
    mapErrors(errors) {
      return Object.keys(errors).map(function(error, v) {
        console.log(error, v)
        return {
          message: errors[error][0]
        }
      })
    }
  },
  data() {
    return {
      templates: [],
      loadingMessage: 'Cargando',
      configData: {
        labelPosition: 'right',
        formLabelAlign: {
          name: '',
          region: '',
          type: ''
        },
        max_iter:  1,
        bnd_stages:  1,
        stages:  null,
        months: 1,
        seriesBack:  1,
        seriesForw:  1,
        sensDem:  1.0,
        eps_area:  0.5,
        eps_all:  0.5,
        eps_risk:  0.1,
        commit: 0.0,


        read_data: false,
        param_calculation:true,
        param_opf:true,
        wind_model2:false,
        flow_gates:true,
      },
      windData: {
        lag_max: 12,
        testing_t: 1,
        d_correl: 1,
        seasonality: 12
      },
      infoData: {
        phase: null,
        fileCode: null,
        status_id: null,
        fileList: [],
        labelPosition: 'right',
        formLabelAlign: {
          name: '',
          region: '',
          type: ''
        },
        form: {
          name: '',
          region: '',
          date: new Date(),
          date2: '',
          delivery: false,
          type: 'En blanco',
          template: false,
          blocks:20,
          generate_wind: false,
          scenarios: 10,
          resource: '',
          desc: '',
          filterText: '',
          region: 'V1'
        }
      },
      percent: 0,
      loading: false,
      activeStep: 0,
      process: null,
      progress: 0,
      info: 'En cola',
      errors: [],
      categories: [],

      modulesInfo: {
          areas: [],
          thermalConfig: [],
          types: [],
          entranceStages: [],
          horizonts: [],
          fuels: [],
          segments: [],
          thermalConfigExpansion: [],
          smallConfig: [],
          smallConfigExpansion: [],
          hydroConfig: [],
          hydroExpansion: [],
          windConfig: [],
          windConfigExpansion: [],
          blocks: [],
          windM2Config: [],
          scenarios: [],
          storageConfig: [],
          storageExpansion: [],
          lines: [],
          linesExpansion: [],
          months: []
      },
      modulesInfoLoadedInfo: {
          areasLoaded:false,
          thermalConfigLoaded:false,
          typesLoaded:false,
          entranceStagesLoaded:false,
          horizontsLoaded:false,
          fuelsLoaded:false,
          segmentsLoaded:false,
          thermalConfigExpansionLoaded:false,
          smallConfigLoaded:false,
          smallConfigExpansionLoaded:false,
          hydroConfigLoaded:false,
          hydroExpansionLoaded:false,
          windConfigLoaded:false,
          windConfigExpansionLoaded:false,
          blocksLoaded:false,
          windM2ConfigLoaded:false,
          scenariosLoaded:false,
          storageConfigLoaded:false,
          storageExpansionLoaded:false,
          linesLoaded:false,
          linesExpansionLoaded:false,
          monthsLoaded:false
      },
      modulesInfoLoaded: true
    }
  }
}

</script>
