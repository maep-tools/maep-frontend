<template>
<div element-loading-text="Tienes que esperar un poco..."
     v-loading="loading">
  <!-- MENU DE COMPONENTE -->
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre de planta</label>
        <div class="form-group required">
          <input v-model="thermalConfigName"
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
    <el-button  @click="addRow()" :disabled="!thermalConfigName" type="primary">Continuar</el-button>
  </span>
  </el-dialog>
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="visibleTable"
              @click="dialogCreateVisible = true"
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
                   :minHeight="500"
                   @onGridRowsUpdated="handleGridRowsUpdated"></ReactDataGrid>
  </div>


  <div class="row">

      <div class="col-md-12" v-if="selectedRow && !visibleTable">
          <el-alert
              v-if="selectedRow.gen_min > selectedRow.gen_max"
               style="margin-bottom:10px;"
               title="La generación mínima de la planta térmica no puede ser mayor a la generación máxima."
               type="warning">
          </el-alert>


          <el-alert
              v-if="selectedRow.gen_max > selectedRow.capacity"
               style="margin-bottom:10px;"
               title="La generación máxima de no puede ser superior a la capacidad."
               type="warning">
          </el-alert>
      </div>
  </div>


  <div class="row"
       v-if="!visibleTable">
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
               placeholder="Ingrese valor">
      </div>
      <div class="form-group required"
           v-if="column.type === 'numeric'">
        <label class="control-label">{{column.name}}
          <el-tag v-if="column.unit"
                  type="primary"
                  size="small">{{column.unit}}</el-tag>
        </label>
        <vue-numeric class="form-control"
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
      <button @click="cancelForm()"
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
  name: 'ThermalConfig',
  mounted() {
    if (!this.$auth.check([
        'thermalConfigs'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }

    if (this.data.areas.length < 1) {
      this.$alert('No hay áreas, vas a ser redirigido al modulo de áreas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(14)
        return
      })
    }

    if (this.data.fuels.length < 1) {
      this.$alert('No puedes acceder a esta entidad porque no hay combustibles creados. Vas a ser redirigido al modulo de combustibles.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(17)
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
    getDataSelect (column) {
      if (column.key === "typeName") {
        return this.data[column.entity].filter((v) => {
          return (v.name === "Gas" || v.name === "Coal" || v.name === "Liquids" || v.name === "Cogeneration" || v.name === "Geothermal")
        })
      } else {
        return this.data[column.entity]
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
      this.rows = _.clone(this.data.thermalConfig, true)

      if (newVal) {
        this.rows = newVal.thermalConfig
        console.log(this.rows)
      }

      if (this.rows.length < 1) {
        this.loading = false
      }

      _.each(this.rows, (v, k) => {
        v.area = v.areas.name
        v.entrance_stage = v.entrance_stages.name
        v.typeName = v.type.name
        v.fuelName = v.fuel.name
        if (k === this.rows.length - 1) {
          setTimeout(() => {
            this.loading = false
          }, 2000)
        }
      })
    },
    cancelForm () {
        this.visibleTable = true;
        this.selectedRow = null
    },
    getCounter() {
      return this.rows.length
    },
    update() {
      api.updateThermalConfig(this.selectedRow.id, this.selectedRow).then(() => {
        this.selectedRow = null
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
        this.$bus.emit('getModulesData', [
          {
            reference: 'thermalConfig',
            url: 'getThermalConfig'
          },
          {
            url: 'getThermalConfigExpansion',
            reference: 'thermalConfigExpansion'
          }
        ])
        this.visibleTable = true
      })
    },
    getLabelSelect(column, item) {
      if (column.key === 'entrance_stage') {
        return item.description
      } else {
        return item.name
      }
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
      api.createThermalConfig({
        name: this.thermalConfigName,
        capacity: 0,
        entrance_stage_id: this.data.entranceStages[0].id,
        process_id: this.$route.params.id,
        type_id: this.data.types[0].id,
        planta_fuel_id: this.data.fuels[0].id,
        area_id: this.data.areas[0].id,
        gen_min: 0,
        gen_max: 0,
        heat_rate: 0,
        entrance_stage_date: null,
        forced_unavailability: 0,
        historic_unavailability: 0,
        'O&MVariable': 0,
        MBTU_MWh: 0,
        emision: 0,
        process_id: this.$route.params.id
      }).then((r) => {
        console.log(r)
        var data = r.data
        data.area = this.data.areas[0].name
        this.rows.push(data)
        this.$bus.emit('getModulesData', [
          {
            reference: 'thermalConfig',
            url: 'getThermalConfig'
          },
          {
            url: 'getThermalConfigExpansion',
            reference: 'thermalConfigExpansion'
          }
        ])
      }).catch((r) => {
        console.log('error', r)
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteThermalConfig(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.visibleTable = true

        this.$bus.emit('getModulesData', [
          {
            reference: 'thermalConfig',
            url: 'getThermalConfig'
          },
          {
            url: 'getThermalConfigExpansion',
            reference: 'thermalConfigExpansion'
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
              reference: 'thermalConfig',
              url: 'getThermalConfig'
            },
            {
              url: 'getThermalConfigExpansion',
              reference: 'thermalConfigExpansion'
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
      dialogCreateVisible: false,
      thermalConfigName: '',
      loading: true,
      visibleTable: true,
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/thermalConfig/importExcel/' + this.$route.params.id,
      selectedRow: null,
      rows: [],
      columns: [],
      allColumns: [
        {
          key: 'name',
          name: 'Planta',
          width: 200,
          type: 'text',
          resizable: true,
          display: true
        },
        {
          key: 'area',
          originalForeign: 'area_id',
          name: 'Área',
          type: 'select',
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
          key: 'typeName',
          originalForeign: 'type_id',
          name: 'Tipo',
          entity: 'types',
          type: 'select',
          resizable: true,
          display: false
        },
        {
          key: 'fuelName',
          name: 'Combustible',
          originalForeign: 'planta_fuel_id',
          width: 80,
          type: 'select',
          entity: 'fuels',
          resizable: true,
          display: false
        },
        {
          key: 'gen_min',
          name: 'Generación mínima',
          width: 80,
          precision: 5,
          unit: 'MW',
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'gen_max',
          name: 'Generación máxima',
          width: 80,
          unit: 'MW',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          type: 'numeric',
          resizable: true,
          display: false
        },
        {
          key: 'forced_unavailability',
          name: 'Indisponibilidad forzada',
          type: 'numeric',
          precision: 6,
          unit: '%',
          decimalSeparator: '.',
          thousandSeparator: ',',
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
          key: 'O&MVariable',
          name: 'Costo variable',
          type: 'numeric',
          unit: '$/MWh',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          resizable: true,
          display: false
        },
        {
          key: 'heat_rate',
          name: 'Heat rate',
          unit: 'MBTU/MWh',
          type: 'numeric',
          precision: 5,
          decimalSeparator: '.',
          thousandSeparator: ',',
          resizable: true,
          display: false
        },
        {
          key: 'emision',
          name: 'Factor de emisiones',
          precision: 2,
          unit: 'Ton/MBTU',
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
