<template>
  <div>
    <div id="app" v-if="$auth.ready()">
      <router-view :key="$route.fullPath"/>
    </div>
    <div style="padding-left:10px;" v-if="!$auth.ready()" v-loading.fullscreen.lock="!$auth.ready()">
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
