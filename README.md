# Sistema Cooperativa Frontend

Frontend web para el Sistema de Gestión Cooperativa Agrícola, desarrollado con React, Vite y Tailwind CSS.

## 🚀 Características Implementadas

### ✅ T011 - Autenticación y Gestión de Sesiones
- Login con JWT tokens
- Gestión automática de sesiones
- Verificación de estado de autenticación
- Logout seguro con limpieza de tokens

### ✅ T013 - Bitácora de Auditoría Básica
- Vista completa de auditoría del sistema
- Filtros por tipo de actividad (login, usuarios, errores)
- Búsqueda en tiempo real
- Exportación a CSV
- Paginación de resultados

### ✅ T020 - Diseño Inicial de Interfaces (Login)
- Página de login con diseño moderno
- Glassmorphism y gradientes emerald
- Formulario responsive con validaciones
- Animaciones y efectos visuales

### ✅ T023 - Implementación de Cierre de Sesión
- Logout desde navbar
- Confirmación de cierre de sesión
- Limpieza completa de datos locales
- Redirección automática al login

### ✅ T026 - Vistas Móviles para Login y Consulta
- Diseño completamente responsive
- Sidebar colapsable en móviles
- Navegación touch-friendly
- Optimización para diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Axios** - Cliente HTTP para APIs
- **React Router** - Navegación SPA
- **Lucide React** - Iconos
- **JWT** - Autenticación basada en tokens

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Backend Django corriendo en `http://localhost:8000`

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la URL del backend:**
   - Editar `src/api/authService.js`
   - Cambiar `API_BASE_URL` si es necesario

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación:**
   - Abrir `http://localhost:5173` en el navegador
   - Ir a `/login` para iniciar sesión

## 🔧 Configuración del Backend

Asegúrate de que el backend Django esté corriendo y tenga los siguientes endpoints:

### Endpoints de Autenticación
- `POST /api/auth/login/` - Login de usuarios
- `POST /api/auth/logout/` - Logout de usuarios
- `GET /api/auth/status/` - Estado de la sesión
- `GET /api/auth/session-info/` - Información de la sesión

### Endpoints de Bitácora
- `GET /api/bitacora/` - Lista de registros de auditoría

## 🎨 Diseño y UI/UX

### Paleta de Colores
- **Primario:** Emerald (#10b981)
- **Fondo:** Gradiente de emerald-950 a emerald-900
- **Texto:** Blanco con opacidades variables
- **Glass Effect:** rgba(255, 255, 255, 0.1) con backdrop-blur

### Componentes Principales
- **LoginPage:** Autenticación con diseño moderno
- **MainLayout:** Layout principal con sidebar y navbar
- **Dashboard:** Vista general con estadísticas
- **AuditoriaPage:** Gestión de bitácora de auditoría
- **SociosPage:** Gestión básica de socios

## 📱 Responsive Design

- **Desktop:** Layout completo con sidebar expandido
- **Tablet:** Sidebar colapsable
- **Mobile:** Sidebar oculto por defecto, navegación touch

## 🔐 Seguridad

- Tokens JWT almacenados en localStorage
- Interceptors de axios para manejo automático de tokens
- Verificación automática de expiración de sesión
- Logout forzado en caso de tokens inválidos

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Preview del Build
```bash
npm run preview
```

## 📋 Estructura del Proyecto

```
src/
├── api/
│   └── authService.js          # Servicios de API
├── components/
│   ├── Auth/
│   │   └── LoginPage.jsx       # Página de login
│   └── Layout/
│       ├── MainLayout.jsx      # Layout principal
│       ├── Navbar.jsx          # Barra de navegación
│       └── Sidebar.jsx         # Sidebar de navegación
├── context/
│   └── AuthContext.jsx         # Contexto de autenticación
├── pages/
│   ├── DashboardPage.jsx       # Dashboard principal
│   ├── AuditoriaPage.jsx       # Página de auditoría
│   └── SociosPage.jsx          # Gestión de socios
├── App.jsx                     # Componente principal
├── main.jsx                    # Punto de entrada
└── index.css                   # Estilos globales
```

## 🔧 Desarrollo

### Comandos Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Ejecutar linter

### Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas:
- Revisar la documentación del backend
- Verificar logs de la consola del navegador
- Asegurarse de que el backend esté corriendo correctamente
