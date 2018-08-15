<template>
<div class="row"
     v-if="selectedNode"
     v-loading="loading">
  <!-- El arbol -->
  <div class="col-md-4"
       v-if="!menuCategoriesIsHidden"
       style="marginTop:15px">
    <button style="marginBottom:10px;"
            class="ui button mini"
            @click="toggleMenu()"><i class="icon eye"></i>OCULTAR</button>
    <el-input placeholder="Filtrar módulo"
              v-model="filterText">
    </el-input>
    <!--
             default-expand-all
           -->
    <el-tree class="filter-tree"
             :data="categories"
             @node-click="handleNodeClickTree"
             :props="defaultPropsTree"
             :filter-node-method="filterNodeTree"
             ref="tree">
    </el-tree>
  </div>

<el-dialog
  title="Errores de ejecución"
  :visible.sync="dialogVisible"
  width="30%">
  <span>Hay errores en la ejecución del script en el servidor</span>
  <div style="height:120px !important;margin-top:0px;"
       id="terminal-logs"
       class="terminal-logs">
    <ul style="list-style-type: none;">
      <li v-if="log"
          v-for="log in logs">{{log}}</li>
    </ul>
  </div>

  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="dialogVisible = false">Cerrar mensaje</el-button>
  </span>
</el-dialog>



  <!-- El contenido -->
  <div class=""
       v-bind:class="getClassCategoriesContainer()"
       style="marginTop:10px">
    <!-- fila con el titulo de la categoria y un menu de opciones -->
    <div class="row">
      <div class="col-md-6">
        <h2 style="color: #575b5b;"
            v-if="selectedNode.component">
        <i>{{selectedNode.name}}</i></h2>
      </div>
      <div class="col-md-6">
        <button :disabled="!validation.valid" @click="start()" 
           class="button ui  mini inverted green float-right init-button"><i class="icon rocket"></i> Ejecutar</button>
        <a @click="goToConfig()"
           class="button ui mini inverted red float-right">
      <i class="icon cogs"></i>Detalles</a>

      <a v-if="validation.valid && infoData.phase === 4" style="color:black;" @click="goToResults()"
           class="button ui mini  yellow float-right">
      <i class="icon chart line ui"></i>Resultados</a>


        <a v-if="menuCategoriesIsHidden"
           @click="toggleMenu()"
           class="button mini ui float-right">
        <i class="icon eye"></i>CAMBIAR CATEGORIA</a>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-md-12">
        <!-- los diferentes componentes -->

        <thermalConfig :data="data"
                       :infoLoaded="infoLoaded"
                       v-if="selectedNode.component == 'ThermalConfig'"></thermalConfig>
        <thermalExpansion :data="data"
                          :infoLoaded="infoLoaded"
                          v-if="selectedNode.component == 'ThermalExpansion'">
        </ThermalExpansion>
        <Areas :data="data"
               :infoLoaded="infoLoaded"
               v-if="selectedNode.component == 'Areas'"></Areas>
        <Scenario :data="data"
                  :infoLoaded="infoLoaded"
                  v-if="selectedNode.component == 'Scenario'"></Scenario>
        <Types :data="data"
               :infoLoaded="infoLoaded"
               v-if="selectedNode.component == 'Types'"></Types>
        <EntranceStage :data="data"
                       :infoLoaded="infoLoaded"
                       v-if="selectedNode.component == 'EntranceStages'"></EntranceStage>
        <Demand :data="data"
                :infoLoaded="infoLoaded"
                v-if="selectedNode.component == 'Demand'"></Demand>
        <WindConfigCategories
                              :infoData="infoData"
                              :data="data"
                              :infoLoaded="infoLoaded"
                              v-if="selectedNode.component == 'WindConfig'"></WindConfigCategories>
        <fuelCost :data="data"
                  :infoLoaded="infoLoaded"
                  v-if="selectedNode.component == 'FuelCost'"></fuelCost>
        <fuel :data="data"
              :infoLoaded="infoLoaded"
              v-if="selectedNode.component == 'Fuel'"></fuel>
        <RationingCost :data="data"
                       :infoLoaded="infoLoaded"
                       v-if="selectedNode.component == 'RationingCosts'"></RationingCost>
        <Segment :configData="configData"
                 :data="data"
                 :infoLoaded="infoLoaded"
                 v-if="selectedNode.component == 'Segment'"></Segment>
        <SmallConfig :data="data"
                     :infoLoaded="infoLoaded"
                     v-if="selectedNode.component == 'SmallConfig'"></SmallConfig>
        <SmallExpansion :data="data"
                        :infoLoaded="infoLoaded"
                        v-if="selectedNode.component == 'SmallExpansion'"></SmallExpansion>
        <HydroConfig 
                      :infoData="infoData"
                     :data="data"
                     :infoLoaded="infoLoaded"
                     v-if="selectedNode.component == 'HydroConfig'"></HydroConfig>
        <HydroExpansion :data="data"
                        :infoLoaded="infoLoaded"
                        v-if="selectedNode.component == 'HydroExpansion'"></HydroExpansion>
        <WindExpansion :data="data"
                       :infoLoaded="infoLoaded"
                       v-if="selectedNode.component == 'WindExpansion'"></WindExpansion>
        <Inflow :data="data"
                :infoLoaded="infoLoaded"
                v-if="selectedNode.component == 'Inflow'"></Inflow>
        <Blocks :data="data"
                :infoLoaded="infoLoaded"
                v-if="selectedNode.component == 'Blocks'"></Blocks>
        <Lines :data="data"
               :infoLoaded="infoLoaded"
               v-if="selectedNode.component == 'Lines'"></Lines>
        <LinesExpansion :data="data"
                        :infoLoaded="infoLoaded"
                        v-if="selectedNode.component == 'LinesExpansion'"></LinesExpansion>
        <StorageConfig :data="data"
                       :infoLoaded="infoLoaded"
                       v-if="selectedNode.component == 'StorageConfig'"></StorageConfig>
        <StorageExpansion :data="data"
                          :infoLoaded="infoLoaded"
                          v-if="selectedNode.component == 'StorageExpansion'">
        </storageExpansion>
        <windM2Config :data="data"
                      :infoLoaded="infoLoaded"
                      v-if="selectedNode.component == 'Wind_M2_config'"></windM2Config>
        <SpeedIndices :data="data"
                      :infoLoaded="infoLoaded"
                      v-if="selectedNode.component == 'SpeedIndices'"></SpeedIndices>
        <SpeedIndicesM2 :data="data"
                        :infoLoaded="infoLoaded"
                        v-if="selectedNode.component == 'Speed_Indices_M2'"></SpeedIndicesM2>
        <InflowWind 
                    :canEdit="infoData.form.generate_wind"
                    :data="data"
                    :infoLoaded="infoLoaded"
                    v-if="selectedNode.component == 'InflowWind'"></InflowWind>

        <InflowWindM2 
                    :canEdit="infoData.form.generate_wind"
                    :data="data"
                    :infoLoaded="infoLoaded"
                    v-if="selectedNode.component == 'InflowWindM2'"></InflowWindM2>


        <WPowCurve :data="data"
                   :infoLoaded="infoLoaded"
                   v-if="selectedNode.component == 'WPowCurve'"></WPowCurve>
        <Configuration :data="data"
                        :infoData="infoData"
                       :infoLoaded="infoLoaded"
                       v-if="!selectedNode.component"></Configuration>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import _ from 'lodash';
