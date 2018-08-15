<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <!-- MENU DE COMPONENTE -->
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="!showUpload && visibleTable"
              @click="showModal()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow(selectedRow)"
              v-if="selectedRow && !showUpload"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Eliminar seleccionado (id:{{selectedRow.id}})</button>
    </div>
  </div>
  <div v-if="!showUpload && visibleTable && !loading">
    <el-alert style="margin-bottom:20px;"
              v-if="rows.length > 0"
              title="Para editar las propiedades de la planta selecciona un registro."
              type="warning"
              show-icon>
    </el-alert>
    <div v-if="rows.length > 0">
      <ReactDataGrid :enableCellSelect="true"
                     :columns="columns"
                     key="windConfig"
                     @rowGetter="rowGetter"
                     :rowsCount="getCounter()"
                     @onRowClick="clickedRow"
                     :minHeight="500"
                     @onGridRowsUpdated="handleGridRowsUpdated"
                     ;></ReactDataGrid>
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
       v-if="!showUpload && !visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6"
         v-if="column.displayInForm">
      <div class="form-group required"
           v-if="column.type === 'text'">
        <label class="control-label">{{column.name}}</label>
        <input :disabled="true"
               v-model="selectedRow[column.key]"
               type="text"
               name="name"
               class="form-control"
               :placeholder="column.key">
      </div>
      <div class="form-group required"
           v-if="column.type === 'numeric'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <vue-numeric :disabled="true" class="form-control"
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
        <label class="control-label">{{column.name}}</label>
        <el-select :disabled="true" style="width:100%"
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
  <!-- UPLOAD -->
  <div v-if="showUpload"
       style="margin-top:100px;">
    <center>
      <el-upload class="upload-demo"
                 drag
                 :on-success="successUpload"
                 :action="uploadPath"
                 multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Suelta tu archivo aquí o <em>haz clic para cargar</em></div>
        <div slot="tip"
             class="el-upload__tip">Solo archivos excel</div>
      </el-upload>
      <hr>
      <button @click="showUpload = false"
              class="btn btn-outline-danger btn-lg">
        Cancelar subida</button>
    </center>
  </div>
  <el-dialog title="Seleccione configuración de viento"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">

      <el-alert
        title="Funcionalidad solo disponible en modo experimental."
        type="error">
      </el-alert>
        <hr>
        <div class="form-group required">
          <label class="control-label">Seleccione configuración a expandir</label>
          <el-select :disabled="true" style="width:100%"
                     v-model="selectedWinConfig">
            <el-option v-for="item in data.windConfig"
                       :key="item.id"
                       :label="item.planta"
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
          <el-select :disabled="true" clearable
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
    <el-button  @click="addRow()" :disabled="!selectedWinConfig && selectedWinConfigMonth" type="primary">Continuar</el-button>
  </span>
  </el-dialog>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* Nombre del componente */
  name: 'windExpansionCategory',
  /* Acción que se ejecuta al montar */
  mounted() {

    if (!this.$auth.check([
        'windExpansions'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.windConfig.length < 1) {
      this.$alert('No existen plantas, vas a ser redirigido al modulo de plantas eólicas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(12)
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
  /* Propiedades */
  props: [
    'data'
  ],
  /* Componentes usuados */
  components: {
    ReactDataGrid
  },
  /* Metodos publicos */
  methods: {
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
    onPropsChanged(newVal) {
      this.rows = _.clone(this.data.windConfigExpansion, true)

      if (this.rows.length < 1) {
        this.loading = false
      }

      _.each(this.rows, (v, k) => {
        v.windName = v.wind_config.planta
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
    update() {
      api.updateWindConfigExpansion(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            reference: 'windConfigExpansion',
            url: 'getWindExpansion'
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
    /* Mensaje en caso de que el archivo suba correctamente */
    successUpload(response) {
      this.rows = response
      this.rows.splice(0, 0)
      this.showUpload = false
      this.$message({
        message: 'Notificación: Importación realizada correctamente',
        type: 'success'
      })

    },
    /* 
     * Permite agregar un registro
    */
    addRow() {
      this.dialogCreateVisible = false
      this.selectedRow = null
      api.createWindConfigExpansion({
        wind_config_id: this.selectedWinConfig,
        planta: 0,
        horizont_id: this.selectedHorizont,
        capacity: 0,
        efficiency: 0,
        number_turbines: 0,
        forced_unavailability: 0,
        historic_unavailability: 0,
        losses: 0,
        process_id: this.$route.params.id
      }).then((r) => {
        var data = r.data
        this.$bus.emit('getModulesData', [
          {
            reference: 'windConfigExpansion',
            url: 'getWindExpansion'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteWindConfigExpansion(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true

        this.$bus.emit('getModulesData', [
          {
            reference: 'windConfigExpansion',
            url: 'getWindExpansion'
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
     * Permite descargar una matriz
    */
    download() {
      var ids = []
      ids.unshift([
        'ID',
        'name'
      ])

      api.donwloadExcelThermalConfig(this.$route.params.id).then((response) => {

        var a = document.createElement('a')
        a.href = response.data.file
        a.download = response.data.name
        document.body.appendChild(a)
        a.click()
        a.remove()

      })

    },
    /* 
     * Permite obtener un row especifico
    */
    rowGetter(i) {
      return this.rows[i]
    },
    /* 
     * Permite actualizar registros
    */
    handleGridRowsUpdated(data) {
      for (let i = data.fromRow; i <= data.toRow; i++) {
        let rowToUpdate = this.rows[i]
        let updatedRow = _.extend(rowToUpdate, data.updated)
        api.updateArea(updatedRow.id, updatedRow).then(() => {
          this.rows[i] = updatedRow
          this.$bus.emit('getModulesData', [
            {
              reference: 'windConfigExpansion',
              url: 'getWindExpansion'
            }
          ])
        }).catch((e) => {
          console.log(e)
        })
      }
    }
  },
  data() {
    return {
      selectedHorizont: null,
      dialogCreateVisible: false,
      selectedWinConfigMonth: null,
      selectedWinConfig: null,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/windConfig/importExcel/' + this.$route.params.id,
      showUpload: false, // determina si muestra el upload
      selectedRow: null, // determina si la fila esta seleccionada 
      rows: [], // filas
      columns: [],
      allColumns: [ // nombre de las columnas 
        {
          key: 'windName',
          originalForeign: 'wind_config_id',
          name: 'Nombre',
          type: 'select',
          entity: 'windConfig',
          resizable: true,
          display: true,
          displayInForm: false
        },
        {
          key: 'horizont_id',
          originalForeign: 'horizont_id',
          name: 'Modificación',
          type: 'select',
          keySelect: 'period',
          entity: 'horizonts',
          resizable: true,
          display: false,
          displayInForm: true
        },
        {
          key: 'modifcationFormatted',
          name: 'Modificación',
          resizable: true,
          type: 'month',
          display: true,
          displayInForm: false
        },
        {
          key: 'capacity',
          name: 'Capacidad',
          unit: 'MW',
          resizable: true,
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        },
        {
          key: 'efficiency',
          name: 'Eficiencia',
          unit: '%',
          resizable: true,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        },
        {
          key: 'number_turbines',
          name: 'Número de turbinas',
          resizable: true,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        },
        {
          key: 'losses',
          unit: '%',
          name: 'Pérdidas',
          resizable: true,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        },
        {
          key: 'forced_unavailability',
          name: 'Indisponibilidad forzada',
          unit: '%',
          resizable: true,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        },
        {
          key: 'historic_unavailability',
          name: 'Indisponibilidad historica',
          unit: '%',
          resizable: true,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          display: false,
          displayInForm: true
        }
      ]
    }
  }
}

</script>
