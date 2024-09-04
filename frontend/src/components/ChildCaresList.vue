<template>
  <div class="child-cares-list">
    <h1>Child Cares</h1>
    <div class="child-cares-list__error-message">
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <div class="child-cares-list__child-care">
      <div
        class="child-cares-list__child-care__action"
        v-if="!isFormOpened"
      >
        <button
          class="child-cares-list__child-care__action__add-button"
          @click="isFormOpened = true"
        >Add child care</button>
        <button
          class="child-cares-list__child-care__action__export-button"
          @click="exportChildren"
        >Export children</button>
      </div>
      <div
        class="child-cares-list__child-care__form"
        v-if="isFormOpened"
      >
        <input
          class="child-cares-list__child-care__form__input"
          type="text"
          v-model="nameInput"
          placeholder="name"
          @keyup.enter="addChildCare"
        />
        <button
          class="child-cares-list__child-care__form__submit-button"
          @click="addChildCare"
        >Save</button>
        <button
          class="child-cares-list__child-care__form__cancel-button"
          @click="isFormOpened = false"
        >Cancel</button>
      </div>
    </div>
    <div class="child-cares-list__child-cares">
      <div
        class="child-cares-list__child-cares__item"
        v-for="childCare in childCaresItems"
        :key="childCare.id"
        @click="fetchChildrenFromChildCare(childCare)"
      >
        <h3 class="child-cares-list__child-cares__item__name">{{ childCare.name }}</h3>
        <button
          class="child-cares-list__child-cares__item__delete-button"
          @click.stop="removeChildCare(childCare.id)"
        >Delete</button>
      </div>
    </div>
    <div
      v-if="selectedChildCare?.id"
      class="child-cares-list__children"
    >
      <ChildrenList
        :user="user"
        :childItems="childItems"
        :childCare="selectedChildCare"
        @fetchChildrenFromChildCare="fetchChildrenFromChildCare"
        @closeChildrenModal="closeChildrenModal"
      />
    </div>
  </div>

</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { User, Children, ChildCare } from "../@types";
import {
  getChildCares,
  deleteChildCare,
  createChildCare,
  getChildrenFromChildCare,
  exportChildren,
} from "../api/index";

import ChildrenList from "./ChildrenList.vue";

export default defineComponent({
  name: "ChildCaresList",
  components: {
    ChildrenList,
  },
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
  setup(props) {
    const nameInput = ref<string>("");
    const errorMessage = ref<string>("");
    const isFormOpened = ref<boolean>(false);
    const childItems = ref<Children[]>([]);
    const childCaresItems = ref<ChildCare[]>([]);
    const selectedChildCare = ref<ChildCare | null>(null);

    const fetchChildCares = async () => {
      childCaresItems.value = await getChildCares();
    };

    const fetchChildrenFromChildCare = async (childCare: ChildCare) => {
      const response = await getChildrenFromChildCare(childCare.id);
      childItems.value = [...response.children];
      selectedChildCare.value = childCare;
    };

    const closeChildrenModal = () => {
      childItems.value = [];
      selectedChildCare.value = null;
    };

    const addChildCare = async () => {
      const response = await createChildCare(props.user.username, {
        name: nameInput.value,
      });

      if (response?.message) {
        errorMessage.value = response.message;
      } else {
        await fetchChildCares();
        nameInput.value = "";
        errorMessage.value = "";
        isFormOpened.value = false;
      }
    };

    const removeChildCare = async (id: number) => {
      const response = await deleteChildCare(props.user.username, id);

      if (response?.message) {
        errorMessage.value = response.message;
      } else {
        await fetchChildCares();
        errorMessage.value = "";
      }
    };

    onMounted(async () => {
      await fetchChildCares();
    });

    return {
      addChildCare,
      fetchChildCares,
      deleteChildCare,
      createChildCare,
      closeChildrenModal,
      removeChildCare,
      fetchChildrenFromChildCare,
      exportChildren,
      childCaresItems,
      childItems,
      selectedChildCare,
      errorMessage,
      isFormOpened,
      nameInput,
    };
  },
});
</script>
<style scoped lang="scss">
.child-cares-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  h1 {
    margin-bottom: 0;
  }

  &__error-message {
    height: 5vh;
    width: 50vh;
  }

  &__child-care {
    border-radius: 20px;
    padding: 6px;

    &__action {
      display: flex;
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
      gap: calc(12px / 2);

      &__input {
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
  }

  &__child-cares::-webkit-scrollbar {
    display: none;
  }

  &__child-cares {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 100%;
    max-height: 300px;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &__item {
      flex-grow: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      border-radius: 20px;
      size: 12px;
      width: 150px;
      height: 100px;
      padding: 10px;
      border: 1px solid #ccc;
      cursor: pointer;

      &__name {
        margin: 0;
      }

      &__delete-button {
        width: 50%;
        margin: 0 auto;
        padding: 6px;
      }

      &:hover {
        border: 1px solid black;
      }
    }
  }

  &__children {
    width: 40%;
    position: absolute;
  }
}
</style>