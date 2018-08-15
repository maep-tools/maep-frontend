<template>
<div v-loading="loading">
  <div class="row">
    <div class="col-md-6">
      <h3>Seleccione combustible</h3>
    </div>
    <div class="col-md-6">
      <button @click="$parent.goToCategory(17)"
              style="margin-top:10px;"
              class="btn btn-warning float-right"><i class="icon cube"></i>Agregar combustible</button>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <el-select @change="changeFuel()"
                 v-model="fuelSelected"
                 placeholder="Seleccioné">
        <el-option v-for="item in fuels"
                   :key="item.id"
                   :label="item.name"
                   :value="item.id">
        </el-option>
      </el-select>
    </div>
  </div>
  <div class="row"
       style="margin-top:50px;"
       v-if="!fuelSelected">
    <div class="col-md-12">
      <center>
        <h4>Debes seleccionar un combustible para comenzar a asignar los valores.</h4>
        <img width="200"
             src="/static/truck.svg">
      </center>
    </div>
  </div>
  <div class="row"
       style="margin-top:10px;">
    <div class="col-md-12"
         v-if="fuelSelected">
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
  name: 'FuelCost',
  /* props */
  props: [
    'data'
  ],
  mounted() {

    if (!this.$auth.check([
        'fuelCosts'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    this.fuels = this.data.fuels

    if (this.fuels.length < 1) {
      this.$alert('No puedes acceder a esta entidad porque no hay combustibles creados. Vas a ser redirigido al modulo de combustibles.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(17)
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

    this.fuelCost = this.data.horizonts
    this.formatHorizontDate()
    this.onPropsChanged()
  },
  /* metodos publicos */
  methods: {
    changeFuel() {
      var fuelCost = []
      _.each(this.fuelCost, (v) => {
        fuelCost.push({
          'id': v.id,
          'horizont_id': v.id,
          'process_id': v.process_id,
          'period': v.period,
          'fecha': v.fecha
        }
        )
      })
      var that = this
      api.getFuelCostByFuelId(this.fuelSelected).then((r) => {
        _.each(fuelCost, (v) => {
          _.each(r.data, (vv) => {
            if (vv.horizont_id === v.id && vv.planta_fuel_id === this.fuelSelected) {
              v.value = vv.value
              v.horizont_id = vv.horizont_id
              v.planta_fuel_id = vv.planta_fuel_id
              v.fuel_cost_horizonts_id = vv.id
            }
          })
        })
        this.fuelCost = fuelCost

      })
    },
    onPropsChanged(newVal) {
      if (newVal) {
        this.fuelCost = newVal.horizonts
        this.formatHorizontDate()
      }
    },
    formatHorizontDate() {
      _.each(this.fuelCost, (v) => {

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
      return this.fuelCost[i]
    },
    countRowsHorizont() {
      return this.fuelCost.length
    },
    clickedRowHorizon(row) {
      this.selectedRowFuelCost = this.fuelCost[row]
    },
    handleFuelUpdated(v) {
      console.log(v.updated.value)
      if (v.updated.value < 0) {
          this.$message({
            message: 'El valor debe de ser positivo.',
            type: 'error'
          })
          return false
      }

      if (isNaN(v.updated.value)) {
          this.$message({
            message: 'El valor debe de ser numérico.',
            type: 'error'
          })
          return false 
      }


      v.fromRowData.value = v.updated.value
      if (_.isNil(v.fromRowData.planta_fuel_id)) {
        v.fromRowData.planta_fuel_id = this.fuelSelected
        // manda crear
        api.createFuelCostHorizont(v.fromRowData).then((c) => {
          if (c.status === 200) {
            v.fromRowData.demand_id = c.data.id
            this.$message({
              message: 'Periodo creado',
              type: 'success'
            })
          }
        })
      } else {
        // manda modificar
        api.updateFuelCostHorizont(v.fromRowData.fuel_cost_horizonts_id, v.fromRowData).then((c) => {
          console.log(c)
        })

      }
    }
  },
  /* datos del scope */
  data() {
    return {
      loading: false,
      selectedRowFuelCost: '',
      fuelSelected: null,
      fuels: [],
      fuelCost: [],
      columnsFuelCost: [
        {
          key: 'fecha',
          name: 'Horizonte',
          editable: false

        },
        {
          key: 'value',
          name: 'Valor (USD/MBTU)',
          editable: true
        }
      ]
    }
  }
}

</script>
