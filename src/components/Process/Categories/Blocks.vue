<template>
<div>
  <el-dialog :visible.sync="dialogEditVisible"
             title="¿Desea ingresar restricciones en la operación del almacenamiento?"
             width="35%">
    <div class="row">
      <div class="col-md-12">
        <div class="form-group required">
          <el-switch @change="changeRestrictionValue"
                     active-text="Activar"
                     inactive-text="Desactivar"
                     v-model="storageRestrictionValue"
                     active-color="#13ce66"
                     inactive-color="#ff4949">
          </el-switch>
        </div>
      </div>
    </div>
  </el-dialog>

  <div class="row">
    <div class="col-md-12"
         style="margin-bottom:10px;">
      <button
              @click="addRow()"
              style="margin-left:10px;"
              class="btn btn-sm btn-warning float-right"><i class="icon plus"></i>Agregar</button>
      <button @click="deleteRow()"
              v-if="rows.length > 0"
              style="margin-left:10px;"
              class="btn btn-sm btn-danger float-right"><i class="icon trash"></i>Reducir bloques (-1)</button>
    </div>
  </div>

  <div v-if="this.rows.length > 0">
    <el-alert style="margin-bottom:10px;" 
              v-if="!validBlocks()"
              title="La suma de las duraciones de los bloques deben de ser igual a 1."
              type="warning">
    </el-alert>
    <ReactDataGrid :enableCellSelect="true"
                   :enableDragAndDrop="true"
                   key="Areas"
                   :columns="columns"
                   @rowGetter="rowGetter"
                   @onRowsSelected="onRowsSelected()"
                   :rowsCount="countRows()"
                   @onRowClick="clickedRow"
                   :minHeight="500"
                   @onGridRowsUpdated="handleGridRowsUpdated"
                   ;></ReactDataGrid>
  </div>
  <div v-if="this.rows.length < 1">
    <center>
      <h2>No existen bloques</h2>
      <img style="margin-bottom:10px;"
           width="100"
           src="/static/block.png">
      <hr>
      <button @click="addRow()"
              class="btn btn-lg btn-primary"><i class="icon add"></i>Agregar nuevo</button>
    </center>
  </div>
</div>

</template>

