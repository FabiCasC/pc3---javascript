# Guía de Despliegue en Vercel

## ✅ Checklist Pre-Despliegue

### 1. Configuración del Proyecto
- ✅ **vercel.json** creado con configuración correcta
- ✅ **package.json** con script `build` configurado
- ✅ **vite.config.ts** configurado correctamente
- ✅ **index.html** en la raíz del proyecto

### 2. Configuración de Firebase
- ✅ Firebase configurado en `src/lib/firebase.ts`
- ⚠️ **Nota**: Las credenciales están hardcodeadas. Para producción, considera usar variables de entorno.

### 3. Archivos de Configuración
- ✅ `.gitignore` configurado (excluye node_modules, dist, .env, etc.)
- ✅ `vercel.json` creado con rewrites para SPA

## 🚀 Pasos para Desplegar en Vercel

### Opción 1: Desde la Interfaz Web de Vercel (Recomendado)

1. **Crear cuenta/Iniciar sesión en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub, GitLab o Bitbucket

2. **Conectar repositorio**
   - Si no tienes el proyecto en Git, primero créalo:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <tu-repo-url>
     git push -u origin main
     ```

3. **Importar proyecto en Vercel**
   - En el dashboard de Vercel, haz clic en "Add New Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente que es un proyecto Vite

4. **Configuración del proyecto**
   - **Framework Preset**: Vite (debería detectarse automáticamente)
   - **Build Command**: `pnpm run build` (o `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (o `npm install`)

5. **Variables de Entorno (Opcional)**
   - Si decides usar variables de entorno para Firebase en el futuro:
     - Ve a Settings → Environment Variables
     - Agrega las variables necesarias

6. **Desplegar**
   - Haz clic en "Deploy"
   - Espera a que termine el build
   - Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Desde la CLI de Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   # o
   pnpm add -g vercel
   ```

2. **Iniciar sesión**
   ```bash
   vercel login
   ```

3. **Desplegar**
   ```bash
   vercel
   ```

4. **Para producción**
   ```bash
   vercel --prod
   ```

## 📋 Configuración en Vercel

### Configuración Automática (vercel.json)

El archivo `vercel.json` ya está configurado con:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Rewrites para SPA

Los rewrites son importantes porque esta es una Single Page Application (SPA) con React Router. Todas las rutas deben redirigir a `index.html` para que el cliente pueda manejar el enrutamiento.

## 🔧 Configuración de Firebase

### Dominios Autorizados

Después del despliegue, debes agregar tu dominio de Vercel a Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto `creaza-146d4`
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Agrega tu dominio de Vercel (ej: `tu-proyecto.vercel.app`)

### Reglas de Firestore

Asegúrate de que las reglas de Firestore estén configuradas correctamente. Ver `REGLAS_FIRESTORE.md` (si existe) o la documentación en `CAPITULO_III.md`.

## 🧪 Verificar el Despliegue

Después del despliegue, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El login funciona
3. ✅ El registro funciona
4. ✅ Las rutas funcionan (no hay errores 404)
5. ✅ Las imágenes se cargan correctamente
6. ✅ Firebase está conectado correctamente

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica que el script `build` funcione localmente
- Revisa los logs de build en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: "404 en rutas"
- Verifica que `vercel.json` tenga los rewrites configurados
- Asegúrate de que el output directory sea `dist`

### Error: "Firebase not initialized"
- Verifica que las credenciales de Firebase estén correctas
- Asegúrate de que el dominio esté autorizado en Firebase Console

### Error: "Module not found"
- Verifica que todas las importaciones usen rutas relativas o alias correctos
- Asegúrate de que `vite.config.ts` tenga el alias `@` configurado

## 📝 Notas Importantes

1. **Credenciales de Firebase**: Actualmente están hardcodeadas en el código. Para mayor seguridad, considera usar variables de entorno.

2. **Build Command**: Vercel detectará automáticamente Vite, pero si tienes problemas, especifica `pnpm run build` en la configuración.

3. **Node Version**: Vercel usará la versión de Node especificada en `package.json` o una por defecto. Si necesitas una versión específica, agrega `.nvmrc` o configura en Vercel.

4. **Caché**: Vercel cachea `node_modules` automáticamente para builds más rápidos.

## 🎉 ¡Listo!

Una vez desplegado, tu aplicación estará disponible en:
- **URL de producción**: `https://tu-proyecto.vercel.app`
- **URL de preview**: Se genera automáticamente para cada push (si tienes Git conectado)

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a tu repositorio conectado, Vercel desplegará automáticamente una nueva versión (si tienes auto-deploy habilitado).

