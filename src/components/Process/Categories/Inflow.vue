<template>
<div v-loading="loading">
  <div class="row">
    <div class="col-md-4">
      <h3>Seleccione Planta</h3>
      <el-select @change="changePlant()"
                 v-model="windSelected"
                 placeholder="Seleccioné">
        <el-option v-for="item in hydroConfig"
                   :key="item.id"
                   :label="item.planta"
                   :value="item.id">
        </el-option>
      </el-select>
    </div>
    <div class="col-md-8">
      <button @click="$parent.goToCategory(9)"
              style="margin-top:10px;"
              class="btn btn-warning float-right"><i class="icon cube"></i>Agregar planta hidroeléctrica</button>
    </div>
  </div>
  <div class="row"
       style="margin-top:10px;">
    <div class="col-md-12"
         v-if="windSelected">
      <ReactDataGrid :enableCellSelect="true"
                     :enableDragAndDrop="true"
                     key="FuelCost"
                     :columns="columnsFuelCost"
                     @rowGetter="rowGetterFuelCost"
                     :rowsCount="countRowsHorizont()"
                     @onRowClick="clickedRowHorizon"
                     @onGridRowsUpdated="handleFuelUpdated"
                     :minHeight="500"
                     ;></ReactDataGrid>
    </div>
    <div v-if="!windSelected"
         class="col-md-12">
      <div class="col-md-12">
        <center>
          <h4>Debes seleccionar una planta para comenzar.</h4>
          <img src="/static/layers.png">
        </center>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* nombre del componente */
  components: {
    ReactDataGrid
  },
  name: 'Inflow',
  /* props */
  props: [
    'data'
  ],
  mounted() {

    if (!this.$auth.check([
        'inflows'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.hydroConfig.length < 1) {
      this.$alert('No existen plantas, vas a ser redirigido al modulo de plantas hidroeléctricas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(9)
        return
      })
    }

    if (this.data.horizonts.length < 1) {
      this.$alert('No hay horizontes, vas a ser redirigido al modulo de demanda.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(2)
      })
    }

    if (this.data.scenarios.length < 1) {
      this.$alert('No hay escenarios, vas a ser redirigido al modulo de escenarios.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(29)
      })
    }

    this.hydroConfig = this.data.hydroConfig
    // this.speedIndices = this.data.horizonts
    this.formatHorizontDate()
    this.onPropsChanged()
  },
  /* metodos publicos */
  methods: {
    changePlant() {
      var speedIndices = []

      // nos recorremos todos los bloques
      _.each(this.data.scenarios, (valueScenario, keyScenario) => {
        // nos recorremos todos los hydroConfigs
        _.each(this.data.horizonts, (valueHorizont, keyHorizont) => {
          speedIndices.push({
            id_horizont: valueHorizont.id,
            fecha: this.formatMonthDate(valueHorizont.period),
            scenario: valueScenario.name,
            scenario_id: valueScenario.id,
            value: null
          })
        })
      })

      api.getInflowByHydroConfigId(this.windSelected).then((r) => {
        _.each(speedIndices, (v) => {
          _.each(r.data, (vv) => {
            if (vv.horizont_id === v.id_horizont && vv.hidro_config_id === this.windSelected && v.scenario_id === vv.scenario_id) {
              v.value = vv.value
              v.scenario = vv.name
              v.horizont_id = vv.horizont_id
              v.hidro_config_id = vv.hidro_config_id
              v.id = vv.id
            }
          })
        })

        console.log(this.speedIndices)
        this.speedIndices = speedIndices

      })

    },
    onPropsChanged(newVal) {
      if (newVal) {
        this.speedIndices = newVal.horizonts
        this.formatHorizontDate()
      }
    },
    formatHorizontDate() {
      _.each(this.speedIndices, (v) => {
        v.fecha = this.formatMonthDate(v.period)
      })
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 // months from 1-12
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    addFuel() {},
    rowGetterFuelCost(i) {
      return this.speedIndices[i]
    },
    countRowsHorizont() {
      return this.speedIndices.length
    },
    clickedRowHorizon(row) {
      this.selectedRowFuelCost = this.speedIndices[row]
    },
    handleFuelUpdated(v) {
      
      if (!_.isNil(v.updated.value)) {
        if (isNaN(v.updated.value)) {
            this.$message({
              message: 'Debes insertar un valor numérico.',
              type: 'error'
            })
            return
        }

        if (v.updated.value < 0) {
            this.$message({
              message: 'El valor debe ser positivo.',
              type: 'error'
            })
            return
        }


      }


      v.fromRowData.value = v.updated.value
      v.fromRowData.horizont_id = v.fromRowData.id_horizont
      v.fromRowData.process_id = this.$route.params.id
      if (_.isNil(v.fromRowData.hidro_config_id)) {
        v.fromRowData.hidro_config_id = this.windSelected
        // manda crear
        api.createInflow(v.fromRowData).then((c) => {
          if (c.status === 200) {
            v.fromRowData.demand_id = c.data.id
            this.$message({
              message: 'El indice ha sido creado',
              type: 'success'
            })
          }
        })
      } else {
        // manda modificar
        api.updateInflow(v.fromRowData.id, v.fromRowData).then((c) => {
          console.log(c)
        })

      }
    }
  },
  /* datos del scope */
  data() {
    return {
      speedIndices: [],
      loading: false,
      selectedRowFuelCost: '',
      windSelected: null,
      hydroConfig: [],
      speedIndices: [],
      columnsFuelCost: [
        {
          key: 'fecha',
          name: 'Mes',
          editable: false

        },
        {
          key: 'scenario',
          name: 'Escenario',
          editable: false
        },
        {
          key: 'value',
          name: 'Afluente (m3/s)',
          editable: true
        }
      ]
    }
  }
}

</script>
