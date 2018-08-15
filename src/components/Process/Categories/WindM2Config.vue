<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre de la planta</label>
        <div class="form-group">
          <input v-model="windM2ConfigName"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Ingrese el nombre">
        </div>
      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
    <el-button @click="dialogCreateVisible = false">Cancelar</el-button>
    <el-button  @click="addRow()" :disabled="!windM2ConfigName" type="primary">Continuar</el-button>
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
  <div v-if="visibleTable && !loading">
    <el-alert style="margin-bottom:20px;"
              v-if="rows.length > 0"
              title="Para editar las propiedades de la planta selecciona un registro."
              type="warning"
              show-icon>
    </el-alert>
    <ReactDataGrid :enableCellSelect="true"
                   :columns="columns"
                   key="windM2Config"
                   @rowGetter="rowGetter"
                   :rowsCount="getCounter()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   @onGridRowsUpdated="handleGridRowsUpdated"
                   ;></ReactDataGrid>
  </div>


  <div class="row">

    <div class="col-md-12"
         v-if="selectedRow && !visibleTable">

      <el-alert v-if="selectedRow.wSpeed_min > selectedRow.wSpeed_max"
                style="margin-bottom:10px;"
                title="La velocidad mínima debe de ser menor a la velocidad máxima"
                type="warning">
      </el-alert>
    </div>
  </div>

  <div class="row"
       v-if="!showUpload && !visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6">
      <div class="form-group"
           v-if="column.type === 'text'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <input :disabled="isDisabledField(column.key)"
               v-model="selectedRow[column.key]"
               type="text"
               name="name"
               class="form-control"
               :placeholder="column.key">
      </div>
      <div class="form-group"
           v-if="column.type === 'numeric'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <vue-numeric :max="column.max" :min="column.min" class="form-control"
                     :precision="column.precision"
                     :decimal-separator="column.decimalSeparator"
                     :thousand-separator="column.thousandSeparator"
                     v-model="selectedRow[column.key]"></vue-numeric>
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
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* Nombre del componente */
  name: 'windM2Config',
  /* Acción que se ejecuta al montar */
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
        return item[column.keySelect]
      }
    },
    filterHiddenColumns() {
      return _.filter(this.allColumns, {
        display: true
      })
    },
    onPropsChanged(newVal) {
      this.rows = _.clone(this.data.windM2Config, true)

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
      api.updateWindM2Config(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindM2Config',
            reference: 'windM2Config'
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
      api.createWindM2Config({
        nombre_planta: this.windM2ConfigName,
        speed_resolution: 0,
        capacity: 0,
        losses: 0,
        process_id: this.$route.params.id,
        area_id: this.data.areas[0].id,
        entrance_stage_id: this.data.entranceStages[0].id,
        wSpeed_min: 0,
        wSpeed_max: 0,
        speed_resolution: 0,
        measuring_height: 0,
        hub_height: 0,
        adjustment: 0,
        density: 0,
        distance: 0,
        diameter: 0,
        area: 0,
        speedDataMinutes: 0,
        efficiency: 0
      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getWindM2Config',
            reference: 'windM2Config'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteWindM2Config(row.id).then(() => {
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
    formatMonthDate(month) {
      var dateObj = new Date(month)
      var month = dateObj.getUTCMonth() + 1 // months from 1-12
      var day = dateObj.getUTCDate()
      var year = dateObj.getUTCFullYear()

      return year + '/' + month
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
              url: 'getWindM2Config',
              reference: 'windM2Config'
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
      windM2ConfigName: '',
      dialogCreateVisible: false,
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/windM2Config/importExcel/' + this.$route.params.id,
      showUpload: false, // determina si muestra el upload
      selectedRow: null, // determina si la fila esta seleccionada 
      rows: [], // filas
      columns: [],
      allColumns: [ // nombre de las columnas 
        {
          key: 'nombre_planta',
          name: 'Nombre',
          width: 200,
          type: 'text',
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
          name: 'Perdidas: (min:0 max:1)',
          unit: '%',
          precision: 6,
          max:1,
          min: 0,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'wSpeed_min',
          name: 'Velocidad mínima',
          unit: 'm/s',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'wSpeed_max',
          name: 'Velocidad máxima',
          unit: 'm/s',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'speed_resolution',
          name: 'Resolución de medida',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'measuring_height',
          name: 'Measuring height',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'hub_height',
          name: 'hub height',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'adjustment',
          name: 'Ajuste',
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
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'distance',
          name: 'Distancia',
          unit: 'm',
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
          precision: 6,
          unit: 'm',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
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
          key: 'speedDataMinutes',
          name: 'Velodidad corto plazo',
          precision: 6,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'text',
          disabled: true,
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
