<template>
<div class="row">
  <div class="col-md-6">
    <div class="form-group">
      <label>Nombre del caso*</label>
      <input v-model="data.form.name"
             type="text"
             class="form-control"
             placeholder="Nombre">
    </div>
    <div class="form-group"
         v-if="!$route.params.id && $auth.check([
        'changeInitialConfigData'
      ])">
      <label>Típo de proyecto</label>
      <br>
      <el-radio-group size="small"
                      v-model="data.form.type">
        <el-radio-button label="En blanco"></el-radio-button>
        <el-radio-button v-if="templates.length > 0"
                         label="Plantilla"></el-radio-button>
        <el-radio-button label="Excel"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="form-group"
         v-if="($auth.check([
        'generateWind'
      ]) && data.form.type === 'En blanco') && enableWindGeneration">
      <label>Generar proceso estocástico *</label>
      <br>
      <el-switch style="display: block"
                 v-model="data.form.generate_wind"
                 @change="changeWindConfig()"
                 active-color="#13ce66"
                 inactive-color="#ff4949"
                 active-text="Generar"
                 inactive-text="No generar">
      </el-switch>
    </div>
    <div class="form-group"
         v-if="$auth.check([
        'createTemplates'
      ]) && !$route.params.id && enableTemplate">
      <label>Es plantilla *</label>
      <br>
      <el-switch style="display: block"
                 v-model="data.form.template"
                 active-color="#13ce66"
                 inactive-color="#ff4949"
                 active-text="Es plantilla"
                 inactive-text="No es plantilla">
      </el-switch>
    </div>
  </div>
  <div class="col-md-6">
    <div class="form-group">
      <label>Fecha de creación</label>
      <input v-model="data.form.date"
             disabled
             type="text"
             class="form-control"
             placeholder="Nombre">
    </div>
    <div class="form-group"
         v-if="data.form.type === 'En blanco' && !$route.params.id && $auth.check([
        'changeInitialConfigData'
      ])">
      <label>Número de escenarios*</label>
      <br>
      <el-input-number :max="48"
                       v-model="data.form.scenarios"
                       type="text"
                       placeholder="Nombre"></el-input-number>
    </div>
    <div class="form-group"
         v-if="data.form.type === 'En blanco' && !$route.params.id && $auth.check([
        'changeInitialConfigData'
      ])">
      <label>Número de bloques*</label>
      <br>
      <el-input-number :max="48"
                       v-model="data.form.blocks"
                       type="text"
                       placeholder="Nombre"></el-input-number>
    </div>
    <div class="message ui warning"
         v-if="$route.params.id && data.form.type === 'En blanco'">
      Para cambiar el número de etapas o el número de bloques debes realizar el procedimiento desde el módulo de configuración.
    </div>
    <div class="form-group"
         v-if="data.form.type === 'Plantilla' && !$route.params.id  && !$route.params.id && $auth.check([
        'useTemplate'
      ])">
      <label>Seleccione el proyecto a clonar</label>
      <br>
      <el-select style="width:100%;"
                 v-model="data.form.template_id"
                 placeholder="seleccione plantilla">
        <el-option v-for="item in templates"
                   :key="item.id"
                   :label="item.name"
                   :value="item.id"></el-option>
      </el-select>
    </div>
    <div class="form-group"
         v-if="data.form.type === 'Excel'">
      <label>Selecciona archivo</label>
      <el-upload style="width:100%;"
                 class="upload-demo"
                 drag
                 :on-change="changeUpload"
                 :action="getAction()">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Suelta tu archivo aquí o <em>haz clic para cargar</em></div>
        <div slot="tip"
             class="el-upload__tip">Solo archivos excel</div>
        <div slot="tip"
             class="el-upload__tip">Puedes descargar un archivo de excel de prueba haciendo click <a href="/static/excel_template.xlsx">aquí</a></div>
      </el-upload>
    </div>
    <div class="form-group">
      <button @click="onSubmit()"
              class="btn btn-primary">
        <i class="icon save"></i> Guardar
      </button>
      <button @click="goToMain()"
              class="btn btn-dark">
        <i class="icon cancel"></i> Cancelar
      </button>
    </div>
  </div>
</div>
</div>
</div>

</template>

<script>
import config from '../../config'
export default {
  props: [
    'data',
    'templates'
  ],
  name: 'BasicConfig',
  methods: {
    getAction () {
      console.log(config)
      return config.path + ':' + config.backendPort + '/api/v1/uploadExcel/' + this.randomCode
    },
    changeUpload(v, vo) {
      this.data.fileCode = this.randomCode
    },
    changeWindConfig(val) {
      if (this.data.form.generate_wind) {
        this.$alert('Se ha agregado la pestaña de "proceso estocástico" en la pre-ejecución, recuerda diligenciar las series hídricas y eólicas.', 'Advertencia', {
          confirmButtonText: 'OK',
          type: 'success'
        })
      }
    },
    onSubmit() {

      if (this.data.form.type === "Plantilla") {
        if (!this.data.form.template_id && !this.data.form.id) {
          this.$notify.error({
            title: 'Error',
            message: 'Debes seleccionar una plantilla.'
          });
          return
        }
      }


      if (this.data.form.type === "Excel") {
          if (!this.data.fileCode) {
              this.$notify.error({
                title: 'Error',
                message: 'Debes de subir un archivo'
              });
              return
          }
      }



      var reload = this.$route.query.deploy
      this.$bus.emit('submited', {
        type: 'basicConfig',
        data: this.data
      })
    },
    goToMain() {
      this.$router.go(-1)
    }
  },
  data() {
    return {
      config: config,
      enableTemplate: false,
      enableWindGeneration: config.enableWindGeneration,
      randomCode: _.random(1,1000000),
      procesamiento: false
    }
  }
}

</script>
