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
};