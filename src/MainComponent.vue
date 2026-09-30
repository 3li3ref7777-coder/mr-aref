<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards, Mousewheel } from 'swiper/modules'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import 'swiper/css'
import 'swiper/css/effect-cards'

const emit = defineEmits(['open-booking'])
const db = getFirestore()

const publicPath = process.env.BASE_URL

const images = [
  `${publicPath}imges/imgess (1).jpeg`, 
  `${publicPath}imges/imgess(2).jpeg`, 
  `${publicPath}imges/imgess(3).jpeg`
]

const campaigns = [
  'مع مستر عارف يا عم ... متشلش هم .... كده كده المادة هتتلم', 
  'مستني إيه؟ احجز مكانك دلوقتي!', 
  'تعلم الرياضيات بطريقة ممتعة وفعالة مع مستر عارف!'
]

// مصفوفة الكتب مع روابط افتراضية، يتم تحديثها ديناميكياً من الـ Firebase
const booksList = ref([
  { frontImage: `${publicPath}imges/imges_boock/front(1).jpeg`, backImage: `${publicPath}imges/imges_boock/back(1).jpeg` },
  { frontImage: `${publicPath}imges/imges_boock/front(2).jpeg`, backImage: `${publicPath}imges/imges_boock/back(2).jpeg` },
  { frontImage: `${publicPath}imges/imges_boock/front(3).jpeg`, backImage: `${publicPath}imges/imges_boock/back(3).jpeg` }
])

// متغير لحفظ مكان الحصول على الكتاب الموحد
const bookLocationText = ref('مكتبة الأستاذ ممدوح عند مصطفى كلر')

const courses = [
  { id: 'الصف الأول الإعدادي', image: `${publicPath}imges/الحجز/الصف الاول .jpeg`, alt: 'الصف الأول الإعدادي' },
  { id: 'الصف الثاني الإعدادي', image: `${publicPath}imges/الحجز/الصف الثاني  .jpeg`, alt: 'الصف الثاني الإعدادي' },
  { id: 'الصف الثالث الإعدادي', image: `${publicPath}imges/الحجز/الصف الثالث  .jpeg`, alt: 'الصف الثالث الإعدادي' },
]

const currentIndex = ref(0)
const heroOpacity = ref(1)
const startX = ref(0)
const isDragging = ref(false)
let autoSlideTimer
const swiperModules = [EffectCards, Mousewheel]
const campaign = computed(() => campaigns[currentIndex.value])

function changeSlide(index) { currentIndex.value = index; heroOpacity.value = 0; window.setTimeout(() => heroOpacity.value = 1, 250) }
function nextSlide() { changeSlide((currentIndex.value + 1) % images.length) }
function previousSlide() { changeSlide((currentIndex.value - 1 + images.length) % images.length) }
function mouseDown(event) { startX.value = event.clientX; isDragging.value = true }
function mouseUp(event) { if (!isDragging.value) return; const difference = startX.value - event.clientX; isDragging.value = false; if (difference > 50) nextSlide(); else if (difference < -50) previousSlide() }
function touchStart(event) { startX.value = event.touches[0].clientX }
function touchEnd(event) { const difference = startX.value - event.changedTouches[0].clientX; if (difference > 50) nextSlide(); else if (difference < -50) previousSlide() }
function tiltBook(event) { const book = event.currentTarget.querySelector('.book'); const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2); const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2); book.style.transform = `rotateX(${-y * 12}deg) rotateY(${x * 180}deg)` }
function resetBook(event) { event.currentTarget.querySelector('.book').style.transform = 'rotateX(8deg) rotateY(0deg)' }

