<template>
  <q-page class="bg-accent q-ma-none q-pa-lg" style="text-align: -webkit-center; min-height: 780px;">
    <div v-if="!loading">
      <div class="row text-black justify-center bg-primary" style="width: fit-content; margin-top: 3%;">
        <h5 class="col-auto q-ma-sm q-pa-sm" style="width: fit-content;">
          Próximo evento:
        </h5>
        <h5 class="col-auto q-ma-sm q-pa-sm" style="width: fit-content;">
          {{ nextEvent !== "" || nextEvent !== null ? formattedDMY(nextEvent) : "-" }}
        </h5>
      </div>
      <div class="row q-gutter-md q-ma-none wrap justify-center" style="padding-top: 8%;">
        <div class="col-auto q-ma-none q-mr-lg q-ml-lg q-mt-md">
          <div class="">
            <q-date
              v-model="data"
              :events="events"
              event-color="primary"
              :locale="myLocale"
            />
          </div>

        </div>
        <div class="col-auto q-ma-none q-mr-lg q-ml-lg q-mt-md" style="min-height: 376px;">
          <q-card class="q-pa-md" style="min-height: 376px;">
            <q-card-section>
              <div class="text-h6">
                Día seleccionado:
              </div>
              <div class="text-h6">
                {{ data !== "" ? formattedDMY(data) : "" }}
              </div>
            </q-card-section>
            <q-card-section class="text-left" v-if="!multipleEvents">
              <p>Evento:</p>
              <q-scroll-area style="height: 140px; max-width: 400px">
                <div class="q-pt-xs">
                  {{ info[0]?.info }}
                </div>
              </q-scroll-area>
            </q-card-section>
            <q-card-section class="text-left" v-if="multipleEvents">
              <p>Eventos:</p>
              <q-scroll-area style="height: 200px; max-width: 200px">
                <div class="q-pt-xs q-mt-md" v-for="(event, key) in info" v-bind:key="key">
                  <q-checkbox right-label v-model="checkInfo[key]" label="" checked="true">
                    {{ event.info }}
                  </q-checkbox>
                </div>
              </q-scroll-area>
            </q-card-section>
            <q-btn
              class="q-mt-md q-mr-md q-ml-md"
              type="button"
              color="primary"
              label="Modificar"
              :disable="isDataEvent"
              @click="editEvent"
            />
            <q-btn
              class="q-mt-md q-ml-md q-mr-md"
              type="button"
              color="primary"
              label="Eliminar"
              :disable="isDataEvent"
              @click="deleteEvent"
            />
          </q-card>
        </div>
        <div class="row col-auto q-ma-none q-mr-lg q-ml-lg justify-center q-mt-md" style="height: 376px">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6">{{ isSubmit ? "Agregar" : "Modificar" }} evento</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit="onSubmit" class="q-gutter-md">
                <q-input v-model="newEvent" label="Evento" filled />
                <q-input
                  class="col-4"
                  label="Fecha"
                  v-model.trim="newDate"
                  filled
                  lazy-rules="ondemand"
                  :rules="[(val) => (val && val.length > 0) || 'Campo vacío']"
                  mask="##-##-####"
                  format="DD-MM-YYYY"
                  style="min-width: 200px"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="newDate" mask="DD-MM-YYYY" :locale="myLocale">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-btn
                  type="submit"
                  color="primary"
                  :label="isSubmit ? 'Agregar' : 'Modificar'"
                />
                <q-btn
                  icon="cleaning_services"
                  label="Limpiar"
                  color="primary"
                  outline
                  @click="reset"
                />
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <my-loading-vue v-if="loading" />
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useEvents } from "src/stores/events";
import MyLoadingVue from "src/components/popups/MyLoading.vue";

const storeEvents = useEvents();
const data = ref("");
const info = ref("");
const checkInfo = ref([]);
const type = ref("");
const events = ref([]);
const eventsInfo = ref([]);
const nextEvent = ref("");
const newDate = ref("");
const newEvent = ref("");
const idEvent = ref("");
const $q = useQuasar();
const $router = useRouter();
const isDataEvent = ref(true);
const isSubmit = ref(true);
const multipleEvents = ref(false);
const loading = ref(true);
const myLocale = {
  days: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
  daysShort: "Dom_Lun_Mar_Mié_Jue_Vie_Sáb".split("_"),
  months: "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
    "_"
  ),
  monthsShort: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic".split("_"),
  firstDayOfWeek: 1,
  format24h: true,
  pluralDay: "dias",
};

onMounted(async () => {
  await getEvents();
  await getNextEvent();
 loading.value = false;
});

const getEvents = async () => {
  events.value = [];
  eventsInfo.value = [];
  const response = await storeEvents.getEvents();
  if (response.status === 200 && response.value.length > 0) {
    response.value.forEach((event) => {
      events.value.push(formattedYMD(event.date));
      eventsInfo.value.push({
        id: event.id,
        date: formattedYMD(event.date),
        info: event.description,
      });
    });
  }
};

watch(data, async (val) => {
  await getInfo(val);
});

