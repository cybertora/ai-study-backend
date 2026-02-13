# 🎓 AI Study Assistant для AITU

Интеллектуальная веб-платформа для студентов Астана IT University, которая использует возможности искусственного интеллекта для помощи в учёбе.
https://ai-study-frontend-nine.vercel.app/

## PS: Как запустить (Quick Start)

Для запуска скопируйте себе это репозитории: 

https://github.com/cybertora/ai-study-backend

https://github.com/cybertora/ai-study-frontend

### 1. Запуск Бэкенда (Терминал)
В папке `backend` настроен сервер на Node.js.

```bash
cd backend
npm install
npm run dev
```
---
## анологично для Фронтенда
и не забудьте про env файл!

## 📋 Описание проекта

**AI Study Assistant** — это комплексная образовательная платформа, которая помогает студентам:

- 📝 **Конспектировать лекции** — загрузите текст лекции и получите структурированный краткий конспект
- 🧪 **Генерировать тесты** — создавайте тесты по любой теме с настраиваемым количеством вопросов и уровнем сложности
- 💻 **Проверять код** — загрузите свой код, получите анализ ошибок, предложения по улучшению и оценку качества
- 📄 **Создавать шпаргалки** — превращайте объёмные материалы в компактные шпаргалки
- ⏱️ **Проходить экзамены в реальном времени** — режим экзамена с таймером и мгновенной обратной связью от ИИ через WebSocket

---

## 🚀 Технологии

### Backend
- **Node.js 20+** — современная серверная платформа с ESM-модулями
- **Express.js** — минималистичный веб-фреймворк
- **MongoDB + Mongoose** — NoSQL база данных с ODM
- **JWT** — безопасная аутентификация на основе токенов
- **bcrypt** — надёжное хеширование паролей (12 rounds)
- **OpenAI API** — интеграция с GPT-4o-mini для ИИ-функционала
- **Socket.io** — WebSocket для режима экзамена в реальном времени
- **Joi** — валидация входящих данных
- **express-rate-limit** — защита от spam-запросов
- **helmet** — безопасность HTTP-заголовков
- **cors** — настройка Cross-Origin Resource Sharing

### Frontend
- **Next.js 15** (App Router) — React-фреймворк с SSR/SSG
- **React 18+** — библиотека для построения пользовательского интерфейса
- **Tailwind CSS** — utility-first CSS-фреймворк
- **Axios** — HTTP-клиент для API-запросов
- **Socket.io-client** — WebSocket-клиент для real-time функций

### DevOps
- **Docker & Docker Compose** — контейнеризация приложения
- **ESLint** — линтер кода
- **Prettier** — форматирование кода

---

## 📂 Структура проекта

<details>
<summary><b>Нажмите, чтобы развернуть полную структуру файлов</b></summary>

```text
(ai-study-assistant/
├── 🐳 docker-compose.yml             # Конфигурация для запуска всех контейнеров
├── 📜 README.md                      # Документация проекта
├── 📂 backend/                       # Серверная часть (Node.js / Express)
│   ├── ⚙️ .env                       # Переменные окружения (ключи, порты)
│   ├── 📜 package.json               # Зависимости бэкенда
│   └── 📂 src/
│       ├── 📜 app.js                 # Инициализация Express приложения
│       ├── 📜 server.js              # Точка входа сервера
│       ├── 📂 controllers/           # Логика обработки запросов
│       │   ├── 📜 authController.js       # Авторизация и регистрация
│       │   ├── 📜 summaryController.js    # Генерация саммари лекций
│       │   ├── 📜 testController.js       # Создание и проверка тестов
│       │   ├── 📜 codeCheckController.js  # Анализ и проверка кода
│       │   ├── 📜 cheatSheetController.js # Генерация шпаргалок
│       │   └── 📜 examController.js       # Логика экзаменационного режима
│       ├── 📂 models/                # Схемы базы данных (MongoDB/Mongoose)
│       │   ├── 📜 User.js
│       │   ├── 📜 Lecture.js
│       │   ├── 📜 Test.js
│       │   └── 📜 Exam.js
│       ├── 📂 routes/                # Маршрутизация API
│       │   ├── 📜 auth.js
│       │   ├── 📜 summary.js
│       │   ├── 📜 test.js
│       │   ├── 📜 code.js
│       │   ├── 📜 cheatsheet.js
│       │   └── 📜 exam.js
│       ├── 📂 middleware/            # Промежуточное ПО
│       │   ├── 📜 auth.js                 # Проверка JWT токена
│       │   ├── 📜 validate.js             # Валидация входящих данных
│       │   └── 📜 errorHandler.js         # Глобальная обработка ошибок
│       ├── 📂 services/              # Внешние интеграции и сложная логика
│       │   ├── 📜 openaiService.js        # Взаимодействие с OpenAI API
│       │   └── 📜 socketService.js        # Настройка WebSocket (Socket.io)
│       └── 📂 utils/                 # Вспомогательные утилиты
│           └── 📜 validation.js
│
└── 📂 frontend/                      # Клиентская часть (Next.js 13+ App Router)
    ├── ⚙️ next.config.js             # Конфигурация Next.js
    ├── ⚙️ tailwind.config.js         # Конфигурация стилей
    ├── 📜 package.json               # Зависимости фронтенда
    ├── 📂 public/                    # Статические файлы (картинки, иконки)
    ├── 📂 lib/                       # Библиотеки и настройки
    │   ├── 📜 api.js                      # Axios инстанс и запросы к API
    │   └── 📜 socket.js                   # Клиентская настройка сокетов
    ├── 📂 components/                # Переиспользуемые UI компоненты
    │   ├── 📜 Navbar.js
    │   ├── 📜 LoadingSpinner.js
    │   └── 📜 ProtectedRoute.js
    └── 📂 app/                       # Страницы и роутинг
        ├── 📜 layout.js                   # Основной макет приложения
        ├── 📜 page.js                     # Главная страница (Landing)
        ├── 📂 login/                      # Страница входа
        ├── 📂 register/                   # Страница регистрации
        ├── 📂 dashboard/                  # Личный кабинет пользователя
        ├── 📂 summary/                    # Раздел с краткими содержаниями
        ├── 📂 test/                       # Раздел тестирования
        ├── 📂 code-check/                 # Раздел проверки кода
        ├── 📂 cheatsheet/                 # Раздел шпаргалок
        └── 📂 exam/                       # Режим экзамена)


```


---

## 🛠️ Установка и запуск

### Предварительные требования

- **Node.js** 20+ ([скачать](https://nodejs.org/))
- **npm** или **yarn**
- **MongoDB** 7+ ([скачать](https://www.mongodb.com/try/download/community)) или Docker
- **OpenAI API Key** ([получить здесь](https://platform.openai.com/api-keys))

---



#### Клонируйте репозиторий

```bash
git clone https://github.com/your-username/ai-study-assistant.git
cd ai-study-assistant
