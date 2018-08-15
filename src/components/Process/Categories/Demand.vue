<template>
<div>
  <div class="row"
       v-loading="loading"
       element-loading-text="Creando demanda">
    <div class="col-md-12">
      <div class="mainButton"
           v-if="showMenuAdd">
        <center>
          <button v-if="areas.length > 0"
                  @click="addDemand()"
                  style="margin-top:130px"
                  class="btn btn-primary btn-lg">
            <i class="icon add"></i> Agregar demanda</button>
        </center>
      </div>
      <div v-if="showFactorArea">
        <div class="row">
          <div class="col-md-12">
            <button style="margin-left:10px;"
                    @click="toggleFactorArea()"
                    class="btn btn-warning float-right">
              <i class="icon calendar"></i> Definición de horizonte</button>
            <button @click="$parent.goToCategory(14)"
                    class="btn btn-primary float-right"><i class="icon cube"></i>Configurar áreas</button>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <h3>Seleccione Área</h3>
            <hr>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <!--
         <a @click="selectedArea = null">Limpiar </a>
      -->
            <el-select @change="changeArea()"
                       v-model="selectedArea"
                       placeholder="seleccione">
              <el-option v-for="item in areas"
                         :key="item.id"
                         :label="item.name"
                         :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="row"
             style="margin-top:20px;">

          <div class="col-md-12"
            v-if="demand.length > 0">

               <el-alert
               style="margin-bottom:10px;"
               v-if="!validFactor()"
               title="El factor no es valido por que todos los valores estan en cero."
               type="warning">
            </el-alert>

            <ReactDataGrid :enableCellSelect="true"
                           :key="selectedArea"
                           :columns="columnsFactor"
                           @rowGetter="rowGetterDemand"
                           :rowsCount="countRowsDemand()"
                           @onGridRowsUpdated="handleDemandUpdated"
                           :minHeight="500"
                           ;></ReactDataGrid>
          </div>
        </div>
      </div>
      <div v-if="!showMenuAdd &&  !showFactorArea">
        <div class="row">
          <div class="col-md-12"
               v-if="horizont.length > 0">
            <button @click="toggleFactorArea()"
                    style="margin-top:10px;"
                    class="btn btn-warning float-right"><i class="icon cube"></i>Configurar la demanda de las areas</button>
            <button @click="deleteHorizont()"
                    style="margin-top:10px; margin-right:10px;"
                    class="btn btn-danger float-right"><i class="trash icon"></i>Eliminar horizonte</button>
          </div>
        </div>
        <h3>Agregar horizonte de demanda</h3>
        <div class="row"
             style="margin-top:20px;">
          <div class="col-md-6">
            <el-date-picker style="width:100%"
                            v-model="initialDate"
                            type="month"
                            placeholder="Seleccione fecha inicial">
            </el-date-picker>
          </div>
          <div class="col-md-6">
            <el-date-picker style="width:100%"
                            v-model="finishDate"
                            type="month"
                            placeholder="Seleccione fecha de fín">
            </el-date-picker>
            <button @click="addRange()"
                    v-if="initialDate && finishDate"
                    style="margin-top:10px;"
                    class="btn btn-outline-primary float-right"><i class="icon plus"></i>Agregar horizonte</button>
            <button v-if="selectedRowHorizont !== null"
                    @click="deleteSelectedHorizon()"
                    style="margin-top:10px; margin-right:2px;"
                    class="btn btn-outline-danger float-right"><i class="icon plus"></i>Eliminar seleccionado</button>
          </div>
        </div>
        <div class="row"
             style="margin-top:20px;">
          <div class="col-md-12"
               v-if="horizont.length > 0">

               <el-alert
               style="margin-bottom:10px;"
               v-if="!validDemand()"
               title="La demanda no es valida por que todos los valores estan en cero."
               type="warning">
            </el-alert>

            <ReactDataGrid :enableCellSelect="true"
                           :enableDragAndDrop="true"
                           key="Horizont"
                           :columns="columnsHorizont"
                           @rowGetter="rowGetterHorizont"
                           :rowsCount="countRowsHorizont()"
                           @onRowClick="clickedRowHorizon"
                           @onGridRowsUpdated="handleHorizonUpdated"
                           :minHeight="500"
                           ;></ReactDataGrid>
          </div>
          <div class="col-md-12"
               v-if="horizont.length === 0">
            <center>
              <h2>No se ha definido un horizonte</h2>
              <div class="ui message warning">
                <p>Debe seleccionar una fecha inicial y una fecha final para poder agregar un horizonte.</p>
              </div>
              <img width="250"
                   src="/static/rationing.svg">
            </center>
          </div>
        </div>
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

  name: 'Demand',
  props: [
    'data'
  ],
  mounted() {

    if (!this.$auth.check([
        'demands'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (window.localStorage.getItem('showFactorArea') === 'true') {
      window.localStorage.setItem('showFactorArea', false)
      this.showFactorArea = true
    }

    this.onPropsChanged()
  },
  watch: {
    data: {
      handler(newVal) {
        this.onPropsChanged(newVal)
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    ReactDataGrid
  },
  methods: {
    validDemand () {
      var valid = true
      var sum = 0
      console.log(this.data)
      this.data.horizonts.forEach((v)=> {
        console.log(v)
        sum = sum + v.national
      })

      if (sum == 0) {
        valid = false
      }
      return valid
    },
    validFactor () {
      var valid = true
      var sum = 0

      this.demand.forEach((v)=> {
        sum = sum + v.factor
      })

      if (sum == 0) {
        valid = false
      }
      return valid
    },
    onPropsChanged(newVal) {
      if (newVal) {
        this.areas = newVal.areas
        this.horizont = newVal.horizonts
        this.formatHorizontDate()
      }
    },
    deleteSelectedHorizon() {
      api.deleteHorizontById(this.selectedRowHorizont.id).then((r) => {
        if (r.data !== 'error') {
          this.horizont.splice(this.horizont.indexOf(this.selectedRowHorizont), 1)
          this.selectedRowHorizont = null
        } else {
          this.$message({
            message: 'Error al eliminar, esta siendo usado en otra dependencia.',
            type: 'error'
          })
        }
      })
    },
    /* 
     * Permite seleccionar un registro
    */
    clickedRowHorizon(row) {
      this.selectedRowHorizont = this.horizont[row]
    },
    handleDemandUpdated(v) {

      if (!_.isNil(v.updated.factor)) {
        if (isNaN(v.updated.factor)) {

          this.$message({
            message: 'Introduce un valor numérico',
            type: 'error'
          })

          return false
        }

        if (v.updated.factor < 0) {

          this.$message({
            message: 'Introduce un valor positivo.',
            type: 'error'
          })

          return false
        }
      }

      v.fromRowData.factor = v.updated.factor
      v.fromRowData.area_id = this.selectedArea

      if (_.isNil(v.fromRowData.demand_id)) {
        v.fromRowData.horizont_id = v.fromRowData.id
        // manda crear
        api.createDemand(v.fromRowData).then((c) => {
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
        api.updateDemand(v.fromRowData.demand_id, v.fromRowData).then((c) => {
          console.log(c)
        })

      }
    },
    handleHorizonUpdated(v) {

      if (!_.isNil(v.updated.national)) {
        if (isNaN(v.updated.national)) {
          this.$message({
            message: 'El valor no es numérico',
            type: 'error'
          })
          return false
        }

        if (v.updated.national < 0) {

          this.$message({
            message: 'La demanda debe de ser mayor a cero.',
            type: 'error'
          })

          return false
        }

      }

      v.fromRowData.national = v.updated.national
      api.updateHorizont(v.fromRowData.id, v.fromRowData).then((r) => {
        this.$message({
          message: 'Periodo actualizado',
          type: 'success'
        })

      })
    },
    deleteHorizont() {

      this.$confirm('Estas completamente seguro de que deseas eliminar la demanda? Esto es muy peligroso pues borra un monton de entidades en cascada. Luego es imposible recuperar. Continuar?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        api.deleteHorizontByProcessId(this.$route.params.id).then((c) => {
          if (c.status === 200 && c.data !== 'error') {
            this.$bus.emit('getModulesData', [
              {
                url: 'getHorizontByProcessId',
                reference: 'horizonts'
              }
            ])
            this.$message({
              message: 'El horizonte se elimino satisfactoriamente',
              type: 'success'
            })
          } else {
            this.$message({
              message: 'No se ha podido eliminar, esta siendo usado por otra dependencia.',
              type: 'error'
            })
          }
        })
      })
    },
    formatHorizontDate() {
      _.each(this.horizont, (v) => {

        v.fecha = this.formatMonthDate(v.period)

      })
    },
    formatPeriodDate() {
      _.each(this.demand, (v) => {

        v.fecha = this.formatMonthDate(v.period)

      })
    },
    toggleFactorArea() {
      if (this.data.areas.length > 0) {
        this.selectedArea = null
        this.demand = []
        this.showFactorArea = !this.showFactorArea
      } else {
        this.$confirm('No tienes areas por lo que no puedes acceder a configurar. Deseas ir a crear áreas?', 'Advertencia', {
          confirmButtonText: 'ir a crear áreas',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        }).then((v) => {
          if (v) {
            this.$parent.goToCategory(14)
          }
        })
      }
    },
    addDemand() {
      this.showMenuAdd = false
    },
    formatData(data) {
      _.each(data, function(v) {
        v.area = v.areas.name
      })
    },
    countRowsHorizont() {
      return this.horizont.length
    },
    countRowsDemand() {
      return this.demand.length
    },
    changeArea() {
      var demand = []
      _.each(this.horizont, (v) => {
        demand.push({
          'id': v.id,
          'process_id': v.process_id,
          'period': v.period,
          'national': v.national,
          'created_at': v.created_at,
          'updated_at': v.updated_at,
          'fecha': v.fecha
        }
        )
      })
      var that = this
      api.getDemandByArea(this.selectedArea).then((r) => {
        _.each(demand, (v) => {
          _.each(r.data, (vv) => {
            if (vv.horizont_id === v.id && vv.area_id === this.selectedArea) {
              v.factor = vv.factor
              v.demand_id = vv.demand_id
              v.horizont_id = vv.horizont_id
              v.area_id = vv.area_id
              this.demand = demand
            }
          })
        })

        this.demand = demand

      })
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 // months from 1-12
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    /* 
     * Permite obtener un row especifico
    */
    rowGetterDemand(i) {
      return this.demand[i]
    },
    /* 
     * Permite obtener un row especifico
    */
    rowGetterHorizont(i) {
      return this.horizont[i]
    },
    /* 
     * Permite agregar un registro
    */
    toggleAdd() {
      this.showAddForm = true
    },

    periodExist(period) {
      var periodDate = new Date(period)
      var periodFormatted = periodDate.getFullYear() + '/' + periodDate.getMonth()
      var exist = _.find(this.horizont, {
        fecha: periodFormatted
      })

      return exist
    },

    addRange() {
      var diff = this.monthDiff(this.initialDate, this.finishDate)
      if (diff > -1) {
        for (var i = diff; i >= 0; i--) {
          var saved = 0
          var period = this.generateDateToCreate(i, this.initialDate)
          console.log(diff)
          if (this.periodExist(period)) {
            this.$message({
              message: 'El periodo ya existe',
              type: 'warning'
            })
            break;
            return
          }

          this.loading = true
          api.createHorizont({
            process_id: parseInt(this.$route.params.id, 10),
            period: period.toLocaleString(),
            national: 0
          }).then(() => {
            saved += 1

            if (saved === diff) {
              this.$message({
                message: 'Rango agregado correctamente',
                type: 'success'
              })

              this.$bus.emit('getModulesData', [
                {
                  url: 'getHorizontByProcessId',
                  reference: 'horizonts'
                }
              ])
              this.showAddForm = false
              this.loading = false
            }

          })
        }
      } else {
        this.$message({
          message: 'El mes de inicio debe ser mayor.',
          type: 'error'
        })
      }

    },
    generateDateToCreate(iteration, initialDate) {
      var date = new Date()
      date.setDate(1)
      date.setYear(initialDate.getFullYear())
      date.setMonth(initialDate.getMonth() + iteration)

      var dd = date.getDate()
      var mm = date.getMonth() + 1
      var yyyy = date.getFullYear()
      if (dd < 10) {
        dd = '0' + dd
      }
      if (mm < 10) {
        mm = '0' + mm
      }
      return mm + '/' + dd + '/' + yyyy
    },
    monthDiff(d1, d2) {
      var months
      months = (d2.getFullYear() - d1.getFullYear()) * 12
      months -= d1.getMonth() + 1
      months += d2.getMonth()
      return months <= 0 ? 0 : months + 1
    },
    mysqlDate(date) {
      date = date || new Date()
      return date.toISOString().split('T')[0]
    }

  },
  data() {
    return {
      showFactorArea: false,
      selectedRowHorizont: null,
      showMenuAdd: false,
      horizont: [],
      loading: false,
      demand: [],
      initialDate: '',
      finishDate: '',
      areas: [],
      selectedArea: null,
      rows: [], // filas
      columnsHorizont: [
        {
          key: 'fecha',
          name: 'Mes',
          editable: false

        },
        {
          key: 'national',
          name: 'Demanda agregada (MW)',
          editable: true
        }
      ],
      columnsFactor: [
        {
          key: 'fecha',
          name: 'Horizonte',
          editable: false

        },
        {
          key: 'national',
          name: 'Demanda agregada (MW)',
          editable: false
        },
        {
          key: 'factor',
          name: 'Factor',
          editable: true
        }
      ]
    }
  }
}

</script>
