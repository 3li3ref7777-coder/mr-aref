<script setup>
import { computed, onMounted, ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './services/firebase'

import FooterComponent from './FooterComponent.vue'
import LinksComponent from './LinksComponent.vue'
import MainComponent from './MainComponent.vue'
import BookingFormComponent from './BookingFormComponent.vue'

const currentPage = ref('home')

// تخزين الإعدادات الخاصة بكل صف دراسي قادمة من الفايرستور
const gradeSettingsData = ref({})

async function fetchSiteSettings() {
  try {
    const docRef = doc(db, 'siteSettings', 'general')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      gradeSettingsData.value = docSnap.data()
    }
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error)
  }
}

onMounted(() => {
  fetchSiteSettings()
})

const grades = computed(() => {
  // دالة مساعدة لجلب إعدادات الصف أو وضع قيم افتراضية
  const getGradeConfig = (gradeName) => {
    return gradeSettingsData.value[gradeName] || {
      startDateText: 'علماً بأن بداية الحجوزات ستكون قريباً إن شاء الله.',
      schedules: { boys: ['10:00 صباحًا'], girls: ['8:00 صباحًا'] }
    }
  }

  const prep1 = getGradeConfig('الصف الأول الإعدادي')
  const prep2 = getGradeConfig('الصف الثاني الإعدادي')
  const prep3 = getGradeConfig('الصف الثالث الإعدادي')

  return [
    {
      id: 'الصف الأول الإعدادي',
      gradeName: 'الصف الأول الإعدادي',
      startDate: prep1.startDateText || 'قريباً',
      femaleAppointments: prep1.schedules?.girls || ['8:00 صباحًا'],
      maleAppointments: prep1.schedules?.boys || ['10:00 صباحًا'],
    },
    {
      id: 'الصف الثاني الإعدادي',
      gradeName: 'الصف الثاني الإعدادي',
      startDate: prep2.startDateText || 'قريباً',
      femaleAppointments: prep2.schedules?.girls || ['8:00 صباحًا'],
      maleAppointments: prep2.schedules?.boys || ['10:00 صباحًا'],
    },
    {
      id: 'الصف الثالث الإعدادي',
      gradeName: 'الصف الثالث الإعدادي',
      startDate: prep3.startDateText || 'قريباً',
      femaleAppointments: prep3.schedules?.girls || ['8:00 صباحًا'],
      maleAppointments: prep3.schedules?.boys || ['10:00 صباحًا'],
    },
  ]
})

const selectedGrade = computed(() =>
  grades.value.find((grade) => grade.id === currentPage.value),
)

function navigate(page) {
  currentPage.value = page
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="app-shell">
    <LinksComponent @go-home="navigate('home')" />

    <MainComponent
      v-if="currentPage === 'home'"
      @open-booking="navigate"
    />

    <BookingFormComponent
      v-else-if="selectedGrade"
      :grade="selectedGrade"
      @go-home="navigate('home')"
    />

    <FooterComponent />
  </div>
</template>