<template>
<div v-loading="loading">
  <div class="row">
    <div class="col-md-4">
      <h3>Seleccione Planta de viento</h3>
      <el-select @change="changePlant()"
                 v-model="windSelected"
                 placeholder="Seleccioné">
        <el-option v-for="item in windM2Config"
                   :key="item.id"
                   :label="item.nombre_planta"
                   :value="item.id">
        </el-option>
      </el-select>
    </div>
    <div class="col-md-8">
      <button @click="$parent.goToCategory(22)"
              style="margin-top:10px;"
              class="btn btn-warning float-right"><i class="icon cube"></i>Agregar planta</button>
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
  </div>
  <div class="row"
       style="margin-top:50px;"
       v-if="!windSelected">
    <div class="col-md-12">
      <center>
        <h4>Debes seleccionar una planta para comenzar a asignar los valores.</h4>
        <img src="/static/layers.png">
      </center>
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
  name: 'SpeedIndicesM2',
  /* props */
  props: [
    'data'
  ],
  mounted() {

    if (!this.$auth.check([
        'Experimental'
      ])) {
      this.$message({
        message: 'No tienes permisos, esta funcionalidad es experimental.',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.blocks.length < 1) {
      this.$alert('No hay bloques, vas a ser redirigido al modulo de bloques.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(19)
        return
      })
    }

    if (this.data.windM2Config.length < 1) {
      this.$alert('No hay plantas eólicas, vas a ser redirigido al modulo.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(22)
        return
      })
    }

    this.windM2Config = this.data.windM2Config
    // this.speedIndices = this.data.months
    this.formatHorizontDate()
    this.onPropsChanged()
  },
  /* metodos publicos */
  methods: {
    changePlant() {
      var speedIndices = []

      // nos recorremos todos los bloques
      _.each(this.data.blocks, (valueBlock, keyBlock) => {
        // nos recorremos todos los windM2Configs
        _.each(this.data.months, (valueMonth, keyHorizont) => {
          speedIndices.push({
            id_month: valueMonth.id,
            fecha: valueMonth.name,
            block_id: valueBlock.id,
            block_name: valueBlock.name,
            value: null
          })
        })
      })

      api.getSpeedIndicesByIdM2(this.windSelected).then((r) => {
        _.each(speedIndices, (v) => {
          _.each(r.data, (vv) => {
            if (vv.month_id === v.id_month && vv.wind_config_id === this.windSelected && v.block_id === vv.block_id) {
              v.value = vv.value
              v.month_id = vv.month_id
              v.wind_config_id = vv.wind_config_id
              v.id = vv.id
            }
          })
        })

        this.speedIndices = speedIndices

      })

    },
    onPropsChanged(newVal) {
      if (newVal) {
        this.speedIndices = newVal.months
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
              message: 'Debes introducir un valor numérico',
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
      v.fromRowData.month_id = v.fromRowData.id_month
      v.fromRowData.process_id = this.$route.params.id
      if (_.isNil(v.fromRowData.wind_config_id)) {
        v.fromRowData.wind_config_id = this.windSelected
        // manda crear
        api.createSpeedIndicesM2(v.fromRowData).then((c) => {
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
        api.updateSpeedIndicesM2(v.fromRowData.id, v.fromRowData).then((c) => {
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
      windM2Config: [],
      speedIndices: [],
      columnsFuelCost: [
        {
          key: 'fecha',
          name: 'Mes',
          editable: false

        },
        {
          key: 'block_name',
          name: 'Bloque',
          editable: false
        },
        {
          key: 'value',
          name: 'Factor de velocidad',
          editable: true
        }
      ]
    }
  }
}

</script>
