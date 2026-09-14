# COTIZAPRO 🛡️📹
### Sistema Web Profesional de Cotizaciones para Venta de Productos Tecnológicos y Seguridad Electrónica

**COTIZAPRO** es una plataforma web moderna, rápida y de nivel empresarial diseñada específicamente para negocios de seguridad electrónica, videovigilancia (CCTV), redes y equipamiento tecnológico. Permite emitir cotizaciones formales con estética corporativa en segundos, calcular automáticamente impuestos y descuentos sin discrepancias de centavos, generar documentos PDF listos para imprimir y enviar propuestas por WhatsApp y correo electrónico con un solo clic.

---

## 🚀 Características Principales

- **Dashboard Inteligente**: Indicadores clave de desempeño (KPIs) en tiempo real: valor total cotizado, cotizaciones por mes, ventas potenciales en trámite, tasa de conversión y ticket promedio.
- **Gráficos Estadísticos Interactivos**: Implementados con Recharts (Evolución de montos por mes, distribución por estados de cotización y productos más cotizados).
- **Catálogo de Productos de Seguridad**: CRUD completo para cámaras IP/HD, DVRs, NVRs, discos duros de videovigilancia, cableado estructurado Cat6, fuentes conmutadas, racks, UPS y accesorios con cálculo de margen de ganancia en vivo.
- **Directorio de Clientes**: Gestión integral de personas naturales y empresas jurídicas con validación formal de Cédula y RUC de Ecuador.
- **Cotizador Dinámico de Alta Velocidad (`/cotizaciones/nueva`)**:
  - Selección rápida de clientes con modal integrado para crear clientes sin salir del cotizador.
  - Buscador de productos con inserción ágil y modal de producto rápido.
  - Modificación en línea de cantidades, precios unitarios y descuentos individuales.
  - Autoguardado de borrador en el navegador (`localStorage`) para recuperar el trabajo en caso de cierre accidental de la ventana.
- **Motor Financiero de Precisión Estricta**: Control aritmético a nivel de centavos que elimina anomalías de coma flotante de JavaScript (como `$99.999999`), desglosando subtotal, base imponible, IVA configurable (15% vigente en Ecuador) y total neto.
- **Documentos PDF de Nivel Corporativo**: Generación vectorial con `jsPDF` y `jspdf-autotable`, incluyendo membrete empresarial, datos fiscales, tabla de productos, liquidación y condiciones comerciales.
- **Canales de Compartición Directa**: Enlaces compatibles con el navegador para enviar cotizaciones por **WhatsApp** y **Correo Electrónico (mailto)** con mensajes preformateados.
- **Copias de Seguridad (Backup)**: Exportación e importación completa de la base de datos en formato JSON con validación rigurosa de esquema antes de restaurar.
- **Modo Oscuro (🌙) y Claro (☀️)**: Diseño tipo Dashboard tecnológico adaptable a cualquier preferencia visual.
- **100% Responsivo**: Compatible con teléfonos inteligentes, tablets, laptops y pantallas de escritorio.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador & Servidor**: [Vite](https://vitejs.dev/)
- **Estilos & UI**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Enrutamiento**: [React Router](https://reactrouter.com/) (con `HashRouter` para compatibilidad absoluta en GitHub Pages)
- **Generación de PDF**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Gráficos Estadísticos**: [Recharts](https://recharts.org/)
- **Pruebas Unitarias**: [Vitest](https://vitest.dev/)

---

## 📐 Arquitectura del Software: Local-First

La aplicación opera bajo el paradigma **Local-First**, lo que significa que:
1. **No requiere un backend obligatorio**: Todo el procesamiento, persistencia y generación de documentos se realiza en el cliente mediante la API nativa de `localStorage`.
2. **Costo Cero de Infraestructura**: Puede ser alojada en plataformas estáticas gratuitas como **GitHub Pages**.
3. **Capa de Abstracción Limpia**: El acceso a datos está centralizado en `storageService.ts`, permitiendo que en el futuro se conecte un backend como **Supabase** o **PostgreSQL** para convertir el sistema en multiusuario sin necesidad de rediseñar las pantallas ni la lógica de negocio.

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el repositorio:
```bash
git clone https://github.com/BAZTP/AS.git
cd AS
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Ejecutar en modo desarrollo:
```bash
npm run dev
```
Abre tu navegador en la dirección indicada en la terminal (usualmente `http://localhost:5173/`).

### 4. Ejecutar pruebas unitarias:
```bash
npm test
```

### 5. Compilar para producción:
```bash
npm run build
```

### 6. Previsualizar la versión compilada:
```bash
npm run preview
```

---

## 🌐 Despliegue en GitHub Pages

El proyecto está preconfigurado para desplegarse automáticamente en:

> **URL de Despliegue**: `https://baztp.github.io/AS/`

### Pasos para publicar:

1. **Subir el código a la rama `main` en GitHub**:
   ```bash
   git add .
   git commit -m "feat: Lanzamiento de COTIZAPRO v1.0.0"
   git branch -M main
   git remote add origin https://github.com/BAZTP/AS.git # (si no está agregado)
   git push -u origin main
   ```

2. **Habilitar GitHub Actions en tu repositorio**:
   - Ve a tu repositorio en GitHub: `https://github.com/BAZTP/AS`
   - Haz clic en la pestaña **Settings** (Configuración).
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - En la sección **Build and deployment > Source**, selecciona: **GitHub Actions**.

3. **¡Listo!**:
   El flujo automatizado en `.github/workflows/deploy.yml` compilará la aplicación, ejecutará las pruebas y publicará el sitio web en cuestión de minutos.

---

## 🔒 Seguridad y Privacidad

- Esta versión está pensada para ser **Monousuario / Local-First**.
- Los datos se almacenan exclusivamente en el almacenamiento local (`localStorage`) del navegador del usuario.
- **No se almacenan contraseñas ni secretos**: No existe un sistema de login falso que genere una falsa sensación de seguridad. Toda la gestión es privada para el usuario del dispositivo.
- Para salvaguardar tu información, utiliza periódicamente el botón **Exportar Respaldo** en la sección *Configuración*.

---

## 🗺️ Roadmap Futuro (Versión 2.0)

Para transformar COTIZAPRO en una plataforma SaaS empresarial en la nube:
- [ ] Integración con **Supabase** (Autenticación real, PostgreSQL y Row Level Security).
- [ ] Soporte para **múltiples usuarios y roles** (Administrador, Vendedor, Supervisor).
- [ ] Control y sincronización de **inventario de stock en tiempo real**.
- [ ] Integración con facturación electrónica autorizada por el SRI (Ecuador).
- [ ] Portal web para que los clientes aprueben o firmen cotizaciones digitalmente en línea.

---

## 📄 Licencia

Desarrollado con altos estándares de calidad de software comercial. Distribuido para fines empresariales y comerciales.
