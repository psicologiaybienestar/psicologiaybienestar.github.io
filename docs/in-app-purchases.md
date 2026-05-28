# In-App Purchases — Apoyar Compra (1 USD)

Guía para implementar un botón de "Apoyar compra" de 1 USD usando **Capacitor In-App Purchases** (plugin `@capacitor/inapppurchase`) para Android.

---

## 1. Requisitos previos

| Recurso | Estado |
|---|---|
| Cuenta Google Play Developer | $25 USD (único pago) |
| App publicada en Google Play (al menos en Closed/Internal Testing) | Necesaria para probar |
| Dispositivo Android físico (o emulador con Play Store) | Para testing |
| Android APK firmado con release keystore | Necesario para Google Play |

---

## 2. Google Play Console — Configuración

### 2.1 Crear el producto in-app

1. Ir a [Google Play Console](https://play.google.com/console/)
2. Seleccionar la app → **Monetize** → **Products** → **In-app products**
3. Click **Create product**
4. Completar:

| Campo | Valor |
|---|---|
| Product ID | `apoyo_1_usd` |
| Product type | **Managed product** (compra única, no suscripción) |
| Name (título) | "Apoyo a Psicología & Bienestar" |
| Description | "Ayúdanos a seguir creando contenido de bienestar mental" |
| Price | 1 USD (o equivalente local) |
| Status | **Active** |

5. Click **Save**

### 2.2 Configurar pruebas

- En **Setup** → **License Testing**, agregar cuentas de Gmail de测试adores
- Las cuentas de测试ador NO pagan realmente
- Usar cuentas @gmail.com reales (no @test.com)

### 2.3 Publicar producto

- El producto debe tener estado **Active** y estar asociado a una **versión publicada** de la app (puede ser Internal Testing)
- Internal Testing: Subir APK firmado → Internal Testing → Agregar测试adores → Publicar

---

## 3. Plugin Capacitor para IAP

### 3.1 Instalación

Recomendamos: **@capacitor/inapppurchase** (community plugin mantenido)

```bash
npm install @capacitor/inapppurchase
npx cap sync android
```

### 3.2 Alternativas

| Plugin | Notas |
|---|---|
| `@capacitor/inapppurchase` | Recomendado, API limpia, mantenido activamente |
| `cordova-plugin-purchase` | Más maduro pero pesado; requiere wrapping |

---

## 4. Implementación en Angular

### 4.1 Servicio de compras

```typescript
// shared/services/purchase.service.ts
import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';

export const SUPPORT_PRODUCT_ID = 'apoyo_1_usd';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  constructor(private platform: PlatformService) {}

  async buySupport(): Promise<boolean> {
    if (!this.platform.isAndroid) {
      window.open('https://psicologiaybienestar.netlify.app/apoyar', '_blank');
      return false;
    }

    try {
      const { InAppPurchase } = await import('@capacitor/inapppurchase');

      // 1. Conectar a Google Play
      await InAppPurchase.connect();

      // 2. Obtener detalles del producto
      const products = await InAppPurchase.getProducts({
        productIds: [SUPPORT_PRODUCT_ID],
      });

      if (!products.products.length) {
        console.warn('[Purchase] Producto no encontrado en Google Play');
        return false;
      }

      // 3. Iniciar compra
      const purchase = await InAppPurchase.purchaseProduct({
        productId: SUPPORT_PRODUCT_ID,
      });

      // 4. Consumir (para permitir compras múltiples)
      if (purchase.purchaseToken) {
        await InAppPurchase.consumePurchase({
          purchaseToken: purchase.purchaseToken,
        });
      }

      console.log('[Purchase] Compra exitosa:', purchase);
      return true;
    } catch (e: any) {
      console.warn('[Purchase] Error:', e?.message || e);
      return false;
    } finally {
      try {
        const { InAppPurchase } = await import('@capacitor/inapppurchase');
        await InAppPurchase.disconnect();
      } catch { /* ignore */ }
    }
  }
}
```

### 4.2 Botón en Configuración y Minijuegos

El botón "Apoyar compra" aparece en **dos** secciones de la app Android:

1. **Configuración** (`configuracion.component.ts`) — en la sección de estadísticas
2. **Minijuegos** (`minijuegos.component.ts`) — como tarjeta `support-card` debajo del "Próximamente"

Ambos botones llaman al mismo método `buySupport()`.

#### Configuración

```html
<button class="support-btn" (click)="buySupport()">
  <app-icon name="heart"></app-icon>
  Apoyar con 1 USD
</button>
```

#### Minijuegos

```html
<div class="support-card glass-card-strong">
  <div class="support-header">
    <div class="support-icon"><app-icon name="settings"></app-icon></div>
    <div class="support-text">
      <h3>Apoya el desarrollo de la app</h3>
      <p>Tu apoyo nos ayuda a seguir mejorando y creando nuevas herramientas para ti.</p>
    </div>
  </div>
  <button class="btn-support" (click)="buySupport()">
    <app-icon name="heart-outline"></app-icon> Apoyar con compra
  </button>
</div>
```

#### Método compartido

```typescript
async buySupport() {
  const success = await this.purchaseService.buySupport();
  if (success) {
    // Mostrar toast de agradecimiento
    const toast = await this.toastController.create({
      message: 'Gracias por tu apoyo!',
      duration: 3000,
      color: 'success',
    });
    await toast.present();
  }
}
```

---

## 5. Testing

### 5.1 Cuentas de prueba

1. En Google Play Console → **Setup** → **License Testing**
2. Agregar hasta 100 cuentas Gmail
3. Esas cuentas pueden comprar el producto sin cargo real
4. Los测试adores deben:
   - Tener la app instalada desde Internal Testing (no debug APK)
   - Estar logueados con su cuenta de测试ador en Google Play

### 5.2 Flujo de prueba

1. Subir APK firmado a Internal Testing
2. Agregar测试adores via Google Groups
3. Los测试adores reciben link de opt-in
4. Una vez aceptado, abren Play Store → ven "Instalar"
5. Abren la app → click en "Apoyar compra"
6. Google Play muestra el diálogo de compra (sin cobro real)
7. Se completa la transacción → se consume el producto

### 5.3 Productos no consumibles vs consumibles

| Tipo | Uso |
|---|---|
| **Consumible** | El usuario puede comprar múltiples veces (recomendado para "apoyo") |
| **No consumible** | Compra única permanente (ej. "Eliminar anuncios") |

Para "apoyo", usar **consumible** (managed product) y **consumir** tras cada compra para permitir compras repetidas.

---

## 6. Google Play Console — Data Safety

Agregar en la sección "Data Safety":

- **Financial info**: In-app purchases → Sí
- **Tipo**: Purchase history (no se almacena el historial de compras en la app; Google Play lo maneja)

---

## 7. Seguridad

### 7.1 No hardcodear claves

- No incluir Google Play Service Account keys en el código
- La verificación de la compra se hace del lado de Google Play automáticamente
- Recomendado: Verificar el purchaseToken contra el backend (Supabase Edge Function) para evitar fraudes

### 7.2 Server-side verification (opcional pero recomendado)

```typescript
// Edge Function: verify-purchase
// Recibe purchaseToken + productId
// Usa Google Play Developer API para verificar
// Devuelve { valid: boolean }
```

### 7.3 Consumir siempre

- Siempre llamar `consumePurchase()` tras una compra exitosa
- Si no se consume, el usuario no podrá comprar de nuevo (Google Play lo trata como "ya comprado")

---

## 8. Flujo completo

```
Usuario → click "Apoyar con 1 USD"
  → PurchaseService.buySupport()
    → InAppPurchase.connect()
    → InAppPurchase.getProducts(['apoyo_1_usd'])
    → InAppPurchase.purchaseProduct('apoyo_1_usd')
    → Google Play muestra diálogo de pago
    → Usuario confirma
    → Purchase exitoso → purchaseToken
    → InAppPurchase.consumePurchase(purchaseToken)
    → InAppPurchase.disconnect()
  → Toast: "Gracias por tu apoyo!"
```

---

## 9. Posibles errores y soluciones

| Error | Causa | Solución |
|---|---|---|
| "Product not found" | Product ID incorrecto o no publicado | Verificar en Google Play Console que el producto esté **Active** |
| "Unable to connect" | Dispositivo no tiene Play Store | Probar en dispositivo físico |
| "Item already owned" | No se consumió la compra anterior | Llamar `consumePurchase()` |
| "Purchase canceled" | Usuario canceló | Es normal; no mostrar error |
| "Billing unavailable" | Dispositivo no soporta Google Play | Mostrar mensaje amigable |

---

## 10. Resumen de archivos a modificar

| Archivo | Acción |
|---|---|---|
| `shared/services/purchase.service.ts` | Crear (código de compra) |
| `shared/services/index.ts` | Agregar export |
| `apps/android/src/app/pages/configuracion/configuracion.component.ts` | Agregar botón + método |
| `apps/android/src/app/pages/minijuegos/minijuegos.component.ts` | Conectar botón existente a `buySupport()` |
| `apps/web/src/app/core/services/purchase.service.ts` | Re-export (opcional) |
| `apps/android/src/app/app.component.ts` | Inyectar PurchaseService |

---

## 11. Referencias

- [Google Play Billing Library](https://developer.android.com/google/play/billing)
- [Capacitor InAppPurchase](https://github.com/capacitor-community/inapppurchase)
- [Google Play Console](https://play.google.com/console/)
