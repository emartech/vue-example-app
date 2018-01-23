<style src="./app.css"></style>
<template src="./app.html"></template>

<script>
  import SearchPanel from '../search-panel/search-panel';
  import DataPanel from '../data-panel/data-panel';

  export default {
    name: 'App',
    components: { SearchPanel, DataPanel }
  }
</script>
