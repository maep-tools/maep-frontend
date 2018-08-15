<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="!showUpload && visibleTable"
              @click="addRow()"
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
                   key="thermalConfig"
                   @rowGetter="rowGetter"
                   :rowsCount="getCounter()"
                   @onRowClick="clickedRow"
                   :minHeight="500"></ReactDataGrid>
  </div>
  <div class="row"
       v-if="!showUpload && !visibleTable">
    <div v-for="column in allColumns"
         class="col-md-6">
      <div class="form-group required"
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
           v-if="column.type === 'select'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <el-select style="width:100%"
                   @change="changeSelect(column)"
                   v-model="selectedRow[column.originalForeign]">
          <el-option v-for="item in getSelectValues(column)"
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
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';

export default {
  /* Nombre del componente */
  name: 'lines',
  /* Acción que se ejecuta al montar */
  mounted() {

    if (!this.$auth.check([
        'lines'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.areas.length < 2) {
      this.$alert('Mínimo dos areas, vas a ser redirigido al modulo de áreas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(14)
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
    filterHiddenColumns() {
      return _.filter(this.allColumns, {
        display: true
      })
    },
    changeSelect(column) {
      if (column.originalForeign === 'b_final' || column.originalForeign === 'a_initial') {

        if (this.selectedRow.a_initial && this.selectedRow.b_final) {
          var a_initialExist = _.find(this.data.lines, {
            a_initial: this.selectedRow.a_initial,
            b_final: this.selectedRow.b_final
          })

          if (a_initialExist) {
            if (a_initialExist.id !== this.selectedRow.b_final) {
              console.log('entro 1')
              var a_initialExistInverted = _.find(this.data.lines, {
                a_initial: this.selectedRow.b_final,
                b_final: this.selectedRow.a_initial
              })
              console.log(a_initialExistInverted)
            }
          }

          if (a_initialExist) {
            if (a_initialExist.id !== this.selectedRow.id) {

              this.selectedRow.b_final = null
              this.selectedRow.a_initial = null

              this.$message({
                message: 'La linea ya esta registrada.',
                type: 'error'
              })
            }
          }

          if (a_initialExistInverted) {
            if (a_initialExistInverted.id !== this.selectedRow.id) {

              this.selectedRow.b_final = null
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
    onPropsChanged(newVal) {
      this.rows = _.clone(this.data.lines, true)
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
    },
    getSelectValues(column) {
      if (column.entity === 'horizonts') {
        var data = []
        _.each(this.data.horizonts, (v) => {
          data.push({
            id: v.id,
            name: this.formatMonthDate(v.period),
            period: this.formatMonthDate(v.period)
          })
        })
        return data
      } else if (column.entity === 'areas') {
        if (column.originalForeign === 'b_final') {
          var filtered = []
          this.data[column.entity].forEach((v) => {
            if (v.id !== this.selectedRow.a_initial) {
              filtered.push(v)
            }
          })

          return filtered

        }

        if (column.originalForeign === 'a_initial') {
          var filtered = []
          this.data[column.entity].forEach((v) => {
            if (v.id !== this.selectedRow.b_final) {
              filtered.push(v)
            }
          })

          return filtered

        } else {
          return this.data[column.entity]
        }
      }
    },
    getCounter() {
      return this.rows.length
    },
    update() {
      api.updateLines(this.selectedRow.id, this.selectedRow).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })

        this.$bus.emit('getModulesData', [
          {
            url: 'getLines',
            reference: 'lines'
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
      this.selectedRow = null
      api.createLines({
        a_initial: null,
        b_final: null,
        a_to_b: 0,
        b_to_a: 0,
        efficiency: 0,
        resistence: 0,
        reactance: 0,
        process_id: this.$route.params.id
      }).then((r) => {
        this.$bus.emit('getModulesData', [
          {
            url: 'getLines',
            reference: 'lines'
          }
        ])
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteLines(row.id).then(() => {
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
      lineName: '',
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
          key: 'area1',
          originalForeign: 'a_initial',
          name: 'Desde',
          type: 'select',
          entity: 'areas',
          resizable: true,
          display: true
        },
        {
          key: 'area2',
          originalForeign: 'b_final',
          name: 'Hacia',
          type: 'select',
          entity: 'areas',
          resizable: true,
          display: true
        },
        {
          key: 'efficiency',
          name: 'Eficiencia (max:1, min:0)',
          unit: '%',
          max:1,
          min:0,
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'a_to_b',
          name: 'Capacidad desde-hacia',
          unit: 'MW',
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'b_to_a',
          name: 'Capacidad hacia-desde',
          unit: 'MW',
          width: 80,
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'resistence',
          name: 'Resistencia',
          unit: 'Ohm',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'reactance',
          name: 'Reactancia',
          unit: 'X',
          type: 'numeric',
          resizable: true,
          display: false
        }
      ]
    }
  }
}

</script>
