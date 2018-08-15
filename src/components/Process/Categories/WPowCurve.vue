<template>
<div v-loading="loading">
  <div class="row">
    <div class="col-md-12">
      <h3>Seleccione Planta</h3>
      <el-select @change="changePlant()"
                 v-model="windSelected"
                 placeholder="Seleccioné">
        <el-option v-for="item in windM2Config"
                   :key="item.id"
                   :label="item.nombre_planta"
                   :value="item.id">
        </el-option>
      </el-select>
    </div>
  </div>
  <div class="row"
       style="margin-top:50px;"
       v-if="!windSelected">
    <div class="col-md-12">
      <center>
        <h4>Debes seleccionar una planta para comenzar a asignar los valores.</h4>
        <img src="/static/layers.png">
      </center>
    </div>
  </div>
  <div v-if="windSelected"
       class="row">
    <div class="col-md-12">
      <button class="btn btn-primary float-right"
              @click="createPowerCurve"><i class="icon plus"></i>Agregar nueva fila</button>
    </div>
  </div>
  <div v-if="registers.length < 1 && windSelected"
       class="row">
    <div class="col-md-12">
      <center>
        <h3>No existen registros</h3>
      </center>
    </div>
  </div>
  <div class="row"
       style="margin-top:20px;"
       v-if="windSelected"
       :key="register.id"
       v-for="register in registers">
    <div class="col-md-3">
      <h4>P</h4>
      <input type="number"
             class="form-control"
             :precision="5"
             placeholder="Inserte valor"
             decimal-separator="."
             thousand-separator=","
             v-model="register.p">
    </div>
    <div class="col-md-3">
      <h4>CT</h4>
      <input type="number"
             class="form-control"
             :precision="5"
             placeholder="Inserte valor"
             decimal-separator="."
             thousand-separator=","
             v-model="register.CT">
    </div>
    <div class="col-md-3">
      <h4>TpR</h4>
      <input type="number"
             class="form-control"
             placeholder="Inserte valor"
             decimal-separator="."
             thousand-separator=","
             v-model="register.TpR">
    </div>
    <div class="col-md-3">
      <button @click="removeRow(register)"
              class="btn btn-danger float-right"
              style="margin-top:32px;margin-left:10px;"><i class="icon delete"></i></button>
      <button @click="saveWPowCurve(register)"
              class="btn btn-primary float-right"
              style="margin-top:33px;"><i class="icon save"></i></button>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../../api/process.js';
import _ from 'lodash';
export default {
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

    if (this.data.windM2Config.length < 1) {
      this.$alert('No existen plantas, vas a ser redirigido al modulo de plantas.', 'Advertencia', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        type: 'error'
      }).then(() => {
        this.$parent.goToCategory(22)
        return
      })
    }

    this.windM2Config = this.data.windM2Config
  },
  /* Propiedades */
  props: [
    'data'
  ],
  name: 'WPowCurve',
  methods: {
    removeRow(row) {
      var index = this.registers.indexOf(row)
      this.registers.splice(index, 1)
      api.removePowCurve(row.id).then(() => {

      })
    },
    createPowerCurve() {
      api.saveWPowCurve({
        p: 0,
        CT: 0,
        TpR: 0,
        wind_m2_config_id: this.windSelected,
        process_id: this.$route.params.id
      }).then(() => {
        this.changePlant()
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
      })
    },
    saveWPowCurve(register) {
      api.updateWPowCurve(register.id, {
        p: register.p,
        CT: register.CT,
        TpR: register.TpR,
        wind_m2_config_id: this.windSelected,
        process_id: this.$route.params.id
      }).then(() => {
        this.$message({
          message: 'Notificación: Acción realizada correctamente',
          type: 'success'
        })
      })
    },
    changePlant() {
      api.getWPowCurve(this.windSelected).then((v) => {
        this.registers = v.data
        setTimeout(() => {
          this.$forceUpdate()
        }, 2000)
      })
    }
  },
  data() {
    return {
      registers: [],
      id: null,
      wind_m2_config_id: null,
      idSelected: null,
      P: 0,
      CT: 0,
      TpR: 0,
      loading: false,
      windM2Config: [],
      windSelected: null
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
