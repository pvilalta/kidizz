<template>
  <header class="header-strap">
    <h2>Welcome {{ user.username }}</h2>
    <button @click="disconnect">Disconnect</button>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { User } from "../@types"; // Assuming the correct path to the User type file

export default defineComponent({
  name: "HeaderStrap",
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
  setup(_, { emit }) {
    const disconnect = () => emit("disconnectUser", { user: {} });
    return {
      disconnect,
    };
  },
});
</script>

<style lang="scss" scoped>
.header-strap {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
  background-color: #0c2436;
  color: white;
  height: 3vh;
  width: 70%;
  padding: 16px;

  b h1 {
    margin-right: auto;
  }

  button {
    margin-left: auto;
    background-color: #f8cc88;
    padding: 6px;
  }
}
</style>
