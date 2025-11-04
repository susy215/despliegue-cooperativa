# 📱 Cooperativa PWA

Tu aplicación ahora es una **Progressive Web App (PWA)** ✨

## 🎯 ¿Qué se implementó?

### ✅ Características PWA habilitadas:

1. **Service Worker** - Funcionalidad offline y caché
2. **Manifest** - Permite instalar la app en dispositivos móviles
3. **Iconos** - Iconos SVG para la aplicación
4. **Caché de API** - Las llamadas a `localhost:8000/api/*` se cachean (NetworkFirst)
5. **Auto-actualización** - La PWA se actualiza automáticamente cuando hay cambios

## 🚀 Cómo usar

### En desarrollo:
```bash
npm run dev
```

### Construir para producción:
```bash
npm run build
```

### Vista previa de producción:
```bash
npm run preview
```

## 📲 Instalar la PWA

### En Chrome/Edge (Desktop):
1. Abre tu app en el navegador
2. Busca el icono de instalación en la barra de direcciones (➕)
3. Haz clic en "Instalar"

### En móviles (Android/iOS):
1. Abre tu app en Chrome (Android) o Safari (iOS)
2. En el menú, selecciona "Agregar a la pantalla de inicio"
3. La app se instalará como una aplicación nativa

## 🔧 Configuración

### Service Worker
El service worker se registra automáticamente en `src/main.jsx` y:
- Cachea todos los assets estáticos (JS, CSS, HTML, imágenes)
- Implementa estrategia NetworkFirst para llamadas API
- Caché expira después de 1 hora
- Máximo 50 entradas en caché

### Manifest
Ubicado en `public/manifest.json`:
- Nombre: Cooperativa
- Tema: #4F46E5 (Indigo)
- Display: standalone (se ve como app nativa)

### Iconos
Los iconos están en formato SVG:
- `icon.svg` - Icono principal
- `icon-192x192.svg` - Para pantallas pequeñas
- `icon-512x512.svg` - Para pantallas grandes

## 🌐 Despliegue en Vercel

Tu configuración `vercel.json` ya está correcta. Solo necesitas:

```bash
# Desde tu carpeta del proyecto
git add .
git commit -m "🚀 Convertida a PWA"
git push
```

Vercel detectará automáticamente los cambios y desplegará tu PWA.

## 🔍 Verificar PWA

Después del despliegue, abre Chrome DevTools:
1. Ve a la pestaña **Application**
2. Revisa:
   - **Manifest** - Debe mostrar la configuración
   - **Service Workers** - Debe estar registrado
   - **Storage** - Verás el caché de Workbox

### Test de PWA
Usa [Lighthouse](https://developers.google.com/web/tools/lighthouse) en Chrome DevTools:
1. DevTools → Lighthouse tab
2. Selecciona "Progressive Web App"
3. Click "Generate report"

## 📝 Notas importantes

- ⚠️ **Service Workers solo funcionan en HTTPS** (excepto localhost)
- ⚠️ **En producción (Vercel), funcionará automáticamente con HTTPS**
- ✅ **El backend Django en localhost:8000 se cachea con estrategia NetworkFirst**
- ✅ **Los cambios se propagan automáticamente (no necesitas limpiar caché)**

## 🛠️ Backend Django

Tu backend Django sigue funcionando igual en `localhost:8000`. La PWA se conectará normalmente a él, pero ahora con caché inteligente.

## 📦 Archivos agregados

```
public/
  ├── manifest.json          # Configuración PWA
  ├── icon.svg              # Icono principal
  ├── icon-192x192.svg      # Icono 192x192
  └── icon-512x512.svg      # Icono 512x512

vite.config.js              # Configuración PWA con vite-plugin-pwa
index.html                  # Meta tags PWA agregados
src/main.jsx               # Registro de Service Worker
```

## 🎨 Personalización

### Cambiar colores:
Edita `vite.config.js` y `public/manifest.json`:
```javascript
theme_color: '#4F46E5',        // Color de la barra superior
background_color: '#ffffff',   // Color de fondo al iniciar
```

### Cambiar iconos:
Reemplaza los archivos SVG en `public/` con tus propios iconos.

### Modificar caché:
En `vite.config.js` → `workbox.runtimeCaching`:
```javascript
maxAgeSeconds: 60 * 60,  // Duración del caché
maxEntries: 50,          // Número máximo de entradas
```

## ✨ ¡Listo!

Tu aplicación ahora es una PWA completa. Despliégala en Vercel y podrás instalarla en cualquier dispositivo como una app nativa. 🎉
