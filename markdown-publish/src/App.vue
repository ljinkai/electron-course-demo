<template>
  <div>
    <Editor msg="Markdown Publish"/>
  </div>
</template>

<script>
import Editor from './components/Editor.vue'
export default {
  name: 'App',
  components: {
    Editor,
  }
}
</script>

<style>
#app {
  width: 100%;
}
</style>
