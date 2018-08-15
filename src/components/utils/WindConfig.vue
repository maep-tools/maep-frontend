<template>
<div>
  <el-tabs type="border-card">
    <el-tab-pane label="Parametros de simulación">
      <div class="row">
        <div class="col-md-3">
          <center>
            <vue-numeric v-if="data.lag_max < 15" type="number"
                   :max="14"
                   class="form-control"
                   :min="1"
                   v-model="data.lag_max"
                   height="200px"></vue-numeric>
          </center>
          <label>Retraso máximo de prueba</label>
        </div>
        <div class="col-md-3">
          <center>
                  <el-switch active-color="#13ce66"
                             inactive-color="#ff4949"
                             @change="changeTestingT"                             
                             active-text="Verificar modelo"
                             v-model="data.testing_t">
                  </el-switch>
          </center>
        </div>
        <div class="col-md-3">
                  <el-switch active-color="#13ce66"
                             inactive-color="#ff4949"
                             @change="changeDCorrel"                             
                             active-text="Mostrar correlaciones"
                             v-model="data.d_correl">
                  </el-switch>
        </div>
        <div class="col-md-3">
          <center>
            <b class="badge badge-primary">{{data.seasonality}}</b>
          </center>
          <label>Retraso estacional</label>
        </div>


        <div class="col-md-12">
            <button @click="onSubmit()" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</div>

</template>

<script>
export default {
  props: [
    'data'
  ],
  mounted () {
    console.log(this.data)
  },
  watch: {
    data: {
      handler(newVal, oldVal) {
        console.log(newVal)
      },
      deep: true,
      immediate: true
    }
  },
  name: 'WindConfig',
  methods: {
    changeLagMax(v) {
      var lagMax = parseFloat(v)
      if (lagMax > 14) {
        var that = this
        this.$alert('El valor máximo aceptado por el sistema es 14', {
            title: 'Advertencia',
            type: 'warning',
            center: true,
            callback () {
              that.data.lag_max = "14"
              that.$forceUpdate()
            }
        })
      } else {
        that.data.lag_max = lagMax     
      }
    },
    changeTestingT(v) {
      console.log(v)
      this.data.testing_t = v
    },
    changeDCorrel(v) {
      console.log(v)
      this.data.d_correl = v
    },
    onSubmit() {
      this.$bus.emit('submitedWind', {
        type: 'windConfig',
        data: this.data
      })
    },
    goToMain() {
      this.$router.push({
        name: 'main'
      })
    }
  }
}

</script>

<style lang="css" scoped="">
</style>
