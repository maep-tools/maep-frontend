<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre de la planta</label>
        <div class="form-group required">
          <input v-model="windConfigName"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Ingrese el nombre de la planta">
        </div>
      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
    <el-button @click="dialogCreateVisible = false">Cancelar</el-button>
    <el-button  @click="addRow()" :disabled="!windConfigName" type="primary">Continuar</el-button>
  </span>
  </el-dialog>


  <el-dialog
    v-if="selectedRow"
    title="Agregar series eólicas"
    :visible.sync="dialogVisibleSeries"
    width="30%">
    <div v-if="!selectedRow.uploaded_series">
      <center>
        <el-upload style="width:100%;"
                 class="upload-demo"
                 drag
                 :on-change="changeUploadWind"
                 :action="getActionWind()">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Suelta tu archivo aquí o <em>haz clic para cargar</em></div>
        <div slot="tip"
             class="el-upload__tip">Puedes descargar un archivo de excel de prueba haciendo click <a href="/static/template_series.csv">aquí</a></div>
      </el-upload>


    </center>
  </div>
    <div v-else>
        <center>
        <h4>Ya se han introducido series en esta planta</h4>
        <button @click="selectedRow.uploaded_series = null" class="btn btn-primary">Volver a subir</button>
      </center>
    </div>



    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisibleSeries = false">Cancelar</el-button>
    </span>
  </el-dialog>



  <!-- MENU DE COMPONENTE -->
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="!showUpload && visibleTable"
              @click="dialogCreateVisible = true"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow(selectedRow)"
              v-if="selectedRow && !showUpload"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Eliminar seleccionado (id:{{selectedRow.id}})</button>
      <button v-if="selectedRow && !visibleTable && infoData.form.generate_wind" @click="addEolicSeries()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar series eólicas</button>
    </div>
  </div>
  <div v-if="!showUpload && visibleTable && !loading">
    <el-alert style="margin-bottom:20px;"
              v-if="rows.length > 0"
              title="Para editar las propiedades de la planta selecciona un registro."
              type="warning"
              show-icon>
    </el-alert>
    <ReactDataGrid :enableCellSelect="true"
                   :columns="columns"
                   key="windConfig"
                   @rowGetter="rowGetter"
                   :rowsCount="getCounter()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   ;></ReactDataGrid>
  </div>
  <div class="row">

    <div class="col-md-12"
         v-if="selectedRow && !visibleTable">

      <el-alert v-if="selectedRow.speed_in > selectedRow.speed_rated"
                style="margin-bottom:10px;"
                title="La velocidad de entrada debe de ser menor a la velocidad nominal"
                type="warning">
      </el-alert>
      <el-alert v-if="selectedRow.speed_out > selectedRow.speed_rated"
                style="margin-bottom:10px;"
                title="La velocidad de salida no puede ser mayor a velocidad nominal"
                type="warning">
      </el-alert>
    </div>
  </div>


    <div class="ui message yellow row" v-if="infoData.form.generate_wind && !visibleTable">
      <div class="col-md-12">
          <h3>Información generación (generación de datos)</h3>
      </div>
      <div style="margin-top: 20px;" class="col-md-6">
      <div class="form-group required">
        <label class="control-label">Potencia instalada
          <el-tag 
                  size="small"
                  type="primary">MW</el-tag>
        </label>
        <vue-numeric class="form-control"
                     :max="100"
                     :min="0"
                     :precision="5"
                     decimal-separator=","
                     thousand-separator="."
                     v-model="selectedRow.p_instalada"></vue-numeric>
      </div>
    </div>
    <div  style="margin-top: 20px;" class="col-md-6">

      <div class="form-group required">
        <label class="control-label">Factor de planta
          <el-tag 
                  size="small"
                  type="primary">%</el-tag>
        </label>
        <vue-numeric class="form-control"
                     :max="100"
                     :min="0"
                     :precision="5"
                     decimal-separator=","
                     thousand-separator="."
                     v-model="selectedRow.fp"></vue-numeric>
      </div>
    </div>

    </div>


  <div class="row"
       v-if="!showUpload && !visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6">
      <div class="form-group required"
           v-if="column.type === 'text'">
        <label class="control-label">{{column.name}}</label>
        <input :disabled="isDisabledField(column.key)"
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
        <vue-numeric class="form-control"
                     :min="column.min"
                     :max="column.max"
                     :precision="column.precision"
                     :decimal-separator="column.decimalSeparator"
                     :thousand-separator="column.thousandSeparator"
                     v-model="selectedRow[column.key]"></vue-numeric>
      </div>
      <div class="form-group required"
           v-if="column.type === 'select'">
        <label class="control-label">{{column.name}}</label>
        <el-select style="width:100%"
                   v-model="selectedRow[column.originalForeign]">
          <el-option v-for="item in data[column.entity]"
                     :key="item.id"
                     :label="getLabelSelect(column, item)"
                     :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="form-group required"
           v-if="selectedRow.entrance_stage_id === 3 && column.key === 'entrance_stage'">
        <label class="control-label">Ingrese fecha de entrada</label>
        <el-select style="width:100%"
                   v-model="selectedRow['entrance_stage_date']">
          <el-option v-for="item in data['horizonts']"
                     :key="item.id"
                     :label="formatMonthDate(item.period)"
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
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  name: 'windowConfigCategory',
  mounted() {

    if (!this.$auth.check([
        'windConfigs'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.areas.length < 1) {
      this.$alert('No existen áreas, vas a ser redirigido al modulo de áreas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(14)
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
    'infoData',
    'data'
  ],
  /* Componentes usuados */
  components: {
    ReactDataGrid
  },
  /* Metodos publicos */
  methods: {
    addEolicSeries() {
      this.dialogVisibleSeries = true
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
            period: this.formatMonthDate(v.period)
          })
        })
        return data
      } else {
        return this.data[entity]
      }
    },
    filterHiddenColumns() {
      return _.filter(this.allColumns, {
        display: true
      })
    },
    onPropsChanged(newVal) {
      this.rows = _.clone(this.data.windConfig, true)

      if (this.rows.length < 1) {
        this.loading = false
      }

      _.each(this.rows, (v, k) => {
        v.area = v.areas.name
        v.entrance_stage = v.entrance_stages.name
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
      console.log(this.selectedRow)
      api.updateWindConfig(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindConfig',
            reference: 'windConfig'
          },
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
    getActionWind () {
      return window.pathBase + ':' + window.portBaseLaravel + '/api/v1/uploadWind/' + this.selectedRow.id
    },
    changeUploadWind () {
      if (this.dialogVisibleSeries) {
        this.$notify({
          title: 'Exitoso',
          message: 'El archivo ha sido cargado.',
          type: 'success'
        });

        this.dialogVisibleSeries = false
        this.selectedRow.uploaded_series = 1
      }
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
    getLabelSelect(column, item) {
      if (column.key === 'entrance_stage') {
        return item.description
      } else if (column.key === 'initial_storage_stage') {
        return this.formatMonthDate(item.period)
      } else {
        return item[column.keySelect]
      }
    },
    /* 
     * Permite agregar un registro
    */
    addRow() {
      this.dialogCreateVisible = false
      this.selectedRow = null
      api.createWindConfig({
        planta: this.windConfigName,
        capacity: 0,
        losses: 0,
        density: 0,
        fp: 0,
        p_instalada: 0,
        efficiency: 0,
        diameter: 0,
        speed_rated: 0,
        entrance_stage_id: this.data.entranceStages[0].id,
        area_id: this.data.areas[0].id,
        forced_unavailability: 0,
        variability: 0,
        historic_unavailability: 0,
        process_id: this.$route.params.id,
        speed_in: 0,
        speed_out: 0,
        betz_limit: 0
      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindConfig',
            reference: 'windConfig'
          },
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
      api.deleteWinConfig(row.id).then((r) => {
        if (!_.isNil(r.response)) {
          if (r.response.status === 500) {
            this.$message({
              message: 'El registro no se puede eliminar porque se esta usando en otras dependencias de plantas eólicas.',
              type: 'error'
            })
            return
          }
        }

        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindConfig',
            reference: 'windConfig'
          },
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
        this.selectedRow = this.rows[row]
        this.visibleTable = false
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
      dialogVisibleSeries: false,
      windConfigName: '',
      dialogCreateVisible: false,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/windConfig/importExcel/' + this.$route.params.id,
      showUpload: false, // determina si muestra el upload
      selectedRow: null, // determina si la fila esta seleccionada 
      rows: [], // filas
      columns: [],
      allColumns: [ // nombre de las columnas 
        {
          key: 'planta',
          name: 'Nombre',
          width: 200,
          type: 'text',
          resizable: true,
          display: true
        },
        {
          key: 'area',
          originalForeign: 'area_id',
          name: 'Area',
          type: 'select',
          keySelect: 'name',
          entity: 'areas',
          resizable: true,
          display: true
        },
        {
          key: 'capacity',
          name: 'Capacidad',
          unit: 'MW',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'losses',
          name: 'Perdidas (%) max: 1, min: 0',
          max: 1,
          min: 0,
          unit: '%',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'density',
          name: 'Densidad',
          unit: 'Kg/m3',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'efficiency',
          name: 'Eficiencia % Max: 1, Min: 0',
          unit: '%',
          max: 1,
          min: 1,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'diameter',
          name: 'Diametro',
          unit: 'm',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'speed_rated',
          name: 'Velocidad nominal',
          precision: 5,
          unit: 'm/s',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'initial_storage_stage',
          originalForeign: 'initial_storage_stage',
          name: 'Fecha inicial de almacenamiento',
          type: 'select',
          keySelect: 'period',
          entity: 'horizonts',
          resizable: true,
          display: false
        },
        {
          key: 'forced_unavailability',
          name: 'Indisponibilidad forzada',
          precision: 6,
          unit: '%',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'variability',
          name: 'Variabilidad min:0, max:100',
          precision: 5,
          unit: '%',
          max: 100,
          min: 0,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'speed_in',
          name: 'Velocidad de entrada',
          unit: 'm/s',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'speed_out',
          name: 'Velocidad de salida',
          unit: 'm/s',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'betz_limit',
          name: 'Limite de Betz min: 0, max: 1',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          min: 0,
          max: 1,
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'entrance_stage',
          keySelect: 'name',
          type: 'select',
          originalForeign: 'entrance_stage_id',
          entity: 'entranceStages',
          name: 'Etapa de entrada',
          resizable: true,
          display: false
        }
      ]
    }
  }
}

</script>
