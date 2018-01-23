<style scoped src="./gif-dialog.css"></style>
<template src="./gif-dialog.html"></template>

<script>
  export default {
    name: 'GifDialog',

    // Internal state, there is no need to store it in the Vuex Store
    props: ['gif'],
  }
</script>
