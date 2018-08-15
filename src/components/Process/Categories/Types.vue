<template>
<div>
  <!-- MENU DE COMPONENTE -->
  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px; visibility:hidden;">
      <button v-if="!showUpload"
              @click="addRow()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow(selectedRow)"
              v-if="selectedRow && !showUpload"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Eliminar seleccionado (id:{{selectedRow.id}})</button>
      <button @click="download()"
              style="margin-left:10px;"
              class="btn btn-sm btn-dark float-right"><i class="icon download"></i>Descargar plantilla</button>
      <button @click="showUpload = true"
              class="btn btn-sm btn-primary float-right"><i class="icon upload"></i>Cargar plantilla</button>
    </div>
  </div>
  <!-- DATA GRID -->
  <div v-if="!showUpload">

  <el-alert style="margin-bottom:20px;"
    title="Contenido es de solo lectura"
    type="warning">
  </el-alert>


    <ReactDataGrid :enableCellSelect="true"
                   key="Areas"
                   :columns="columns"
                   @rowGetter="rowGetter"
                   :rowsCount="countRows()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   @onGridRowsUpdated="handleGridRowsUpdated"
                   ;></ReactDataGrid>
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
  name: 'Types',
  /* Acción que se ejecuta al montar */
  mounted() {
    this.rows = _.clone(this.data.types, true)
    console.log(this.rows)
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
    /* Mensaje en caso de que el archivo suba correctamente */
    successUpload(response) {
      this.rows = response
      this.rows.splice(0, 0)
      this.showUpload = false
      this.$message({
        message: 'Notificación: Importación realizada correctamente',
        type: 'success'
      })
      this.$bus.emit('getModulesData')
    },
    /* 
     * Permite agregar un registro
    */
    addRow() {
      this.selectedRow = null
      api.createArea({
        name: 'Nueva area',
        process_id: this.$route.params.id
      }).then((r) => {
        this.rows.push(r.data)
        this.$bus.emit('getModulesData')
      })
    },
    /* 
     * Permite eliminar un registro
    */
    deleteRow(row) {
      api.deleteArea(row.id).then(() => {
        this.rows.splice(this.rows.indexOf(row), 1)
        this.selectedRow = null
        this.$bus.emit('getModulesData')
      })
    },
    /* 
     * Permite seleccionar un registro
    */
    clickedRow(row) {
      this.selectedRow = this.rows[row]
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

      api.donwloadExcelAreas(this.$route.params.id).then((response) => {

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
          this.$bus.emit('getModulesData')          
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    countRows () {
      return this.rows.length
    }
  },
  data() {
    return {
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/areas/importExcel/' + this.$route.params.id,
      showUpload: false, // determina si muestra el upload
      selectedRow: null, // determina si la fila esta seleccionada 
      rows: [], // filas
      columns: [ // nombre de las columnas 
        {
          key: 'name',
          name: 'Tipo',
          editable: false

        }
      ]
    }
  }
}

</script>
