<template>
<el-steps :active="activeStep"
          align-center>
  <el-step title="Configuración"
           description="Información general del caso"></el-step>
  <el-step title="Parámetros de entrada"
           description="Captura de variables asociadas al caso"></el-step>
  <el-step title="Ejecución"
           description="Estado de la Ejecución"></el-step>
  <el-step title="Visualización de Resultados"
           description="Parámetros de salida"></el-step>
</el-steps>

</template>

<script>
export default {

  name: 'ProcessStep',
  props: [
    'activeStep'
  ]
}

</script>
