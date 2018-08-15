<template>
  <div v-loading="loading">
    <div class="row">
      <div class="col-md-4">
          <h3>Seleccione segmento</h3>
                <el-select @change="changeSegment()" v-model="segmentSelected" placeholder="Seleccione">
            <el-option
              v-for="item in segments"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
      </div>
      <div class="col-md-8">
              <button 
                  @click="$parent.goToCategory(18)"
                      style="margin-top:10px;"
                      class="btn btn-warning float-right"><i class="icon cube"></i>Agregar segmento</button>
      </div>
    </div>

    <div class="row" style="margin-top:10px;">
      <div class="col-md-12" v-if="segmentSelected">

               <el-alert
               style="margin-bottom:10px;"
               v-if="!validFactor()"
               title="El factor no es valido por que todos los valores estan en cero."
               type="warning">
            </el-alert>


              <ReactDataGrid :enableCellSelect="true"
                             :enableDragAndDrop="true"
                             key="RationingCost"
                             :columns="columnsRationingCost"
                             @rowGetter="rowGetterRationingCost"
                             :rowsCount="countRowsHorizont()"
                             @onRowClick="clickedRowHorizon"
                             @onGridRowsUpdated="handleFuelUpdated"
                             :minHeight="500"
                             ;></ReactDataGrid>
      </div>




    </div>


  <div class="row" style="margin-top:50px;" v-if="!segmentSelected">
    <div class="col-md-12">
        <center>
          <h4>Debes seleccionar un segmento para comenzar a asignar los valores.</h4>
          <img width="180" src="/static/rationing1.svg">
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
  components : {
    ReactDataGrid
  },
  name: 'RationingCost',
  /* props */
  props: [
    'data'
  ],
  mounted () {

    if (!this.$auth.check([
        'rationingCost'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }


  this.segments = this.data.segments
  
    if (this.data.segments.length < 1) {
        this.$alert('Debe de existir por lo menos un segmento, vas a ser redirigido al modulo de segmentos.', 'Advertencia', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancelar',
          type: 'error'
        }).then(() => {
          this.$parent.goToCategory(18)
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


  this.rationingCost = this.data.horizonts
  this.formatHorizontDate()
    this.onPropsChanged()
  },
  /* metodos publicos */
  methods: {
    changeSegment () {
      var rationingCost = []
      _.each(this.rationingCost, (v) => {
        rationingCost.push({
          'id': v.id,
          'horizont_id': v.id,
          'process_id': v.process_id,
          'period': v.period,
          'fecha': v.fecha
        }
        )
      })
      var that = this
      api.getRationingCostBySegmentId(this.segmentSelected).then((r) => {
        _.each(rationingCost, (v) => {
          _.each(r.data, (vv) => {
            if (vv.horizont_id === v.id && vv.segment_id === this.segmentSelected) {
              v.value = vv.value
              v.horizont_id = vv.horizont_id
              v.rationing_costs_id = vv.rationing_costs_id
              v.segment_id = vv.segment_id
            }
          })
        })
        this.rationingCost = rationingCost

      })
    },
    onPropsChanged(newVal) {
     if (newVal) {
      this.rationingCost = newVal.horizonts
        this.formatHorizontDate()
     }
    },
    formatHorizontDate() {
      _.each(this.rationingCost, (v) => {

        v.fecha = this.formatMonthDate(v.period)

      })
    },

    validFactor () {
      var valid = true
      var sum = 0

      this.rationingCost.forEach((v)=> {
        sum = sum + v.value
      })

      if (sum == 0) {
        valid = false
      }
      return valid
    },

    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    addFuel () {

    },
    rowGetterRationingCost (i) {
       return this.rationingCost[i]
    },
    countRowsHorizont () {
      return this.rationingCost.length
    },
    clickedRowHorizon (row) {
      this.selectedRowRationingCost = this.rationingCost[row]
    },
    handleFuelUpdated (v) {

      if (isNaN(v.updated.value)) {
        this.$message({
          message: 'El valor no es numérico',
          type: 'error'
        })    
        return
      }


      if (v.updated.value < 0) {
        this.$message({
          message: 'El valor no debe ser negativo o nulo.',
          type: 'error'
        })    
        return
      }

    v.fromRowData.value = v.updated.value
      if (_.isNil(v.fromRowData.rationing_costs_id)) {
        v.fromRowData.segment_id = this.segmentSelected
        // manda crear
        api.createRationingCost(v.fromRowData).then((c) => {
          if (c.status === 200) {
            v.fromRowData.rationing_costs_id = c.data.id
            this.$message({
              message: 'Costo de racionamiento creado.',
              type: 'success'
            })
          }
        })
      } else {
        // manda modificar
        api.updateRationingCost(v.fromRowData.rationing_costs_id, v.fromRowData).then((c) => {
            this.$message({
              message: 'Costo de racionamiento modificado.',
              type: 'success'
            })
        })

      }
    }
  },
  /* datos del scope */
  data () {
    return {
      loading: false,
      selectedRowRationingCost: '',
      segmentSelected: null,
      segments: [],
      rationingCost: [],
      columnsRationingCost: [{
          key: 'fecha',
          name: 'Horizonte',
          editable: false

        },
        {
          key: 'value',
          name: 'Valor (USD/MWh)',
          editable: true
        }]
    }
  }
}
</script>
