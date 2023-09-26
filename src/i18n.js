import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    "en": '',
  },
});

function setI18nLanguage (lang) {
  i18n.locale = lang;
  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

export function loadLanguageAsync (lang) {
  i18n.setLocaleMessage(lang, languages[lang]);
  return setI18nLanguage(lang);
}

const languages = {
  'en': {
    "Filter by category": "Filter by service category",
    "Search bar": "Begin typing to filter results by title or description",
    "All services": "All Services",
    "No results": "Sorry, we couldn't find anything for that search. Please try different terms.",
  },
  'es': {
    "Filter by category": "Filtrar por categoría de servicio",
    "Search bar": "Empiece a escribir para filtrar los resultados por título o descripción",
    "All services": "Todos los servicios",
    "No results": "Lo sentimos, no hemos podido encontrar nada para esa búsqueda. Por favor, prueba con términos diferentes.",
  },
  'zh': {
    "Filter by category": "按服务类别筛选",
    "Search bar": "开始键入以按标题或描述筛选结果",
    "All services": "所有服务",
    "No results": "抱歉，我们找不到任何与该搜索相关的内容。请尝试不同的术语。",
  },
  'ar': {
    "Filter by category": "التصفية حسب فئة الخدمة",
    "Search bar": "ابدأ الكتابة لتصفية النتائج حسب العنوان أو الوصف",
    "All services": "جميع الخدمات",
    "No results": "جميع الخدمات",
  },
  'ht': {
    "Filter by category": "Filtre pa kategori sèvis",
    "Search bar": "Kòmanse sezisman filtre rezilta pa tit oswa deskripsyon",
    "All services": "Tout Sèvis",
    "No results": "Padon, nou pa t 'kapab jwenn anyen pou rechèch sa a. Tanpri eseye diferan tèm.",
  },
  'fr': {
    "Filter by category": "Filtrer par catégorie de service",
    "Search bar": "Commencez à taper pour filtrer les résultats par titre ou description",
    "All services": "Tous les services",
    "No results": "Désolé, nous n'avons rien trouvé pour cette recherche. Veuillez essayer d'autres termes.",
  },
  'sw': {
    "Filter by category": "Chuja kwa jamii ya huduma",
    "Search bar": "Anza kuandika kuchuja matokeo kwa kichwa au maelezo",
    "All services": "Huduma Zote",
    "No results": "Samahani, hatukuweza kupata chochote kwa ajili ya utafutaji huo. Tafadhali jaribu maneno tofauti.",
  },
  'pt': {
    "Filter by category": "Filtrar por categoria de serviço",
    "Search bar": "Comece a digitar para filtrar os resultados por título ou descrição",
    "All services": "Todos os serviços",
    "No results": "Desculpe, não encontramos nada para essa pesquisa. Por favor, tente termos diferentes.",
  },
  'ru': {
    "Filter by category": "Фильтр по категории услуг",
    "Search bar": "Начните вводить текст, чтобы отфильтровать результаты по заголовку или описанию",
    "All services": "Все услуги",
    "No results": "К сожалению, нам не удалось ничего найти по этому запросу. Пожалуйста, попробуйте другие термины.",
  },
  'vi': {
    "Filter by category": "Lọc theo danh mục dịch vụ",
    "Search bar": "Bắt đầu nhập để lọc kết quả theo tiêu đề hoặc mô tả",
    "All services": "Tất cả các dịch vụ",
    "No results": "Rất tiếc, chúng tôi không thể tìm thấy bất cứ điều gì cho tìm kiếm đó. Vui lòng thử các điều khoản khác nhau.",
  },
};