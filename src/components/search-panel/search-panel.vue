<style scoped src="./search-panel.css"></style>
<template src="./search-panel.html"></template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex';

  export default {
    name: 'SearchPanel',
    computed: {
      ...mapState(['searchTerm']),
    },
    methods: {
      ...mapActions(['search', 'searchRandom']),
    }
  }
</script>
