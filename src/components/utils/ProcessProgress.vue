<template>
<div>
  <center style="margin-top:50px;">
    <div class="ui icon message success">
      <div class="content">
        <div class="header">
        	Puedes cerrar esta ventana. Recibiras un email cuando el proceso finalice.
        </div>	
      </div>
    </div>
    <h2 style="margin-bottom:10px;">{{info}}</h2>
    <br>
    <el-progress v-if="info !== 'En cola'"
                 :stroke-width="30"
                 :percentage="progress"></el-progress>
    <div style="margin-top:250px;"
         class="container-lol"
         v-if="info !== 'En cola'">
      <div class="holder">
        <div class="box"></div>
      </div>
      <div class="holder">
        <div class="box"></div>
      </div>
      <div class="holder">
        <div class="box"></div>
      </div>
    </div>
    <img v-if="info == 'En cola'"
         width="250px"
         src="/static/queue.png">
    <br>
  </center>
</div>

</template>

<script>
export default {
  /* Nombre del componente */
  name: 'ProcessProgress',
  /* Recibe información del proceso y el progreso */
  props: [
    'info',
    'progress'
  ]
}

</script>
