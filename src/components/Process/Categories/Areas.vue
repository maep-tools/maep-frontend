<template>
<div>
  <el-dialog title="Nuevo"
             :visible.sync="dialogCreateVisible"
             width="30%">
    <div class="row">
      <div class="col-md-12">
        <label class="control-label">Nombre del área</label>
        <div class="form-group required">
          <input v-model="nameArea"
                 type="text"
                 name="name"
                 class="form-control"
                 placeholder="Ingrese el nombre del área">
        </div>
      </div>
    </div <span
            slot="footer"
            class="dialog-footer">
    <el-button @click="dialogCreateVisible = false">Cancelar</el-button>
    <el-button @click="addRow()"
               :disabled="!nameArea"
               type="primary">Continuar</el-button>
    </span>
  </el-dialog>
  <!-- MENU DE COMPONENTE -->
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button v-if="!showUpload"
              @click="openModal"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow(selectedRow)"
              v-if="selectedRow && !showUpload"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Eliminar seleccionado (id:{{selectedRow.id}})</button>
    </div>
  </div>
  <div v-if="this.rows.length">
    <ReactDataGrid :enableCellSelect="true"
                   :enableDragAndDrop="true"
                   key="Areas"
                   :columns="columns"
                   @rowGetter="rowGetter"
                   :rowsCount="countRows()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   @onGridRowsUpdated="handleGridRowsUpdated"
                   ;></ReactDataGrid>
  </div>
  <div v-if="this.rows.length < 1">
    <center>
      <h2>No existen áreas</h2>
      <img style="margin-bottom:10px;"
           width="100"
           src="/static/area.svg">
      <hr>
      <button @click="openModal()"
              class="btn btn-lg btn-primary"><i class="icon add"></i>Agregar nueva</button>
    </center>
  </div>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';
export default {
  mounted() {
    if (!this.$auth.check([
        'areas'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }
  },
  name: 'Areas',
  props: [
    'data'
  ],
  computed: {
    rows: function(e) {
      return this.data.areas
    }
  },
  components: {
    ReactDataGrid
  },
  methods: {
    /* 
     * Permite abrir un modal para cargar areas
    */
    openModal() {
      this.dialogCreateVisible = true
      this.nameArea = 'Area ' + parseInt(this.rows.length + 1, 10)
    },
    /* 
     * Permite agregar un registro
    */
    addRow() {
      this.dialogCreateVisible = false
      this.selectedRow = null
      api.createArea({
        name: this.nameArea,
        process_id: this.$route.params.id
      }).then((r) => {
        if (r.status === 200) {
          this.$bus.emit('getModulesData', [
            {
              url: 'getAreas',
              reference: 'areas'
            }
          ])

        } else {
          this.$message({
            message: 'Error al agregar fila.',
            type: 'error'
          })
        }
      }).catch(() => {
        console.log('error')
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteArea(row.id).then((r) => {

        if (_.isNil(r.response)) {
          this.rows.splice(this.rows.indexOf(row), 1)
          this.selectedRow = null
          this.$bus.emit('getModulesData', [
            {
              url: 'getAreas',
              reference: 'areas'
            }
          ])

          this.$message({
            message: 'Area eliminada correctamente',
            type: 'success'
          })

        } else {
          this.$message({
            message: 'No se ha podido eliminar el registro, esta siendo usado en otra dependencia.',
            type: 'error'
          })
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    /* 
     * Permite seleccionar un registro
    */
    clickedRow(row) {
      this.selectedRow = this.rows[row]
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
        api.updateArea(updatedRow.id, updatedRow).then((r) => {
          if (r.status === 200) {

            this.$message({
              message: 'Modificado correctamente.',
              type: 'success'
            })

            this.rows[i] = updatedRow
            this.$bus.emit('getModulesData', [
              {
                url: 'getAreas',
                reference: 'areas'
              }
            ])

          } else {

            this.rows[i].name = 'Inserte nuevo valor'
            this.$forceUpdate()
            this.$message({
              message: 'Error al modificar.',
              type: 'error'
            })

          }
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    /* 
     * Permite contrar el número de registros
    */
    countRows() {
      return this.rows.length
    }
  },
  data() {
    return {
      dialogCreateVisible: false,
      nameArea: '',
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/areas/importExcel/' + this.$route.params.id,
      showUpload: false,
      selectedRow: null,
      columns: [
        {
          key: 'name',
          name: 'Nombre',
          editable: true
        }
      ]
    }
  }
}

</script>
