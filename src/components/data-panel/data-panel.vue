<style scoped src="./data-panel.css"></style>
<template src="./data-panel.html"></template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import GifDialog from '../gif-dialog/gif-dialog';

  export default {
    name: 'DataPanel',
    components: { GifDialog },
    computed: {
      ...mapState(['searchTerm', 'gifs', 'selectedGif'])
    },
    methods: {
      ...mapMutations(['selectGif'])
    }
  }
</script>