// دالة لجلب إعدادات الكتب ومكان الحصول عليها من Firebase
async function fetchSiteData() {
  try {
    const docRef = doc(db, 'siteSettings', 'general')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      
      // جلب مكان الحصول على الكتاب الموحد (نحفظه في حقل عام مثل generalBookLocation أو نقرأه من إعدادات الصف الأول كمثال أو من جذر المستند)
      if (data.generalBookLocation) {
        bookLocationText.value = data.generalBookLocation
      }

      // تحديث الصف الأول
      if (data['الصف الأول الإعدادي']) {
        if (data['الصف الأول الإعدادي'].frontBookImage) booksList.value[0].frontImage = data['الصف الأول الإعدادي'].frontBookImage
        if (data['الصف الأول الإعدادي'].backBookImage) booksList.value[0].backImage = data['الصف الأول الإعدادي'].backBookImage
      }
      // تحديث الصف الثاني
      if (data['الصف الثاني الإعدادي']) {
        if (data['الصف الثاني الإعدادي'].frontBookImage) booksList.value[1].frontImage = data['الصف الثاني الإعدادي'].frontBookImage
        if (data['الصف الثاني الإعدادي'].backBookImage) booksList.value[1].backImage = data['الصف الثاني الإعدادي'].backBookImage
      }
      // تحديث الصف الثالث
      if (data['الصف الثالث الإعدادي']) {
        if (data['الصف الثالث الإعدادي'].frontBookImage) booksList.value[2].frontImage = data['الصف الثالث الإعدادي'].frontBookImage
        if (data['الصف الثالث الإعدادي'].backBookImage) booksList.value[2].backImage = data['الصف الثالث الإعدادي'].backBookImage
      }
    }
  } catch (error) {
    console.error('Error fetching site data:', error)
  }
}

onMounted(() => {
  autoSlideTimer = window.setInterval(nextSlide, 5000)
  fetchSiteData()
})

onBeforeUnmount(() => window.clearInterval(autoSlideTimer))
</script>

