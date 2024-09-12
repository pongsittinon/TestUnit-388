<template>
  <div class="htmlClass">
    <h1>{{ head }}</h1>
    <form>
      <input type="text" id="firstName" v-model="firstName" />
      <input type="text" id="secondName" v-model="secondName" />
      <input type="text" id="Codename" v-model="Codename" />
      <input type="text" id="nickname" v-model="nickname" />
      <button @click="submitForm()" class="submitForm">Submit</button>
  </form>
  </div>
</template>

<script>
export default {
  name: 'InputPage',
  data() {
    return {
      head: 'Vue is awesome.',
      firstName: 'นายสิธินนท์',
      secondName: '-',
      Codename:'6604101388',
      nickname:'ปิงปอง',
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit form')
    },
  }
}
</script>

<style scoped></style>
