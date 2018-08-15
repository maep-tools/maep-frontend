<template>
<div>
  <div class="row">
    <div class="col-md-6">
      <h3><i class="tasks icon circular inverted blue"></i> RESULTADOS DE {{infoData.form.name.toUpperCase()}}</h3>
    </div>
    <div class="col-md-6">
      <button v-if="infoData.form.type !== 'Excel'"
              @click="goToConfig()"
              class="ui button mini blue float-right">
        <i class="cogs icon"></i>Configurar</button>
      <button :disabled="!validation.valid && infoData.form.type !== 'Excel'"
              @click="start()"
              class="button ui  mini inverted green float-right"><i class="icon rocket"></i> Ejecutar</button>
    </div>
  </div>

  <div class="row" v-if="!enableResults">
    <div class="col-md-12">
      <hr>
      <center>
      <p>El reporte esta completado. Puedes descargar los datos.</p>
      <a v-if="infoData.form.generate_wind"
         style="margin-top: 20px;"
         @click="downloadInflow()"
         class="ui massive button blue">
            <i class="download icon"></i>Descargar Resultados Inflow</a>
      
      <button v-if="infoData.form.generate_wind"
              style="margin-top: 10px;"
              @click="downloadInflowWind()"
              class="ui button yellow">
        <i class="download icon"></i>Descargar Resultados InflowWind</button>
      <button style="margin-top: 10px;"
              @click="downloadResults()"
              class="ui button  black">
        <i class="download icon"></i>Descargar Resultados</button>
      <hr>
    </center>
    </div>
  
  </div>

  <div class="row"
       v-if="enableResults"
       style="margin-top: 20px;">
    <div class="col-md-4">
      <div class="list-group"
           v-for="chart in charts">
        <a href="#"
           v-bind:class="{ active: isActive(chart.area) }"
           @click="changeChart(chart)"
           class="list-group-item list-group-item-action flex-column align-items-start">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">SISTEMA {{chart.area.toUpperCase()}}</h5>
          </div>
        </a>
      </div>
      <a v-if="infoData.form.generate_wind"
         style="margin-top: 20px;"
         @click="downloadInflow()"
         class="ui button blue">
            <i class="download icon"></i>Descargar Resultados Inflow</a>
      <button v-if="infoData.form.generate_wind"
              style="margin-top: 10px;"
              @click="downloadInflowWind()"
              class="ui button yellow">
        <i class="download icon"></i>Descargar Resultados InflowWind</button>
      <button style="margin-top: 10px;"
              @click="downloadResults()"
              class="ui button  black">
        <i class="download icon"></i>Descargar Resultados</button>
      <hr>
      <div class="row" v-if="logs.length > 0">
        <div class="col-md-12">
        <div style="height:140px !important;margin-top:0px;"
             id="terminal-logs"
             class="terminal-logs">
          <ul style="list-style-type: none;">
            <li v-if="log"
                v-for="log in logs">{{log}}</li>
          </ul>
        </div>
        </div>
      </div>
    </div class="row">
    <div class="col-md-8">
      <div class="row">
        <h3>SISTEMA {{selectedChart.toUpperCase()}} (MWh)</h3>
        <center>
          <div id="chart"
               style="width:100%"></div>
        </center>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../api/process.js';
import config from '../../config';
console.log(config)
export default {
  name: 'ProcessResults',
  destroyed() {
    clearInterval(this.intervalValidation)
  },
  data: function() {
    return {
      logs: [
        'Espere un momento. . .'
      ],
      config: config,
      showLogs: false,
      charts: [],
      loading: true,
      enableResults: config.enableResults,
      areasCharts: [],
      intervalValidation: null,
      selectedChart: 'General',
      config: config,
      validation: {
        valid: false
      }
    }
  },
  /* Props */
  props: [
    'infoData'
  ],
  mounted() {
    this.loading = this.$loading({
      lock: true,
      text: 'Cargando',
      spinner: 'el-icon-loading',
      background: 'rgba(255,255,255,.9)'
    })
    if (this.enableResults) {
      this.getChartsGeneral()
      this.getChartsAreas()
    } else {
      this.loading.close()
    }
    this.getLogsBackend()
    this.validate()
  },
  methods: {
    /*
    * Permite descargar datos de inflow hydro
    *
    */
    downloadInflow() {
      location.replace(config.path + ':' + config.backendPort + '/api/v1/results/getWindDataInflow/' + this.$route.params.id)
    },
    /*
    * Permite descargar información de velocida de viento
    *
    */
    downloadInflowWind() {
      location.replace(config.path + ':' + config.backendPort + '/api/v1/results/getWindDataInflowWind/' + this.$route.params.id)
    },
    /*
    * Permite descargar los resultados
    *
    */
    downloadResults() {
      location.replace(config.path + ':' + config.backendPort + '/api/v1/results/getGeneralData/' + this.$route.params.id)
    },
    /*
    * Permite obtener los logs desde el servidor
    *
    */
    getLogsBackend() {
      api.getLogsBackend(this.$route.params.id).then((v) => {
        this.logs = v.data.split('\n')
      })
    },
    /*
    * Permite mostrar u ocultar los logs
    *
    */
    toggleLogs() {
      this.showLogs = !this.showLogs
    },
    /*
    * Permite determinar si la grafica esta activa
    *
    */
    isActive(area) {
      return (area === this.selectedChart)
    },
    /*
    * Permite cambiar la grafica
    *
    */
    changeChart(area) {
      this.selectedChart = area.area
      console.log(area)
      this.renderChart(area.chart)
    },
    /*
    * Permite obtener las graficas por area
    *
    */
    getChartsAreas() {
      api.getChartsByArea(this.$route.params.id).then((v) => {
        this.areasCharts = v.data
        this.areasCharts.forEach((area) => {
          if (area.chart) {
            this.charts.push({
              area: area.area,
              chart: JSON.parse(area.chart)
            })
          }
        })
      })
    },
    /*
    * Permite obtener el chart general
    *
    */
    getChartsGeneral() {
      api.getChartsGeneral(this.$route.params.id).then((v) => {
        this.generalChart = {
          area: 'General',
          chart: v.data
        }
        this.loading.close()
        this.charts.push(this.generalChart)
        this.renderChart(this.generalChart.chart)
      })
    },
    /*
    * Permite renderizar la grafica
    *
    */
    renderChart(chart) {
      this.chart = document.getElementById('chart')
      Plotly.purge(this.chart)
      Plotly.plot(this.chart, chart)
    },
    /*
    * Permite validar en el servidor que el modelo cumpla las condiciones
    *
    */
    getValidation() {
      var that  = this
      api.getValidation(this.$route.params.id).then((v) => {
        that.validation = v.data
      })
    },
    /*
    * Valida que se pueda ejecutar el modelo
    *
    */
    validate() {
      var that = this
      if (this.infoData.form.type !== "Excel") {
        this.getValidation()
        this.intervalValidation = setInterval(() => {
          this.getValidation()
        }, 10000)
      } else {
        this.validation.valid = true
      }
    },
    /*
    * Inicializa la ejecución
    *
    */
    start() {
      this.$router.push({
        query: {
          step: 0,
          deploy: true
        }
      })
    },
    /*
    * Redirige a la configuración
    *
    */
    goToConfig() {
      this.$router.push({
        name: 'process',
        query: {
          step: 1
        },
        params: {
          id: this.$route.params.id
        }
      })

    }
  }
}

</script>