<template>
  <main>
    <section class="hero">
      <img class="hero-image" :src="images[currentIndex]" :style="{ opacity: heroOpacity }" alt="عارف أحمد مدرس الرياضيات" @mousedown="mouseDown" @mouseup="mouseUp" @mouseleave="isDragging = false" @touchstart="touchStart" @touchend="touchEnd">
      <button class="slider-btn prev" aria-label="الصورة السابقة" @click="previousSlide"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="slider-btn next" aria-label="الصورة التالية" @click="nextSlide"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="dots"><span v-for="(_, index) in images" :key="index" class="dot" :class="{ active: currentIndex === index }" @click="changeSlide(index)"></span></div>
      <h3 class="campaign">{{ campaign }}</h3>
    </section>

    <section class="why-us-section py-5">
      <div class="container"><div class="row align-items-center g-4">
        <div class="col-lg-7"><div class="why-us-content">
          <span class="badge bg-teal-light text-teal fw-bold mb-2 px-3 py-2">الحمد لله أولًا وآخرًا</span>
          <h2 class="fw-bold text-teal mb-3">لماذا تختارنا وتثق بنا؟ 🤲</h2>
          <p class="intro-text text-muted">شكرًا لله على نعمه وتيسيره، وتوفيقه لنا طوال الفترة الماضية.. يعلم الله وحده حجم المجهود المبذول لإرضائكم، وكيف كانت كل خطوة تتكلل بفضله ورعايته 🤍</p>
          <p class="description-text">رحلتنا مع طلاب الصفوف <strong>الأول والثاني والثالث الإعدادي</strong> لم تكن مجرد شرح لاجتياز الامتحانات والتفوق فحسب — رغم تحقيقنا لذلك بفضل الله — بل كان هدفنا الأسمى أن يفهم الطالب الرياضيات بأسلوب صحيح، ويتعامل معها بعقلية تفكير واعية بعيدًا عن الحفظ والتلقين.</p>
          <div class="testimonials-quotes my-4 p-3 rounded-3 bg-white shadow-sm border-start border-4 border-teal"><h6 class="fw-bold text-teal mb-2"><i class="fa-solid fa-heart me-1"></i> أجمل ما نسعد به هي كلمات طلابنا وأولياء الأمور:</h6><ul class="list-unstyled mb-0 text-secondary small"><li class="mb-1"><i class="fa-solid fa-quote-right color-teal me-2"></i>"كنت بكرهه الرياضيات وحبيتها بسببك يا مستر"</li><li class="mb-1"><i class="fa-solid fa-quote-right color-teal me-2"></i>"كانت أصعب مادة والأسهل الآن"</li><li><i class="fa-solid fa-quote-right color-teal me-2"></i>"بنتظر الموعد بفارغ الصبر"</li></ul></div>
          <p class="highlight-text fw-bold">فخرنا الحقيقي ليس في الدرجة المؤقتة فحسب، بل في بناء فهم حقيقي مستدام يعيش مع الطالب طوال حياته.</p>
          <h5 class="fw-bold text-teal mt-4 mb-3">🌟 ماذا نقدم لك هذا العام؟</h5>
          <div class="row g-3"><div v-for="feature in [['fa-clipboard-check','منظومة متابعة دقيقة','فريق مساعدين متكامل لتصحيح كل تفصيلة في الواجبات أولًا بأول.'],['fa-chart-line','تقييم مستمر','أكثر من 33 امتحانًا دقيقًا داخل الحصص مع رصد دوري للنتائج.'],['fa-file-pen','أعداد شامل','امتحانات نهائية ومراجعات مكثفة فور الانتهاء من المنهج.'],['fa-lightbulb','تطوير مستمر','نعود إليكم بـ فكر محترف مختلف.. أقوى، أعمق، وأقرب للطالب.']]" :key="feature[1]" class="col-md-6"><div class="feature-item p-3 rounded-3 bg-white shadow-sm h-100"><h6 class="fw-bold text-teal"><i :class="['fa-solid', feature[0], 'me-2']"></i>{{ feature[1] }}</h6><p class="small text-muted mb-0">{{ feature[2] }}</p></div></div></div>
          <blockquote class="quote-box p-3 mt-4 rounded-3 text-center">📌 "المستقبل المشرق ملك أولئك الذين تؤمنون بجمال أحلامهم.. ومن يستطيع فهم الرياضيات، يستطيع فهم الحياة."</blockquote>
        </div></div>
        <div class="col-lg-5 d-flex justify-content-center align-items-center"><div class="cards-wrapper"><Swiper class="mySwiper" :modules="swiperModules" effect="cards" :grab-cursor="true" :mousewheel="{ invert: false }"><SwiperSlide v-for="number in 4" :key="number"></SwiperSlide></Swiper></div></div>
      </div></div>
    </section>

    <!-- قسم الكتب المحدث ليقرأ مكان الحصول على الكتاب ديناميكياً -->
    <section class="book-section py-5">
      <div class="container">
        <div class="row align-items-center g-4">
          <div class="col-lg-6 text-center text-lg-start">
            <span class="badge bg-custom-secondary mb-2 px-3 py-2">سلسلة كتاب التميز</span>
            <h2 class="fw-bold color-primary mb-3">إحنا مش بنشتغل بمذكرات! 📚</h2>
            <h4 class="fw-bold text-dark mb-4 lh-base">إحنا بنشتغل بـ <span class="color-primary">"كتاب مستر عارف للتفوق"</span></h4>
            <p class="lead text-secondary mb-4">كتاب شامل ومعد خصيصاً ليغطي كل أفكار المنهج والتمارين المتدرجة للوصول بطلابنا للدرجة النهائية.</p>
            <div class="location-card p-3 rounded-3 bg-white shadow-sm border-start border-4 border-teal d-inline-block text-start w-100">
              <h6 class="fw-bold color-primary mb-2"><i class="fa-solid fa-store me-2"></i>أماكن الحصول على الكتاب:</h6>
              <p class="mb-0 text-dark" v-html="bookLocationText"></p>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="books-container">
              <div v-for="(book, index) in booksList" :key="index" class="book-wrapper" @mousemove="tiltBook" @mouseleave="resetBook">
                <div class="book">
                  <div class="book-front" :style="{ backgroundImage: `url(${book.frontImage})` }"></div>
                  <div class="book-back" :style="{ backgroundImage: `url(${book.backImage})` }"></div>
                  <div class="book-pages"></div>
                  <div class="book-spine"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="booking-cards" class="courses-booking-section py-5"><div class="container"><div class="text-center mb-5"><h2 class="fw-bold color-primary">اختر صفك الدراسي واحجز حصتك</h2></div><div class="row g-4 justify-content-center"><div v-for="course in courses" :key="course.id" class="col-12 col-md-6 col-lg-4 d-flex justify-content-center"><div class="course-card"><div class="card-image"><img :src="course.image" :alt="course.alt"></div><div class="card-overlay"><button class="booking-btn" @click="emit('open-booking', course.id)">احجز الآن</button></div></div></div></div></div></section>
  </main>
</template>