import api from '../../api/process.js';
import Areas from '../Process/Categories/Areas';
import ThermalConfig from '../Process/Categories/ThermalConfig';
import WindConfigCategories from '../Process/Categories/WindConfigCategory';
import Types from '../Process/Categories/Types';
import EntranceStage from '../Process/Categories/EntranceStage';
import Demand from '../Process/Categories/Demand';
import fuelCost from '../Process/Categories/fuelCost';
import fuel from '../Process/Categories/fuel';
import RationingCost from '../Process/Categories/RationingCost';
import Segment from '../Process/Categories/Segment';
import ThermalExpansion from '../Process/Categories/ThermalExpansion';
import SmallConfig from '../Process/Categories/SmallConfig';
import SmallExpansion from '../Process/Categories/SmallExpansion';
import HydroConfig from '../Process/Categories/HydroConfig';
import HydroExpansion from '../Process/Categories/HydroExpansion';
import WindConfig from './WindConfig';
import WindExpansion from '../Process/Categories/WindExpansionCategory';
import Inflow from '../Process/Categories/Inflow';
import Blocks from '../Process/Categories/Blocks';
import Lines from '../Process/Categories/Lines';
import LinesExpansion from '../Process/Categories/LinesExpansion';
import StorageConfig from '../Process/Categories/storageConfig';
import StorageExpansion from '../Process/Categories/storageExpansion';
import WindM2Config from '../Process/Categories/WindM2Config';
import SpeedIndices from '../Process/Categories/SpeedIndices';
import SpeedIndicesM2 from '../Process/Categories/SpeedIndicesM2';
import Scenario from '../Process/Categories/Scenario';
import InflowWind from '../Process/Categories/InflowWind';
import InflowWindM2 from '../Process/Categories/InflowWindM2';
import WPowCurve from '../Process/Categories/WPowCurve';
import Configuration from '../Process/Categories/Configuration';

