<template>
<div>
<el-dialog
  v-if="infoData.type == 'Excel'"
  title="Errores de ejecución"
  :visible.sync="dialogVisible"
  width="30%">
  <span>Hay errores en la ejecución del script en el servidor</span>
  <div style="height:120px !important;margin-top:0px;"
       id="terminal-logs"
       class="terminal-logs">
    <ul style="list-style-type: none;">
      <li v-if="log"
          v-for="log in logs">{{log}}</li>
    </ul>
  </div>

  <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="dialogVisible = false">Cerrar mensaje</el-button>
  </span>
</el-dialog>
  <div class="row" 
       style="margin-bottom: 10px;" v-if="infoData.form.name !== ''">
    <div class="col-md-12">
      <button :disabled="stageIsNotValid() || !validation.valid && infoData.form.type !== 'Excel'" @click="start"
              style="margin-left: 10px;"
              class="ui button inverted green float-right"><i class="icon play"></i>Iniciar ejecución</button>
      <button v-if="infoData.form.type !== 'Excel'" @click="cancel"
              class="button ui black float-right init-button"><i class="icon chevron left"></i> Cancelar lanzamiento</button>
    </div>
  </div>
  <div element-loading-text="Espere un momento..."
 v-loading="infoData.form.name == ''" class="row" element-loading-background="rgba(255,255,255,255)"
>
    <div class="col-md-4">
      <el-tabs type="border-card">
        <el-tab-pane label="Módulos de simulación">
          <div class="row">
            <div class="col-md-12">
              <el-switch v-model="data.read_data"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Leer datos">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch v-model="data.param_calculation"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Calculo de parámetros">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch v-model="data.param_opf"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Flujo de carga optimo">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch :disabled="!$auth.check([
        'Experimental'
      ])"
                         v-model="data.wind_model2"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Modelo eólico geometrico">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch v-model="data.flow_gates"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Restricción de flujo">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch v-model="data.policy"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Calculo de política">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch v-model="data.simulation"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Simulación">
              </el-switch>
            </div>
            <div class="col-md-12">
              <el-switch :disabled="!$auth.check([
        'Experimental'
      ])"
                         v-model="data.parallel"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="Paralelización">
              </el-switch>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="col-md-8">
      <el-tabs type="border-card">
        <el-tab-pane label="Parámetros de simulación">

          <div class="row" v-if="loadedRemote">
            <div class="col-md-12" style="margin-bottom: 15px;">
                <div v-if="stageIsNotValid()" class="ui message red"><small>La suma de etapas y etapas extra debe ser menor o igual a los meses de la demanda.</small></div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Número máximo de iteraciones
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.max_iter"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Etapas 
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.months"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Etapa extra
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.bnd_stages"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Series forward
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.seriesForw"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Series backward (max: número de escenarios)
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :max="totalScenarios"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.seriesBack"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Sensibilidad a la demanda
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :max="1"
                             :min="0"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.sensDem"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label"> Epsilon area  (max:1, min: 0)
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             :max="1"
                             :min="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.eps_area"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Epsilon sistema (max:1, min: 0)
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             :max="1"
                             :min="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.eps_all"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Epsilon largo plazo (max:1, min: 0)
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             :max="1"
                             :min="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.eps_risk"></vue-numeric>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="control-label">Factor de riesgo
                </label>
                <vue-numeric :disabled="!$auth.check([
        'changeInitialConfigData'
      ])"
                             class="form-control"
                             :precision="0"
                             decimal-separator="."
                             thousand-separator=","
                             v-model="data.commit"></vue-numeric>
              </div>
            </div>
          </div>
            <button :disabled="stageIsNotValid()" @click="onSubmit()" class="btn btn-primary">Guardar</button>

        </el-tab-pane>
      </el-tabs>
      </el-tab-pane>
    </div>
  </div>
</div>

</template>

<script>
import api from '../../api/process.js';
export default {
  mounted() {
    if (this.infoData.type !== "Excel") {
      api.getErrorsBackend(this.$route.params.id).then((v) => {
        if (v.data != "") {
          this.logs = v.data.split("\n")
          this.dialogVisible = true
        }
      })
    }

    api.getScenarios(this.$route.params.id).then((r) => {
      this.totalScenarios = r.data.length + 1
    })

    api.getDemand(this.$route.params.id).then((r) => {
      this.totalDemand = r.data.length + 1
      console.log(this.totalDemand)
      this.loadedRemote = true
    })

    if (this.infoData.form.type !== "Excel") {
        api.getValidation(this.$route.params.id).then((v) => {
          this.validation = v.data
        })
    } else {
      this.validation.valid = true
    }
  },


  props: [
    'data',
    'infoData'
  ],
  name: 'ModelConfig',
  methods: {
    stageIsNotValid () {
      if (this.infoData.form.type !== "En blanco") {
         return ((this.data.months + this.data.bnd_stages > this.totalDemand) && this.infoData.form.type === "En blanco")
      }
      return false
    },
    onSubmit() {
      this.$bus.emit('submitedModelConfig', {
        type: 'modelConfig',
        data: this.data
      })
    },
    goToMain() {
      this.$router.push({
        name: 'main'
      })
    },
    /*
     * Permite iniciar un proceso 
     */
    start() {
      this.onSubmit();
      api.processNew(this.$route.params.id).then(() => {
        this.$bus.$emit('changeStep', 2)
      })
    },
    cancel() {
      this.$bus.$emit('changeStep', 1)
    }
  },
  data() {
    return {
      loadedRemote:false,
      dialogVisible: false,
      logs: [],
      validation: {
        valid: false
      },
      totalScenarios: null,
      totalDemand: null
    }
  }
}

</script>

<style lang="css">
</style>
