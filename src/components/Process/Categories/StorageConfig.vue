<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre de el sistema de almacenamiento</label>
        <div class="form-group">
          <input v-model="storageConfigName"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Ingrese el sistema de almacenamiento">
        </div>
      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
    <el-button @click="dialogCreateVisible = false">Cancelar</el-button>
    <el-button  @click="addRow()" :disabled="!storageConfigName" type="primary">Continuar</el-button>
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
    </div>
  </div>
  <div v-if="!showUpload && visibleTable && !loading">
    <el-alert style="margin-bottom:20px;"
              title="Para editar las propiedades de la planta selecciona un registro."
              type="warning"
              show-icon>
    </el-alert>
    <ReactDataGrid :enableCellSelect="true"
                   :columns="columns"
                   key="storageConfig"
                   @rowGetter="rowGetter"
                   :rowsCount="getCounter()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   ></ReactDataGrid>
  </div>

  <div class="row">

    <div class="col-md-12"
         v-if="selectedRow && !visibleTable">

      <el-alert v-if="selectedRow.min_storage > selectedRow.max_storage"
                style="margin-bottom:10px;"
                title="El almacenamiento mínimo debe de ser menor al almacenamiento máximo."
                type="warning">
      </el-alert>


      <el-alert v-if="selectedRow.initial_storage < selectedRow.min_storage"
                style="margin-bottom:10px;"
                title="El almacenamiento inicial debe de ser mayor o igual al almacenamiento mínimo."
                type="warning">
      </el-alert>

      <el-alert v-if="selectedRow.initial_storage > selectedRow.max_storage"
                style="margin-bottom:10px;"
                title="El almacenamiento inicial debe de ser menor o igual al almacenamiento máximo."
                type="warning">
      </el-alert>



    </div>
  </div>



  <div class="row"
       v-if="!showUpload && !visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6">
      <div class="form-group"
           v-if="column.type === 'numeric'">
        <label class="control-label">{{column.name}}           <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag></label>
        <vue-numeric :max="column.max" :min="column.min" class="form-control"
                     :precision="column.precision"
                     :decimal-separator="column.decimalSeparator"
                     :thousand-separator="column.thousandSeparator"
                     v-model="selectedRow[column.key]"></vue-numeric>
      </div>
      <div class="form-group"
           v-if="column.type === 'text'">
        <label class="control-label">{{column.name}}           <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag></label>
        <input :disabled="isDisabledField(column.key)"
               v-model="selectedRow[column.key]"
               type="text"
               name="name"
               class="form-control"
               :placeholder="column.key">
      </div>
      <div class="form-group"
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
      <div class="form-group"
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
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* Nombre del componente */
  name: 'storageConfig',
  /* Acción que se ejecuta al montar */
  mounted() {

    if (!this.$auth.check([
        'storageConfigs'
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
    'data'
  ],
  /* Componentes usuados */
  components: {
    ReactDataGrid
  },
  /* Metodos publicos */
  methods: {
    getLabelSelect (column, item) {
      if(column.key === "entrance_stage") {
        return item.description
      } else if (column.key === "initial_storage_stage") {
        return this.formatMonthDate(item.period)
      } else {
        return item[column.keyName]
      }
    },
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
    },
    filterHiddenColumns() {
      return _.filter(this.allColumns, {
        display: true
      })
    },
    onPropsChanged(newVal) {
      this.rows = _.clone(this.data.storageConfig, true)

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
      api.updateStorageConfig(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            url: 'getStorageConfig',
            reference: 'storageConfig'
          }
        ])
        this.selectedRow = null
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
      api.createStorageConfig({
        name: this.storageConfigName,
        area_id: this.data.areas[0].id,
        entrance_stage_id: this.data.entranceStages[0].id,
        min_storage: 0,
        max_storage: 0,
        capacity: 0,
        process_id: this.$route.params.id,
        efficiency: 0,
        max_outflow: 0,
        portfolio: 'SIN PORTAFOLIO',
        power_rate: 0,
        linked: 0,
        initial_storage: 0,
        forced_unavailability: 0,
        historic_unavailability: 0

      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getStorageConfig',
            reference: 'storageConfig'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteStorageConfig(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true
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
      storageConfigName: '',
      dialogCreateVisible: false,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/thermalConfig/importExcel/' + this.$route.params.id,
      showUpload: false, // determina si muestra el upload
      selectedRow: null, // determina si la fila esta seleccionada 
      rows: [], // filas
      columns: [],
      allColumns: [ // nombre de las columnas 
        {
          key: 'name',
          name: 'Nombre',
          width: 200,
          type: 'text',
          resizable: true,
          display: true
        },
        {
          key: 'area',
          keyName: 'name',
          originalForeign: 'area_id',
          name: 'Area',
          type: 'select',
          entity: 'areas',
          resizable: true,
          display: true
        },
        {
          key: 'min_storage',
          name: 'Almacenamiento mínimo (min:0, max:1)',
          unit: 'pu',
          min:0,
          max:1,
          width: 80,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'max_storage',
          name: 'Almacenamiento máximo (min:0, max:1)',
          unit: 'pu',
          min:0,
          max:1,
          width: 80,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'capacity',
          name: 'Capacidad',
          unit: 'MWh',
          width: 80,
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'efficiency',
          name: 'Eficiencia',
          unit: '%',
          width: 80,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'max_outflow',
          name: 'Descarga máxima',
          unit: 'MWh/s',
          width: 80,
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'portfolio',
          name: 'Portafolio',
          width: 80,
          type: 'text',
          resizable: true,
          display: false
        },
        {
          key: 'power_rate',
          name: 'Potencia',
          unit: 'MW',
          width: 80,
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'linked',
          name: 'Enlace',
          width: 80,
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'initial_storage',
          name: 'Almacenamiento inicial (max:1, min:0)',
          unit: 'pu',
          width: 80,
          precision: 6,
          max:1,
          min:0,
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
          key: 'entrance_stage',
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
