<template>
  <div class="children-list">
    <div class="children-list__overlay"></div>
    <div class="children-list__content">
      <h1>Children</h1>
      <button
        class="children-list__content__back-button"
        @click="() => emit('closeChildrenModal')"
      >
        Back
      </button>
      <div class="children-list__content__error-message">
        <p v-if="errorMessage">{{ errorMessage }}</p>
      </div>
      <div class="children-list__content__action">
        <button
          class="children-list__content__action__add-button"
          v-if="!isFormOpened"
          @click="isFormOpened = true"
        >Add child</button>
        <button
          :disabled="!childItems.length"
          class="children-list__content__action__export-button"
          @click="exportChildren(childCare.id)"
        >Export children</button>
      </div>
      <div
        class="children-list__content__form"
        v-if="isFormOpened"
      >
        <input
          class="children-list__content__form__firstname-input"
          type="text"
          v-model="firstnameInput"
          placeholder="firstname"
          @keyup.enter="addChild"
        />
        <input
          class="children-list__content__form__lastname-input"
          type="text"
          v-model="lastnameInput"
          placeholder="lastname"
          @keyup.enter="addChild"
        />
        <button
          class="children-list__content__form__submit-button"
          @click="addChild"
        >Save</button>
        <button
          class="children-list__content__form__cancel-button"
          @click="isFormOpened = false"
        >Cancel</button>
      </div>

      <div v-if="!childItems.length">
        No children yet
      </div>
      <div
        class="children-list__content__children"
        v-else
      >
        <div
          class="children-list__content__children__item"
          v-for="child in childItems"
          :key="child.id"
          style="cursor: pointer; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;"
        >
          <p>{{ child.firstname }} {{ child.lastname }}</p>
          <button @click.stop="removeChildFromChildCare(child.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { User, Children, ChildCare } from "../@types";
import {
  upsertChild,
  deleteChildFromChildCare,
  exportChildren,
} from "../api/index";

export default defineComponent({
  name: "ChildrenList",
  emits: ["closeChildrenModal", "fetchChildrenFromChildCare"],
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
    childItems: {
      type: Array as () => Children[],
      required: true,
    },
    childCare: {
      type: Object as () => ChildCare,
      required: true,
    },
  },
  setup(props, { emit }) {
    const isFormOpened = ref<boolean>(false);
    const firstnameInput = ref<string>("");
    const lastnameInput = ref<string>("");
    const errorMessage = ref<string>("");

    const addChild = async () => {
      if (!firstnameInput.value || !lastnameInput.value) {
        return (errorMessage.value = "All fields are required");
      }

      const response = await upsertChild(props.user.username, {
        lastname: lastnameInput.value,
        firstname: firstnameInput.value,
        childCares: [props.childCare.id],
      });

      if (response?.message) {
        errorMessage.value = response.message;
      } else {
        await emit("fetchChildrenFromChildCare", props.childCare);
        isFormOpened.value = false;
        errorMessage.value = "";
        firstnameInput.value = "";
        lastnameInput.value = "";
      }
    };

    const removeChildFromChildCare = async (childId: number) => {
      const response = await deleteChildFromChildCare(props.user.username, {
        childCareId: props.childCare.id,
        childId,
      });
      if (response?.message) {
        errorMessage.value = response.message;
      } else {
        await emit("fetchChildrenFromChildCare", props.childCare);
        errorMessage.value = "";
      }
    };

    return {
      emit,
      addChild,
      firstnameInput,
      lastnameInput,
      isFormOpened,
      errorMessage,
      removeChildFromChildCare,
      exportChildren,
    };
  },
});
</script>


<style scoped lang="scss">
.children-list {
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    pointer-events: auto;
  }

  &__content {
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 40%;
    position: relative;
    border-radius: 20px;
    padding: 6px;
    z-index: 1001;
    top: -129px;
    gap: 12px;

    z-index: 1001;
    &__back-button {
      position: absolute;
      background-color: #f8cc88;
      padding: 6px;
      right: 12px;
      top: 12px;
    }

    &__error-message {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 5vh;
      size: calc(12px / 2);
    }

    &__action {
      display: flex;
      justify-content: center;
      gap: 12px;

      &__add-button {
        background-color: #19abfe;
        padding: 6px;
      }

      &__export-button {
        background-color: #f8cc88;
        padding: 6px;
      }
    }

    &__form {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: calc(12px / 2);

      &__firstname-input,
      &__lastname-input {
        padding: 5px;
      }

      &__submit-button {
        background-color: #19abfe;
        padding: 6px;
      }

      &__cancel-button {
        background-color: #f8cc88;
        padding: 6px;
      }
    }

    &__children {
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    &__children::-webkit-scrollbar {
      display: none;
    }

    &__children {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 12px;
      position: relative;
      overflow: auto;
      max-height: 300px;

      &__item {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        border-radius: 20px;
        size: 12px;
        width: 200px;
        height: 100px;
        cursor: pointer;
        padding: 10px;
        border: 1px solid #ccc;

        h3 {
          margin: 0;
        }

        button {
          width: 50%;
          margin: 0 auto;
          padding: 6px;
        }

        &:hover {
          border: 1px solid black;
        }
      }
    }
  }
}
</style>