const getInfo = async (val) => {
  info.value = "";
  checkInfo.value = [];
  let arrayInfo = [];
  let count = 0;
  for (let i = 0; i < eventsInfo.value.length; i++) {
    if (eventsInfo.value[i].date == val) {
      //info.value = i.info;
      count++;
      if (count == 1) {
        multipleEvents.value = false;
        arrayInfo.push({
          id: eventsInfo.value[i].id,
          info: eventsInfo.value[i].info,
        });
      } else {
        multipleEvents.value = true;
        arrayInfo.push({ id: eventsInfo.value[i].id, info: eventsInfo.value[i].info });
      }
    }
  };
  info.value = arrayInfo;
  info.value.forEach((i) => {
    checkInfo.value.push(false);
  });
  isEvent();
};

function formattedDMY(date) {
  if (date !== "" && date !== null) {
    const d = new Date(date);
    const month = "" + (d.getMonth() + 1);
    const day = "" + d.getDate();
    const year = d.getFullYear();
    return [day < 10 ? "0" + day : day, month < 10 ? "0" + month : month, year].join("-");
  }
}

const formattedYMD = (date) => {
  if (date !== "" && date !== null) {
    const d = date.split("-");
    const month = d[1];
    const day = d[0];
    const year = d[2];
    return [year, month, day].join("/");
  }
};

const getNextEvent = async () => {
  const today = new Date().getTime();
  let next = null;
  let nextEventDate = new Date();
  nextEventDate.setFullYear(nextEventDate.getFullYear() + 10);
  events.value.forEach((event) => {
    const eventDate = new Date(event).getTime();
    if (eventDate > today) {
      if (eventDate < nextEventDate) {
        nextEventDate = eventDate;
        next = event;
      }
    }
  });
  nextEvent.value = next;
};

const onSubmit = async () => {
  if (newDate.value == "" || newEvent.value == "") {
    $q.notify({
      message: "Debe completar todos los campos",
      color: "negative",
    });
  } else {
    //const id = await getIdEvent();
    const dataEvent = {
      id: idEvent.value,
      date: newDate.value,
      description: newEvent.value,
    };
    if (isSubmit.value === true) {
      const response = await storeEvents.addEvent(dataEvent);
      if (response.status === 200) {
        $q.notify({
          message: "Evento agregado",
          color: "positive",
        });
        newDate.value = "";
        newEvent.value = "";
        await getEvents();
        await getNextEvent();
      }
    } else {
      const response = await storeEvents.modifyEvent(dataEvent);
      if (response.status === 200) {
        $q.notify({
          message: "Evento modificado",
          color: "positive",
        });
        newDate.value = "";
        newEvent.value = "";
        await getEvents();
        await getNextEvent();
        isSubmit.value = true;
      }
    }
    getInfo(data.value);
  }
};

const editEvent = () => {
  if (!multipleEvents.value) {
    newDate.value = formattedDMY(data.value);
    eventsInfo.value.forEach((event) => {
      if (event.date == data.value) {
        newEvent.value = event.info;
        idEvent.value = event.id;
      }
    });
    isSubmit.value = false;
  } else {
    let count = 0;
    let key = null;
    checkInfo.value.forEach((val, index) => {
      if (val) {
        count++;
        key = index;
      }
    });
    if (count == 0) {
      $q.notify({
        message: "Debe seleccionar un evento",
        color: "negative",
      });
    } else if (count > 1) {
      $q.notify({
        message: "Debe seleccionar solo un evento",
        color: "negative",
      });
    } else {
      const date = info.value[key];
      newDate.value = formattedDMY(data.value);
      eventsInfo.value.forEach((event) => {
        if (event.id == date.id) {
          newEvent.value = event.info;
          idEvent.value = event.id;
        }
      });
      isSubmit.value = false;
    }
  }
};

const isEvent = () => {
  if (events.value.includes(data.value)) {
    isDataEvent.value = false;
  } else {
    isDataEvent.value = true;
  }
};

const getIdEvent = async () => {
  let id = null;
  eventsInfo.value.forEach((event) => {
    if (event.date == data.value) {
      id = event.id;
    }
  });
  return id;
};

const deleteEvent = async () => {
  if (!multipleEvents.value) {
    eventsInfo.value.forEach((event) => {
      if (event.date == data.value) {
        idEvent.value = event.id;
      }
    });
  } else {
    let count = 0;
    let key = null;
    checkInfo.value.forEach((val, index) => {
      if (val) {
        count++;
        key = index;
      }
    });
    if (count == 0) {
      $q.notify({
        message: "Debe seleccionar un evento",
        color: "negative",
      });
    } else if (count > 1) {
      $q.notify({
        message: "Debe seleccionar solo un evento",
        color: "negative",
      });
    } else {
      const date = info.value[key];
      eventsInfo.value.forEach((event) => {
        if (event.id == date.id) {
          idEvent.value = event.id;
        }
      });
    }
  }
  const response = await storeEvents.deleteEvent(idEvent.value);
  if (response.status === 200) {
    $q.notify({
      message: "Evento eliminado",
      color: "positive",
    });
    newDate.value = "";
    newEvent.value = "";
    await getEvents();
    await getNextEvent();
  }
  getInfo(data.value);
};

const reset = () => {
  newDate.value = "";
  newEvent.value = "";
  isSubmit.value = true;
};
</script>

<style></style>
