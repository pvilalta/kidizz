<template>
  <div class="login-form">
    <input
      type="text"
      v-model="usernameInput"
      placeholder="enter your username"
      @keyup.enter="handleButtonClick"
    >
    <input
      type="text"
      v-if="createUserInput"
      v-model="emailInput"
      placeholder="enter your email"
      @keyup.enter="handleButtonClick"
    >
    <button
      :disabled="!usernameInput"
      @click="handleButtonClick"
    >{{ createUserInput ? 'Create Account' : 'Login' }}</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { getUser, createUser } from "../api/index";

export default defineComponent({
  name: "LoginForm",
  setup(_, { emit }) {
    const emailInput = ref<string>("");
    const usernameInput = ref<string>("");
    const errorMessage = ref<string>("");
    const createUserInput = ref<boolean>(false);

    const login = async () => {
      const user = await getUser(usernameInput.value);
      if (user.id) emit("logUser", user);
      else createUserInput.value = true;
    };

    const registerUser = async () => {
      const createdUser = await createUser({
        email: emailInput.value,
        username: usernameInput.value,
      });

      if (createdUser.error) {
        errorMessage.value = createdUser.message;
      } else {
        const user = await getUser(usernameInput.value);
        emit("logUser", user);
        createUserInput.value = false;
      }
    };

    const handleButtonClick = () => {
      if (createUserInput.value) registerUser();
      else login();
    };

    return {
      usernameInput,
      login,
      emailInput,
      createUserInput,
      handleButtonClick,
      errorMessage,
    };
  },
});
</script>

<style lang="scss">
.login-form {
  display: flex;
  justify-content: center;
  gap: 12px;
  input,
  button {
    padding: 10px;
  }
}
</style>
