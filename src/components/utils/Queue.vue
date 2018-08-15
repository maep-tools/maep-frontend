<template>
<div style="margin-top:5px;">
  <ul class="list-group">
    <li v-for="register in registers"
        class="list-group-item">
      <queue-register :register="register"></queue-register>
    </li>
  </ul>
</div>

</template>

<script>
import Vue from 'vue';
import QueueRegister from './QueueRegister';
export default {
  props: [
    'registers'
  ],
  components: {
    QueueRegister
  }
}
</script>