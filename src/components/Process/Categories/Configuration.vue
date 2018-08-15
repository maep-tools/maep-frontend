<template>
<div>
  <div class="row">
    <div class="col-md-12">
      <h3 v-if="validationLoaded"><b><i class="icon qrcode"></i>CONFIGURAR {{validation.process.name.toUpperCase()}}</b></h3>
      <el-alert title="Advertencia, para poder iniciar la ejecución, debes completar la siguiente información."
                type="warning"
                show-icon>
      </el-alert>
      <div v-if="validation.errors.length > 0"
           class="row"
           style="margin-top: 10px;">
        <div class="col-md-12">
          <a @click="showErrors = !showErrors"
             class="ui button float-right"><i class="icon info circle red"></i>{{getNameErrorsButton()}}</a>
        </div>
      </div>
      <div v-if="!validation.valid && showErrors"
           class="ui red message">
        <ul>
          <li v-for="error in validation.errors">{{error}}</li>
        </ul>
      </div>
      <hr>
      <div>
        <h3>PASO 1. INSERTAR AREA/S <label class="badge badge-warning">{{data.areas.length}}  areas insertada/s</label> <i  v-if="data.areas.length > 0" class="icon check large green"></i></h3>
        <p>MAEP soporta sistemas de tipo uninodal, multi-área o multi-nodal. Un modelo de sistema uninodal o de una sola área no requiere información adicional sobre la red de transmisión. Dos o mas áreas/nodos obliga a ingresar los datos de la red de transmisión o un equivalente de la misma.</p>
        <button @click="$parent.goToCategory(14)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR AREA</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 2. CONFIGURAR HORIZONTE PARA LA DEMANDA <label class="badge badge-warning">{{data.horizonts.length}}  etapa/s insertadas</label> <i  v-if="data.horizonts.length > 0" class="icon check large green"></i></h3>
        <p> Determina el horizonte de la demanda (mensual)</p>
        <button :disabled="data.areas.length < 1"
                @click="$parent.goToCategory(2)"
                class="btn btn-primary">
          CONFIGURAR HORIZONTE
        </button>
      </div>
      <div style="marginTop:20px">
        <h3>PASO 3. CONFIGURAR DEMANDA <i v-if="validation.demandCounter.valid" class="icon check large green"></i></h3>
        <p>Ingresa la demanda total del sistema. Si el sistema es uninodal, dicha demanda corresponderá al único nodo modelado. De otra manera, será necesario ingresar los factores de participación de las áreas o nodos sobre la demanda total.</p>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.demandCounter.valid && data.horizonts.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top: 20px;"
                v-for="demand in validation.demandCounter.registers"
                v-if="!demand.valid">
              <el-tag type="info">{{demand.area_name}}</el-tag> tiene
              <el-tag type="info">{{demand.demand_count}}</el-tag> valores asignados de
              <el-tag type="info">{{demand.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <button :disabled="data.areas.length < 1 && data.horizonts.length < 1"
                @click="$parent.goToCategory(2, true, 'showFactorArea')"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR DEMANDA</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 4. CONFIGURAR COMBUSTIBLES <label class="badge badge-warning">{{data.fuels.length}}  combustible/s insertado/s</label> <i  v-if="data.fuels.length > 0" class="icon check large green"></i></h3>
        <p>Crea los tipos de combustible que se podrán asociar a las plantas térmicas para el proceso de generación eléctrica.</p>
        <button @click="$parent.goToCategory(17)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR COMBUSTIBLES</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 4.1 CONFIGURAR COSTOS DE COMBUSTIBLE  <i  v-if="validation.fuelCounter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.fuelCounter.valid && data.horizonts.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top: 10px;"
                v-for="fuelCost in validation.fuelCounter.registers"
                v-if="!fuelCost.valid">
              <el-tag type="info">{{fuelCost.fuel_name}}</el-tag> tiene
              <el-tag type="info">{{fuelCost.fuel_horizont_count}}</el-tag> valores asignados de
              <el-tag type="info">{{fuelCost.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas hidroeléctricas en el sistema y de los escenarios del proceso estocástico, crea los afluentes de agua que llegan a los embalses.</p>
        <button :disabled="data.horizonts.length < 1 || data.scenarios.length < 1"
                @click="$parent.goToCategory(3)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR COSTOS DE COMBUSTIBLE</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 5. CONFIGURAR SEGMENTOS  <label class="badge badge-warning">{{data.segments.length}}  segmento/s insertado/s</label>  <i  v-if="data.segments.length > 0" class="icon check large green"></i></h3>
        <p>Los segmentos determinan cuantos niveles de impacto (en costos) hay sobre la demanda no atendida. En su versión actual, MAEP solo trabaja con el primer segmento.</p>
        <button @click="$parent.goToCategory(18)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR SEGMENTOS</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 6. CONFIGURAR ESCENARIOS  <label class="badge badge-warning">{{data.scenarios.length}}  escenario/s insertado/s</label>  <i  v-if="data.scenarios.length > 0" class="icon check large green"></i></h3>
        <p>Determina el proceso estocástico del modelo. Cuando un solo escenario es seleccionado entonces el modelo funciona de manera deterministica.</p>
        <button @click="$parent.goToCategory(29)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR ESCENARIOS</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 7. CONFIGURAR BLOQUES  <label class="badge badge-warning">{{data.blocks.length}}  bloque/s insertado/s</label><i  v-if="data.blocks.length > 0" class="icon check large green"></i></h3>
        <p>Determina la resolución intra-etapa. La operación de los bloques se hace de manera secuencial, por lo tanto es ideal para un planeamiento de tipo horario (dentro de un horizonte de largo plazo).</p>
        <button @click="$parent.goToCategory(19)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR BLOQUES</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 8. CONFIGURAR PLANTAS TERMICAS  <label class="badge badge-warning">{{data.thermalConfig.length}}  planta/s termica/s insertada/s</label><i  v-if="data.thermalConfig.length > 0" class="icon check large green"></i></h3>
        <p>Crea y determina las características de las plantas térmicas en el sistema.</p>
        <button :disabled="data.areas < 1 || data.fuels < 1"
                @click="$parent.goToCategory(4)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR PLANTAS</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 9. RACIONAMIENTO <i  v-if="validation.rationingCounter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.rationingCounter.valid && data.horizonts.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top: 10px;"
                v-for="rationing in validation.rationingCounter.registers">
              <el-tag type="info">{{rationing.segment_name}}</el-tag> tiene
              <el-tag type="info">{{rationing.rationing_cost_count}}</el-tag> valores asignados de
              <el-tag type="info">{{rationing.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para los segmentos creados sobre el nivel de impacto en la demanda no atendida, se definen los costos de racionamiento.</p>
        <button :disabled="data.horizonts.length < 1"
                @click="$parent.goToCategory(6)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR RACIONAMIENTO</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 10. CONFIGURAR PLANTAS MENORES <div class="ui red label">ES OPCIONAL
</div> <label class="badge badge-warning">{{data.smallConfig.length}}  planta/s insertada/s</label><i  v-if="data.smallConfig.length > 0" class="icon check large green"></i></h3>
        <p>Crea y determina las características de las plantas menores en el sistema.</p>
        <button :disabled="data.areas.length < 1"
                @click="$parent.goToCategory(7)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR PLANTAS</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 11. CONFIGURAR PLANTAS HIDROELÉCTRICA  <label class="badge badge-warning">{{data.hydroConfig.length}}  plantas insertada/s</label><i  v-if="data.hydroConfig.length > 0" class="icon check large green"></i></h3>
        <p>Crea y determina las características de las plantas hidroeléctricas en el sistema.</p>
        <button :disabled="data.areas.length < 1 || data.horizonts.length < 1"
                @click="$parent.goToCategory(9)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR PLANTAS</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 12. CONFIGURAR AFLUENTES HIDRICOS  <i  v-if="validation.inflowCounter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.inflowCounter.valid && data.horizonts.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top: 10px;"
                v-for="inflow in validation.inflowCounter.registers"
                v-if="!inflow.valid">
              <el-tag type="info">{{inflow.hydro_name}}</el-tag> tiene
              <el-tag type="info">{{inflow.inflowCount}}</el-tag> valores asignados de
              <el-tag type="info">{{inflow.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas hidroeléctricas en el sistema y de los escenarios del proceso estocástico, crea los afluentes de agua que llegan a los embalses.</p>
        <button :disabled="data.horizonts.length < 1 || data.scenarios.length < 1"
                @click="$parent.goToCategory(11)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR AFLUENTES</button>
      </div>
      <div style="marginTop:20px;">
        <h3>PASO 13. CONFIGURAR PLANTAS EÓLICAS <div class="ui red label">ES OPCIONAL
</div>  <label class="badge badge-warning">{{data.windConfig.length}}  plantas eólica/s insertada/s</label><i  v-if="data.windConfig.length > 0" class="icon check large green"></i></h3>
        <p>Crea y determina las características de las plantas eólicas en el sistema.</p>
        <button @click="$parent.goToCategory(12)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR PLANTAS</button>
      </div>
      <div style="marginTop:20px;"
           v-if="data.windConfig.length > 0">
        <h3>PASO 13.1. CONFIGURAR INDICES DE INTENSIDAD DE VIENTO<i  v-if="validation.speedIndicesCounter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.speedIndicesCounter.valid && data.windConfig.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top:10px;"
                v-for="speed in validation.speedIndicesCounter.registers"
                v-if="!speed.valid">
              <el-tag type="info">{{speed.wind_config_name}}</el-tag> tiene
              <el-tag type="info">{{speed.speedIndicesByWindConfigCounter}}</el-tag> valores asignados de
              <el-tag type="info">{{12 * speed.blocksCounter}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas eólicas en el sistema y de los escenarios del proceso estocástico, crea las series de intensidad de viento en el área de influencia de las plantas.</p>
        <button :disabled="data.windConfig.length < 1 || data.blocks.length < 1"
                @click="$parent.goToCategory(20)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR</button>
      </div>


      <div style="marginTop:20px;"
           v-if="data.windM2Config.length > 0">
        <h3>PASO 13.1.2. CONFIGURAR MODELO 2 INDICES DE INTENSIDAD DE VIENTO <i  v-if="validation.speedIndicesM2Counter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.speedIndicesM2Counter.valid && data.windM2Config.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top:10px;"
                v-for="speedM2 in validation.speedIndicesM2Counter.registers"
                v-if="!speedM2.valid">
              <el-tag type="info">{{speedM2.wind_config_name}}</el-tag> tiene
              <el-tag type="info">{{speedM2.speedIndicesByWindConfigCounter}}</el-tag> valores asignados de
              <el-tag type="info">{{12 * speedM2.blocksCounter}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas eólicas en el sistema y de los escenarios del proceso estocástico, crea las series de intensidad de viento en el área de influencia de las plantas.</p>
        <button :disabled="data.windM2Config.length < 1 || data.blocks.length < 1"
                @click="$parent.goToCategory(24)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR</button>
      </div>


      <div style="marginTop:20px;"
           v-if="data.windConfig.length > 0  && !infoData.form.generate_wind">
        <h3>PASO 13.2 CONFIGURAR VELOCIDAD DEL VIENTO<i  v-if="validation.inflowWindCounter.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.inflowWindCounter.valid && data.windConfig.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top:10px;"
                v-for="inflow in validation.inflowWindCounter.registers"
                v-if="!inflow.valid">
              <el-tag type="info">{{inflow.wind_name}}</el-tag> tiene
              <el-tag type="info">{{inflow.inflowCount}}</el-tag> valores asignados de
              <el-tag type="info">{{12 * inflow.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas eólicas en el sistema y de los escenarios del proceso estocástico, crea las series de las velocidades de viento en el área de influencia de las plantas.</p>
        <button :disabled="data.windConfig.length < 1 || data.blocks.length < 1"
                @click="$parent.goToCategory(21)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR</button>
      </div>


      <div style="marginTop:20px;"
           v-if="data.windM2Config.length > 0 && !infoData.form.generate_wind">
        <h3>PASO 13.2.1 CONFIGURAR MODELO 2 VELOCIDAD DEL VIENTO<i  v-if="validation.inflowWindCounterM2.valid" class="icon check large green"></i></h3>
        <div style="marginTop:10px;"
             class="message ui red"
             v-if="!validation.inflowWindCounterM2.valid && data.windM2Config.length > 0">
          <h4>Faltan datos por completar</h4>
          <ul>
            <li style="margin-top:10px;"
                v-for="inflow in validation.inflowWindCounterM2.registers"
                v-if="!inflow.valid">
              <el-tag type="info">{{inflow.wind_name}}</el-tag> tiene
              <el-tag type="info">{{inflow.inflowCount}}</el-tag> valores asignados de
              <el-tag type="info">{{12 * inflow.horizonts_count}}</el-tag> que deberia tener.</li>
          </ul>
        </div>
        <p>Para cada una de las plantas eólicas en el sistema y de los escenarios del proceso estocástico, crea las series de las velocidades de viento en el área de influencia de las plantas.</p>
        <button :disabled="data.windM2Config.length < 1 || data.blocks.length < 1"
                @click="$parent.goToCategory(30)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR</button>
      </div>



      <div style="marginTop:20px;"
           v-if="data.areas.length >= 2">
        <h3>PASO 14. CONFIGURAR LINEAS  <label class="badge badge-warning">{{data.lines.length}}  linea/s insertada/s</label><i  v-if="data.lines.length > 0" class="icon check large green"></i></h3>
        <p>Cuando el usuario ha definido la existencia de mas de un area o nodo, es necesario definir las características de conexion entre ellas.</p>
        <button @click="$parent.goToCategory(27)"
                class="btn btn-primary"><i class="ui icon plus"></i>CONFIGURAR LINEAS</button>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../../api/process.js';

export default {
  name: 'Configuration',
  props: [
    'data',
    'infoLoaded',
    'infoData'
  ],
  mounted() {
    api.getValidation(this.$route.params.id).then((v) => {
      this.validation = v.data
      this.validationLoaded = true
    })

    if (!this.infoLoaded.typesLoaded) {
      this.$parent.$parent.loading = true

      this.$notify.info({
        title: 'Información',
        message: 'Cargando dependencias genericas.',
        position: 'top-left',
        duration: 10000
      })

      this.$bus.emit('getModulesData', [
        {
          url: 'getAreas',
          reference: 'areas'
        },
        {
          url: 'getHorizontByProcessId',
          reference: 'horizonts'
        },
        {
          url: 'getMonths',
          reference: 'months'
        },
        {
          url: 'getTypes',
          reference: 'types'
        },
        {
          url: 'getEntranceStages',
          reference: 'entranceStages'
        },
        {
          url: 'getCombustiblesByProcessId',
          reference: 'fuels'
        },
        {
          url: 'getSegments',
          reference: 'segments'
        },
        {
          url: 'getScenarios',
          reference: 'scenarios'
        },
        {
          url: 'getBlocks',
          reference: 'blocks'
        },
        {
          url: 'getSmallConfig',
          reference: 'smallConfig'
        },
        {
          url: 'getSmallConfigExpansion',
          reference: 'smallConfigExpansion'
        },
        {
          url: 'getHydroConfig',
          reference: 'hydroConfig'
        },
        {
          url: 'getHydroExpansion',
          reference: 'hydroExpansion'
        },
        {
          url: 'getWindConfig',
          reference: 'windConfig'
        },
        {
          url: 'getWindExpansion',
          reference: 'windConfigExpansion'
        },
        {
          url: 'getWindM2Config',
          reference: 'windM2Config'
        },
        {
          url: 'getStorageConfig',
          reference: 'storageConfig'
        },
        {
          url: 'getStorageExpansion',
          reference: 'storageExpansion'
        },
        {
          url: 'getLinesExpansion',
          reference: 'linesExpansion'
        }
      ])
    }
  },
  methods: {
    getNameErrorsButton() {
      if (this.showErrors) {
        return 'Ocultar errores'
      } else {
        return 'Mostrar errores'
      }
    },
    checkIfIsValid(validation) {
      if (_.isNil(this.validation[validation])) {
        return false
      }
      var valid = true
      _.each(this.validation[validation], (v) => {
        if (!v.valid) {
          valid = false
        }
      })
      return valid
    }
  },
  data() {
    return {
      validationLoaded: false,
      showErrors: false,
      validation: {
        process: {},
        errors: [],
        valid: false,
        inflowCounter: [
          {
            registers: [],
            valid: true
          }
        ],

        inflowWindCounterM2: [
          {
            registers: [],
            valid: true
          }
        ],


        inflowWindCounter: [
          {
            registers: [],
            valid: true
          }
        ],
        speedIndicesCounter: [
          {
            registers: [],
            valid: true
          }
        ],
        speedIndicesM2Counter: [
          {
            registers: [],
            valid: true
          }
        ],
        rationingCounter: [
          {
            registers: [],
            valid: true
          }
        ],
        demandCounter: [
          {
            registers: [],
            valid: true
          }
        ],
        fuelCounter: [{
          registers: [],
          valid: true
        }]
      }
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
