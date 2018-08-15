<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <!-- MENU DE COMPONENTE -->
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="visibleTable"
              @click="showModal()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow(selectedRow)"
              v-if="selectedRow"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Eliminar seleccionado (id:{{selectedRow.id}})</button>
    </div>
  </div>
  <div v-if="visibleTable && !loading">
    <el-alert style="margin-bottom:20px;"
              v-if="rows.length > 0"
              title="Para editar las propiedades de la planta selecciona un registro."
              type="warning"
              show-icon>
    </el-alert>
    <div v-if="rows.length > 0">
      <ReactDataGrid :enableCellSelect="true"
                     :columns="columns"
                     key="hydroConfig"
                     @rowGetter="rowGetter"
                     :rowsCount="getCounter()"
                     @onRowClick="clickedRow"
                     :minHeight="500"
                     ></ReactDataGrid>
    </div>
    <div v-else>
      <center>
        <h2>No existen expansiones</h2>
        <img width="200"
             src="/static/expansion.svg">
        <hr>
        <button @click="showModal()"
                class="btn btn-lg btn-primary"><i class="icon add"></i>Agregar nueva</button>
      </center>
    </div>
  </div>
  <div class="row"
       v-if="!visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6"
         v-if="column.displayInForm">
      <div class="form-group required"
           v-if="column.type === 'text'">
        <label class="control-label">{{column.name}}</label>
        <input :disabled="isDisabledField(column.key)"
               v-model="selectedRow[column.key]"
               type="text"
               name="name"
               class="form-control"
               placeholder="Ingrese valor">
      </div>
      <div class="form-group required"
           v-if="column.type === 'numeric'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <vue-numeric 
                      :min="column.min"
                      :max="column.max"
                      class="form-control"
                     :precision="column.precision"
                     :decimal-separator="column.decimalSeparator"
                     :thousand-separator="column.thousandSeparator"
                     v-model="selectedRow[column.key]"></vue-numeric>
      </div>
      <div class="form-group required"
           v-if="column.type === 'month'">
        <label class="control-label">{{column.name}}</label>
        <el-date-picker style="width:100%"
                        v-model="selectedRow[column.key]"
                        type="month"
                        placeholder="Seleccione">
        </el-date-picker>
      </div>
      <div class="form-group required"
           v-if="column.type === 'select'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <el-select style="width:100%"
                  @change="changeSelect(column)"
                   v-model="selectedRow[column.originalForeign]">
          <el-option v-for="item in getSelectValues(column.entity)"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id">
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="col-md-12">
      <button @click="visibleTable = true"
              class="btn btn-dark float-right">
        <i class="icon cancel"></i>Cancelar </button>
      <button style="margin-right:10px;"
              @click="update"
              class="btn btn-primary float-right">
        <i class="icon save"></i>Actualizar
      </button>
    </div>
  </div>
  <el-dialog title="Nueva expansión"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <div class="form-group required">
          <label class="control-label">Seleccione configuración a expandir </label>
          <el-select style="width:100%"
                     v-model="selectedLineConfig">
            <el-option v-for="item in data.lines"
                       :key="item.id"
                       :label="getLabel(item)"
                       :value="item.id">
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Fecha Modificación</label>
        <div class="form-group required">
          <el-select clearable
                     style="width:100%"
                     v-model="selectedHorizont">
            <el-option v-for="item in getSelectValues('horizonts')"
                       :key="item.id"
                       :label="item.period"
                       :value="item.id">
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
    <el-button @click="dialogCreateVisible = false">Cancelar</el-button>
    <el-button  @click="addRow()" :disabled="!selectedLineConfig && selectedLineConfigMonth" type="primary">Continuar</el-button>
  </span>
  </el-dialog>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';
