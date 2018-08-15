<template>
<div
element-loading-spinner="el-icon-loading" 
    element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre de la planta</label>
        <div class="form-group required">
          <input v-model="hydroConfigName"
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
    <el-button  @click="addRow()" :disabled="!hydroConfigName" type="primary">Continuar</el-button>
  </span>
  </el-dialog>

  <el-dialog
    v-if="selectedRow"
    title="Agregar series hídricas"
    :visible.sync="dialogVisibleSeries"
    width="30%">
    <div v-if="!selectedRow.uploaded_series">
      <center>
        <el-upload style="width:100%;"
                 class="upload-demo"
                 drag
                 :on-change="changeUploadHidric"
                 :action="getActionHidric()">
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
      <el-button @click="dialogVisibleSeries = false">Cerrar</el-button>
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

      <button v-if="!visibleTable && selectedRow && infoData.form.generate_wind"
              @click="addHidricSeries()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar series hidricas</button>


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
    <ReactDataGrid :enableCellSelect="true"
                   :columns="columns"
                   key="hydroConfig"
                   @rowGetter="rowGetter"
                   :rowsCount="getCounter()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   ;></ReactDataGrid>
  </div>

  <div class="row">
      <div class="col-md-12" v-if="selectedRow && !visibleTable">
          <el-alert
              v-if="selectedRow.min_storage > 1"
               style="margin-bottom:10px;"
               title="Almacenamiento mínimo no puede ser mayor que almacenamiento máximo."
               type="warning">
          </el-alert>


          <el-alert
              v-if="selectedRow.gen_max > selectedRow.max"
               style="margin-bottom:10px;"
               title="Almacenamiento inicial debe de estar entre cero y 1."
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
                  size="small"
                  type="primary">{{column.unit}}</el-tag>
        </label>
        <vue-numeric class="form-control"
                     :max="column.max"
                     :min="column.min"
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
          <el-option v-for="item in getDataSelect(column)"
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
      <button @click="cancel()"
              class="btn btn-dark float-right">
        <i class="icon cancel"></i>Cancelar </button>
      <button style="margin-right:10px;"
              @click="update"
              class="btn btn-primary float-right">
        <i class="icon save"></i>Actualizar
      </button>
    </div>
  </div>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* Nombre del componente */
  name: 'hydroConfig',
  /* Acción que se ejecuta al montar */
  mounted() {

    if (!this.$auth.check([
        'hydroConfigs'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    this.columns = this.filterHiddenColumns()
    this.onPropsChanged()

    if (this.data.areas.length < 1) {
      this.$alert('No hay áreas, vas a ser redirigido al modulo de áreas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(14)
      })
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
    'data',
    'infoData'
  ],
  /* Componentes usuados */
  components: {
    ReactDataGrid
  },
  /* Metodos publicos */
  methods: {
    addHidricSeries() {
      this.dialogVisibleSeries = true
    },
    getDataSelect (column) {
      if (column.key === "typeName") {
        return this.data[column.entity].filter((v) => {
          return (v.name === "Hydro" || v.name === "Small")
        })
      } else {
        return this.data[column.entity]
      }
    },
    getLabelSelect (column, item) {
      if(column.key === "entrance_stage") {
        return item.description
      } else if (column.key === "initial_storage_stage") {
        return this.formatMonthDate(item.period)
      } else {
        return item[column.keySelect]
      }
    },
    cancel () {
      this.visibleTable = true
      this.selectedRow = null
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    getSelectValues(entity) {
      if (entity === 'hydroConfig') {
        return _.filter(this.data[entity], (v) => {
          return (v.planta !== this.selectedRow.planta)
        })
      } else if (entity === 'horizonts') {
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
      this.rows = _.clone(this.data.hydroConfig, true)

      if (this.rows.length < 1) {
        this.loading = false
      }

      _.each(this.rows, (v, k) => {
        v.area = v.areas.name
        v.entrance_stage = v.entrance_stages.name
        v.typeName = v.type.name
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
      api.updateHydroConfig(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            url: 'getHydroConfig',
            reference: 'hydroConfig'
          },
          {
            url: 'getHydroExpansion',
            reference: 'hydroExpansion'
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
      api.createHydroConfig({
        planta: this.hydroConfigName,
        emision: 0,
        initial_storage: 0,        
        min_storage: 0,
        max_storage: 0,
        capacity: 10,
        prod_coefficient: 0,
        max_turbining_outflow: 0,
        entrance_stage_id: this.data.entranceStages[0].id,
        initial_storage_stage: this.data.horizonts[0].id,
        'O&M': 0,
        t_downstream_id: null,
        s_downstream_id: null,
        area_id: this.data.areas[0].id,
        type_id: this.data.types[0].id,
        process_id: this.$route.params.id,
        forced_unavailability: 0,
        historic_unavailability: 0,
        process_id: this.$route.params.id
      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getHydroConfig',
            reference: 'hydroConfig'
          },
          {
            url: 'getHydroExpansion',
            reference: 'hydroExpansion'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteHydroConfig(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true
        this.$bus.emit('getModulesData', [
          {
            url: 'getHydroConfig',
            reference: 'hydroConfig'
          },
          {
            url: 'getHydroExpansion',
            reference: 'hydroExpansion'
          }
        ])
        this.$message({
          message: 'El registro se ha eliminado',
          type: 'success'
        })

      })
    },
    getActionHidric () {
      return window.pathBase + ':' + window.portBaseLaravel + '/api/v1/uploadHidric/' + this.selectedRow.id
    },
    changeUploadHidric () {

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
        console.log(this.selectedRow)
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
      hydroConfigName: '',
      dialogCreateVisible: false,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/hydroConfig/importExcel/' + this.$route.params.id,
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
          key: 'prod_coefficient',
          name: 'Coeficiente de producción',
          precision: 6,
          unit: 'MW/m3/s',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'max_turbining_outflow',
          name: 'Turbinamiento máximo de salida',
          type: 'numeric',
          precision: 5,
          unit: 'm3/s',
          decimalSeparator: '.',
          thousandSeparator: ',',
          resizable: true,
          display: false
        },
        {
          key: 'initial_storage',
          name: 'Almacenamiento inicial',
          precision: 5,
          max: 1,
          min: 0,
          unit: 'Hm3',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'initial_storage_stage',
          originalForeign: 'initial_storage_stage',
          name: 'Etapa inicial de llenado',
          type: 'select',
          keySelect: 'period',
          entity: 'horizonts',
          resizable: true,
          display: false
        },
        {
          key: 'O&M',
          name: 'Costos variables',
          precision: 6,
          unit: '$/MWh',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'planta',
          type: 'select',
          name: 'Turbinamiento aguas abajo',
          originalForeign: 't_downstream_id',
          entity: 'hydroConfig',
          keySelect: 'planta',
          resizable: true,
          display: false
        },
        {
          key: 'planta',
          type: 'select',
          name: 'Derramamiento aguas abajo',
          originalForeign: 's_downstream_id',
          entity: 'hydroConfig',
          keySelect: 'planta',
          resizable: true,
          display: false
        },
        {
          key: 'typeName',
          originalForeign: 'type_id',
          name: 'Tipo',
          keySelect: 'name',
          entity: 'types',
          type: 'select',
          resizable: true,
          display: false
        },
        {
          key: 'min_storage',
          name: 'Almacenamiento mínimo',
          width: 80,
          unit: 'Hm3',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'max_storage',
          name: 'Almacenamiento máximo',
          width: 80,
          unit: 'Hm3',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
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
          key: 'historic_unavailability',
          name: 'Indisponibilidad historica',
          precision: 6,
          unit: '%',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'emision',
          name: 'Factor de emisiones',
          precision: 2,
          unit: 'Ton/MWh',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'fp',
          name: 'Factor de planta',
          precision: 3,
          unit: '%',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'wind',
          resizable: true,
          display: false
        },
        {
          key: 'p_instalada',
          name: 'Potencia instalada',
          precision: 2,
          unit: 'MW',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'wind',
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