export default {
  /*
  * Nombre del componente
  */
  name: 'inputStep',
  /*
  * Props
  */
  props: [
    'infoLoaded',
    'categories',
    'data',
    'configData',
    'infoData'
  ],
  /*
  * Componentes hijos
  */
  components: {
    Areas,
    ThermalConfig,
    WindConfigCategories,
    RationingCost,
    Types,
    EntranceStage,
    Demand,
    fuelCost,
    fuel,
    Segment,
    ThermalExpansion,
    SmallConfig,
    SmallExpansion,
    HydroConfig,
    HydroExpansion,
    WindConfig,
    WindExpansion,
    Inflow,
    Blocks,
    Lines,
    LinesExpansion,
    StorageConfig,
    StorageExpansion,
    WindM2Config,
    SpeedIndices,
    Scenario,
    InflowWind,
    WPowCurve,
    SpeedIndicesM2,
    Configuration,
    InflowWindM2
  },
  /*
  * Constructor
  */
  mounted() {
    this.validate()
  },
  destroyed () {
    clearInterval(this.intervalValidation);
  },
  /*
  * Listener de varoables
  */
  watch: {
    data(newVal) {
      console.log(newVal)
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    validate () {
      var that  = this

      api.getValidation(this.$route.params.id).then((v) => {
            that.validation = v.data
      })

      api.getErrorsBackend(this.$route.params.id).then((v) => {
        if (v.data != "") {
          this.logs = v.data.split("\n")
          this.dialogVisible = true
        }
      })

      this.intervalValidation = setInterval(() => {
          api.getValidation(this.$route.params.id).then((v) => {
            that.validation = v.data
          })
      }, 10000)
    },
    /* 
     * Permite redirigir a la pestaña de configuración 
    */
    goToConfig() {
      this.$bus.$emit('changeStep', 0)
      this.$router.push({
        name: 'process',
        params: {
          id: this.$route.params.id
        },
        query: {
          step: 0
        }
      })
    },
    /* 
     * Permite redirigir a la pestaña de resultados 
    */
    goToResults() {
      this.$bus.$emit('changeStep', 0)
      this.$router.push({
        name: 'process',
        params: {
          id: this.$route.params.id
        },
        query: {
          step: 3
        }
      })
    },
    /* 
     * Permite ir a una categoria
    */
    goToCategory(category, searchParamValue, searchParamKey) {
      var node = _(this.categories)
        .thru(function(coll) {
          return _.union(coll, _.map(coll, 'children'))
        })
        .flatten()
        .find({
          id: category
        })

      this.selectedNode = node
      window.localStorage.setItem('node', JSON.stringify(this.selectedNode));
      window.localStorage.setItem(searchParamKey, searchParamValue)
    },
    /*
     * Permite iniciar un proceso 
     */
    start() {
        this.$router.push({
          query: {
            step: 0,
            deploy:true
          }
        })
    },
    /* 
    * Permite filtrar un nodo en el buscador
    *
    */
    filterNodeTree(value, data) {
      if (!value) {
        return true
      }
      return data.name.toUpperCase().indexOf(value.toUpperCase()) !== -1
    },
    /*
    * Al hacer click en algun nodo se cambia de area
    */
    handleNodeClickTree(data) {


      // hacemos la precarga del dato redirigimos
      if (data.id === 14) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getAreas',
            reference: 'areas'
          }
        ])
      }

      if (data.id === 4 || data.id === 5) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getThermalConfig',
            reference: 'thermalConfig'
          }
        ])
      }

      if (data.id === 5) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getThermalConfigExpansion',
            reference: 'thermalConfigExpansion'
          }
        ])
      }

      if (data.id === 17) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getCombustiblesByProcessId',
            reference: 'fuels'
          }
        ])
      }

      if (data.id === 18 || data.id === 6) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getSegments',
            reference: 'segments'
          }
        ])
      }

      if (data.id === 19 || data.id === 20) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getBlocks',
            reference: 'blocks'
          }
        ])
      }

      if (data.id === 19 || data.id === 11) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getScenarios',
            reference: 'scenarios'
          }
        ])
      }

      if (data.id === 2) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getHorizontByProcessId',
            reference: 'horizonts'
          }
        ])
      }

      if (data.id === 7 || data.id === 8) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getSmallConfig',
            reference: 'smallConfig'
          }
        ])
      }

      if (data.id === 8) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getSmallConfigExpansion',
            reference: 'smallConfigExpansion'
          }
        ])
      }

      if (data.id === 9 || data.id === 11) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getHydroConfig',
            reference: 'hydroConfig'
          }
        ])
      }

      if (data.id === 10) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getHydroExpansion',
            reference: 'hydroExpansion'
          }
        ])
      }

      if (data.id === 12 || data.id === 13) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindConfig',
            reference: 'windConfig'
          }
        ])
      }

      if (data.id === 13) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindExpansion',
            reference: 'windConfigExpansion'
          }
        ])
      }

      if (data.id === 22 || data.id === 21) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindM2Config',
            reference: 'windM2Config'
          }
        ])
      }

      if (data.id === 25 || data.id === 26) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getStorageConfig',
            reference: 'storageConfig'
          }
        ])
      }

      if (data.id === 26) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getStorageExpansion',
            reference: 'storageExpansion'
          }
        ])
      }

      if (data.id === 27 || data.id === 28) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getLines',
            reference: 'lines'
          }
        ])
      }

      if (data.id === 28) {
        this.$bus.emit('getModulesData', [
          {
            url: 'getLinesExpansion',
            reference: 'linesExpansion'
          }
        ])
      }

      this.selectedNode = data

    },
    /*
     * Al hacer click en algun nodo se cambia de area
     */
    toggleMenu() {
      var loading = this.$loading({
        lock: true,
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255)'
      })

      setTimeout(() => {
        this.menuCategoriesIsHidden = !this.menuCategoriesIsHidden
      }, 500)

      setTimeout(() => {
        loading.close()
        window.dispatchEvent(new Event('resize'))
      }, 1000)
    },
    /*
     * Obtiene la clase para determinar si muestra el menu
     */
    getClassCategoriesContainer() {
      if (!this.menuCategoriesIsHidden) {
        return 'col-md-8'
      } else {
        return 'col-md-12'
      }
    }
  },
  data() {
    return {
      logs: [],
      dialogVisible: false,
      validation: {},
      loading: false,
      menuCategoriesIsHidden: false,
      value: '',
      areas: [],
      filterText: '',
      selectedNode: {},
      defaultPropsTree: {
        children: 'children',
        label: 'name'
      }
    }
  }
}

</script>