export default {
  name: 'linesExpansion',
  mounted() {

    if (!this.$auth.check([
        'linesExpansions'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.horizonts.length < 1) {
      this.$alert('No hay horizontes definidos, vas a ser redirigido al modulo de demanda.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(2)
      })
    }

    if (this.data.lines.length < 1) {
      this.$alert('No hay lineas, vas a ser redirigido al modulo de redes de expansión.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(27)
        return
      })
    }

    this.columns = this.filterHiddenColumns()
    this.onPropsChanged()
  },
  watch: {
    data: {
      handler(newVal, oldVal) {
        this.onPropsChanged()
      },
      deep: true,
      immediate: true
    }
  },
  props: [
    'data'
  ],
  components: {
    ReactDataGrid
  },
  methods: {
        changeSelect(column) {
      if (column.originalForeign === 'a_final' || column.originalForeign === 'a_initial') {

        if (this.selectedRow.a_initial && this.selectedRow.a_final) {
          var a_initialExist = _.find(this.data.linesExpansion, {
            a_initial: this.selectedRow.a_initial,
            a_final: this.selectedRow.a_final
          })

          if (a_initialExist) {
            if (a_initialExist.id !== this.selectedRow.a_final) {
              var a_initialExistInverted = _.find(this.data.linesExpansion, {
                a_initial: this.selectedRow.a_final,
                a_final: this.selectedRow.a_initial
              })
            }
          }

          if (a_initialExist) {
            if (a_initialExist.id !== this.selectedRow.id) {

              this.selectedRow.a_final = null
              this.selectedRow.a_initial = null

              this.$message({
                message: 'La linea ya esta registrada.',
                type: 'error'
              })
            }
          }

          if (a_initialExistInverted) {
            if (a_initialExistInverted.id !== this.selectedRow.id) {

              this.selectedRow.a_final = null
              this.selectedRow.a_initial = null

              this.$message({
                message: 'La linea ya esta registrada.',
                type: 'error'
              })
            }
          }

        }
      }
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 // months from 1-12
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    getSelectValues(entity) {
      if (entity === 'horizonts') {
        var data = []
        _.each(this.data.horizonts, (v) => {
          data.push({
            id: v.id,
            name: this.formatMonthDate(v.period),
            period: this.formatMonthDate(v.period)
          })
        })
        return data
      } else {
        return this.data[entity]
      }
    },
    showModal() {
      this.dialogCreateVisible = true
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 // months from 1-12
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    /* Permite filtrar columnas ocultas */
    filterHiddenColumns() {
      return _.filter(this.allColumns, {
        display: true
      })
    },
    onPropsChanged() {
      this.rows = _.clone(this.data.linesExpansion, true)

      if (this.rows.length < 1) {
        this.loading = false
      }

      _.each(this.rows, (v, k) => {
        if (_.isNil(v.initial)) {
          v.area1 = 'No asociado'
        } else {
          v.area1 = v.initial.name
        }

        if (_.isNil(v.final)) {
          v.area2 = 'No asociado'
        } else {
          v.area2 = v.final.name
        }

        if (k === this.rows.length - 1) {
          setTimeout(() => {
            this.loading = false
          }, 2000)
        }
      })

      _.each(this.rows, (v, k) => {
        v.modifcationFormatted = this.formatMonthDate(v.horizont.period)
        if (k === this.rows.length - 1) {
          setTimeout(() => {
            this.loading = false
          }, 2000)
        }
      })
    },
    getCounter() {
      return this.rows.length
    },
    getLabel(item) {
      if (!_.isNil(item.initial)) {
        return item.initial.name + '-' + item.final.name
      } else {
        return 'NO ASIGNADO - NO ASIGNADO'
      }
    },
    update() {
      api.updateLinesExpansion(this.selectedRow.id, {
        id: this.selectedRow.id,
        stage: this.selectedRow.stage,
        line_id: this.selectedRow.line_id,
        efficiency: this.selectedRow.efficiency,
        resistence: this.selectedRow.resistence,
        reactance: this.selectedRow.reactance,
        a_b: this.selectedRow.id,
        a_final: this.selectedRow.a_final,
        a_initial: this.selectedRow.a_initial,
        b_ai: this.selectedRow.b_ai,
        process_id: this.selectedRow.process_id
      }).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            url: 'getLinesExpansion',
            reference: 'linesExpansion'
          }
        ])
        this.visibleTable = true
      })
    },
    isDisabledField(field) {
      if (field === 'id') {
        return true
      }
      return false
    },
    /* 
     * Permite agregar un registro
    */
    addRow() {
      this.dialogCreateVisible = false
      this.selectedRow = null
      api.createLinesExpansion({
        stage: this.selectedHorizont,
        line_id: this.selectedLineConfig,
        efficiency: 0,
        resistence: 0,
        reactance: 0,
        a_b: 0,
        a_final: null,
        a_initial: null,
        b_ai: 0,
        process_id: this.$route.params.id
      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getLinesExpansion',
            reference: 'linesExpansion'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteLinesExpansion(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true
        this.$bus.emit('getModulesData', [
          {
            url: 'getLinesExpansion',
            reference: 'linesExpansion'
          }
        ])

        this.$message({
          message: 'El registro se ha eliminado',
          type: 'success'
        })

      })
    },
    /* 
     * Permite seleccionar un registro
    */
    clickedRow(row) {

      this.$confirm('¿Quieres entrar al detalle de la configuración?', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        this.visibleTable = false
        this.selectedRow = this.rows[row]
      })
    },
    /* 
     * Permite obtener un row especifico
    */
    rowGetter(i) {
      return this.rows[i]
    }
  },
  data() {
    return {
      selectedHorizont: null,
      dialogCreateVisible: false,
      selectedLineConfigMonth: null,
      selectedLineConfig: null,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/hydroConfig/importExcel/' + this.$route.params.id,
      selectedRow: null,
      rows: [],
      columns: [],
      allColumns: [
        {
          key: 'area1',
          originalForeign: 'a_initial',
          name: 'Desde ',
          type: 'select',
          entity: 'areas',
          resizable: true,
          display: true,
          displayInForm: true
        },
        {
          key: 'area2',
          originalForeign: 'a_final',
          name: 'Hacia',
          type: 'select',
          entity: 'areas',
          resizable: true,
          display: true,
          displayInForm: true
        },
        {
          key: 'modifcationFormatted',
          name: 'Modificación',
          unit: '%',
          type: 'text',
          resizable: true,
          display: true,
          displayInForm: false
        },
        {
          key: 'stage',
          originalForeign: 'stage',
          name: 'Modificación',
          type: 'select',
          keySelect: 'period',
          entity: 'horizonts',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'efficiency',
          name: 'Eficiencia max:2, min: 0',
          unit: '%',
          max:2,
          min:0,
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'a_b',
          name: 'Capacidad desde-hacia',
          unit: 'MW',
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'b_ai',
          name: 'Capacidad hacia-desde',
          unit: 'MW',
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'resistence',
          name: 'Resistencia',
          unit: 'Ohm',
          type: 'numeric',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'reactance',
          name: 'Reactancia',
          unit: 'X',
          type: 'numeric',
          resizable: true,
          display: false,
          displayInForm: true
        }
      ]
    }
  }
}

</script>
