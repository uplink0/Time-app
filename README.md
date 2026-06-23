# Time App

Веб-приложение для отображения и управления временем с разделением на Frontend и Backend сервисы.

## Технологии

### Frontend

* Vue 3
* Vite
* JavaScript

### Backend

* Node.js
* Express
* MySQL

### DevOps

* Docker
* Docker Compose
* Git

---

## Архитектура проекта

#Structure
Frontend (Vue)
       |
       v
Backend (Node.js API)
       |
       v
MySQL Database

---

## Структура проекта

#Structure
time-app/
│
├── api/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── README.md
└── .gitignore

---

## Запуск через Docker

#Сборка контейнеров:

#bash
docker compose build


#Запуск приложения:

#bash
docker compose up -d

#Проверка контейнеров:
#bash
docker ps


Просмотр логов:

#bash
docker compose logs -f


Остановка приложения:

#bash
docker compose down


---

## Запуск без Docker

### Backend

Перейти в папку API:

#bash
cd api


Установить зависимости:

#bash
npm install

#Запустить сервер:

#bash
npm start


---

### Frontend

#Перейти в папку frontend:
#bash
cd frontend


Установить зависимости:

#bash
npm install


#Запустить приложение:

#bash
npm run dev


---

## Используемые порты

| Сервис      | Порт |
| ----------- | ---- |
| Frontend    | 5173 |
| Backend API | 3000 |
| MySQL       | 3306 |

---

## Возможности проекта

* Работа с текущим временем
* REST API
* Docker-контейнеризация
* Разделение Frontend и Backend
* Подготовка к развертыванию в Kubernetes

---

## Цели проекта

Проект создан в учебных целях для изучения:

* Git
* Docker
* Docker Compose
* Frontend / Backend взаимодействия
* Основ DevOps практик

---

## Автор

Ivan K.

System Administrator / DevOps Engineer
