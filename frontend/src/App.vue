<template>
  <div class="app-layout">
    <div
      class="app-layout__connected"
      v-if="connectedUser"
    >
      <HeaderStrap
        :user="connectedUser"
        @disconnectUser="connectedUser = null"
      />
      <ChildCaresList :user="connectedUser" />
    </div>
    <div
      class="app-layout__disconnected"
      v-else
    >
      <h1 class="app-layout__disconnected__title">Welcome to Kidizz</h1>
      <p class="app-layout__disconnected__text">Sign in or register below</p>
      <LoginForm @logUser="(user) => connectedUser = user" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

import { User } from "./@types";
import LoginForm from "./components/LoginForm.vue";
import HeaderStrap from "./components/HeaderStrap.vue";
import ChildCaresList from "./components/ChildCaresList.vue";

export default defineComponent({
  name: "App",
  components: {
    LoginForm,
    HeaderStrap,
    ChildCaresList,
  },
  setup() {
    const connectedUser = ref<User | null>(null);
    return {
      connectedUser,
    };
  },
});
</script>

<style lang="scss">
body {
  margin: 0;
}

button {
  cursor: pointer;
  border-radius: 20px;
}

input {
  border-radius: 20px;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.app-layout {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #2c3e50;
  background-color: #37b1fc;
  overflow: hidden;
  padding: 6%;
  border-radius: 20px;
  width: 40%;

  &__connected {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__disconnected {
    margin-bottom: 20%;
    &__title {
      margin: 0;
    }

    &__text {
      margin-top: 0;
    }
  }
}
</style>