<script>
import ReactDataGrid from 'react-data-grid';
import api from '../../../api/process.js';
import _ from 'lodash';
export default {
  name: 'Blocks',
  mounted() {
    if (!this.$auth.check([
        'blocks'
      ])) {
      this.$message({
        message: 'No tienes permisos',
        type: 'error'
      })
      this.$parent.goToCategory(1)
      return
    }
  },
  props: [
    'data'
  ],
  computed: {
    rows: function(e) {
      return this.mapBlocks(this.data.blocks)
    }
  },
  components: {
    ReactDataGrid
  },
  methods: {
    validBlocks () {
        var valid = true
        // contamos los bloques para verificar 
       var blocksCounter =  this.data.blocks.length
       
       if (blocksCounter > 1) {
        var acum = 0
        this.data.blocks.forEach((v) => {
          acum += v.duration
        })
       }


       if (acum !== 1) {
         valid = false
       }

        return valid



    },
    changeRestrictionValue(v) {
      if (v) {
        this.selectedRow.storage_restrictions = 'SI'
      } else {
        this.selectedRow.storage_restrictions = 'NO'
      }

      this.handleGridRowsUpdated({
        fromRow: this.selectedRowKey,
        toRow: this.selectedRowKey
      })
      this.$forceUpdate()
    },
    mapBlocks(blocks) {
      var registers = _.map(blocks, (block) => {
        return {
          id: block.id,
          name: block.name,
          participation: block.participation,
          duration: block.duration,
          storage_restrictions: (block.storage_restrictions) ? 'SI' : 'NO',
          process_id: block.process_id
        }
      })

      return registers

    },
    /* 
     * Permite agregar un registro
    */
    addRow() {

      _.each(this.rows, function(v) {
        v.duration = parseFloat(v.duration)
      })

      if (_.sumBy(this.rows, 'duration') >= 1) {
        this.$message({
          message: 'No se puede agregar registros porque la suma de valores de la duración no puede ser mayor a 1',
          type: 'warning'
        })

        return false

      }

      this.selectedRow = null
      api.createBlock({
        name: this.nameBlock + (parseInt(this.rows.length, 10) + 1),
        duration: 0,
        participation: 0,
        storage_restrictions: false,
        process_id: this.$route.params.id
      }).then((r) => {
        if (r.status === 200) {
          this.$bus.emit('getModulesData', [
            {
              url: 'getBlocks',
              reference: 'blocks'
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
    deleteRow() {

      var row = _.last(this.rows)

      api.deleteBlock(row.id).then((r) => {

        if (_.isNil(r.response)) {
          this.rows.splice(this.rows.indexOf(row), 1)
          this.selectedRow = null
          this.$bus.emit('getModulesData', [
            {
              url: 'getBlocks',
              reference: 'blocks'
            }
          ])

          this.$message({
            message: 'Bloque eliminado correctamente',
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
    clickedRow(row, rowText, rowInfo) {
      this.selectedRow = this.rows[row]
      this.selectedRowKey = row
      if (rowInfo.key === 'storage_restrictions') {
        this.storageRestrictionValue = (this.selectedRow.storage_restrictions === 'SI') ? true : false
        console.log(this.storageRestrictionValue)
        this.dialogEditVisible = true
      }
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
      if (!_.isNil(data.updated.duration)) {
        if (isNaN(data.updated.duration)) {
          this.$message.error('La duración no es un valor valido.')
          return
        }
      }

      if (!_.isNil(data.updated.participation)) {

        if (data.updated.participation < 0 || data.updated.participation > 1)  {
          this.$message.error('El valor debe de estar entre cero y uno.')
          return          
        }


        if (isNaN(data.updated.participation)) {
          this.$message.error('La participación no es un valor valido.')
          return
        }
      }



      this.dialogEditVisible = false
      for (let i = data.fromRow; i <= data.toRow; i++) {
        let rowToUpdate = this.rows[i]
        let updatedRow = _.extend(rowToUpdate, data.updated)

        _.each(this.rows, function(v) {
          v.duration = parseFloat(v.duration)
        })

        if (_.sumBy(this.rows, 'duration') > 1) {
          updatedRow.duration = 0
          this.$message.error('La suma total no puede ser superior a 1. El valor no sera cambiado')
          return
        }

        api.updateBlock(updatedRow.id, {
          duration: updatedRow.duration,
          id: updatedRow.id,
          name: updatedRow.name,
          participation: updatedRow.participation,
          process_id: updatedRow.process_id,
          storage_restrictions: (updatedRow.storage_restrictions === 'SI') ? true : false
        }).then((r) => {
          if (r.status === 200) {
            this.rows[i] = updatedRow
            this.$bus.emit('getModulesData', [
              {
                url: 'getBlocks',
                reference: 'blocks'
              }
            ])
          } else {

            this.rows[i].name = 'Inserte nuevo valor'
            this.$forceUpdate()
            this.$message({
              message: 'Error al modificar',
              type: 'error'
            })

          }
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    countRows() {
      return this.rows.length
    }
  },
  data() {
    return {
      dialogCreateVisible: false,
      storageRestrictionValue: false,
      dialogEditVisible: false,
      nameBlock: 'Bloque ',
      uploadPath: window.pathBase + ':' + window.portBaseLaravel + '/api/v1/bloques/importExcel/' + this.$route.params.id,
      selectedRow: null,
      columns: [ 
        {
          key: 'name',
          resizable:true,
          name: 'Bloque',
          editable: true
        },
        {
          key: 'duration',
          name: 'Duracion',
          resizable:true,          
          editable: true
        },
        {
          key: 'participation',
          resizable:true,          
          name: 'Participación por curva de carga (%)',
          editable: true
        },
        {
          key: 'storage_restrictions',
          resizable:true,          
          name: 'Restricción de almacenamiento',
          editable: true
        }
      ]
    }
  }
}

</script>
