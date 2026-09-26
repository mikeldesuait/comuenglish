# Sistema de Coaching — Diseño

## Concepto

Un calendario generado automáticamente al configurar el plan, que se
reajusta cuando el usuario no cumple. Nada de recálculo dinámico — es
una planificación fija que se desplaza.

## Flujo

1. Al configurar el plan (onboarding), la app carga TODO el contenido
   del nivel y lo reparte en días hasta el examen.
2. Cada día tiene sus tareas fijas guardadas en el calendario.
3. Al abrir Today, se muestran las tareas de HOY (no se recalculan).
4. Si un día no completas, las pendientes se mueven al día siguiente
   y todo el calendario se desplaza 1 día.
5. Si el desplazamiento impide llegar al examen, la app avisa y sugiere
   ajustes.

## Estructura de datos

```json
{
  "plan": {
    "enabled": true,
    "examDate": "2027-03-15",
    "dailyMinutes": 30,
    "daysPerWeek": 5,
    "targetLevel": "a2",
    "createdAt": "2026-09-26"
  },
  "calendar": {
    "2026-09-26": {
      "dayIndex": 1,
      "tasks": [
        { "id": "a2-u1", "type": "fundamentals", "label": "Unit 1" },
        { "id": "a2-r1", "type": "reading", "label": "Reading 1" }
      ],
      "completed": ["a2-u1"],
      "pending": ["a2-r1"]
    }
  },
  "pendingFromPreviousDays": [],
  "behindDays": 0
}
```

## Tiempos por item

| Tipo         | Minutos |
|--------------|--------:|
| fundamentals |      45 |
| reading      |      20 |
| listening    |      15 |
| writing      |      30 |
| speaking     |      10 |

## Parámetros del sistema

| Parámetro        | Valor                          |
|------------------|--------------------------------|
| Tiempo diario    | Del onboarding, ajustable      |
| Desplazamiento   | Todo el calendario 1 día       |
| Fines de semana  | Descanso (por defecto)         |
| Si no llega      | Avisar + sugerir ajustes       |
| Almacenamiento   | localStorage                   |

## Generación del calendario (algoritmo)

1. Cargar todo el contenido del nivel (units, reading, listening,
   writing, speaking).
2. Estimar tiempo por item según TIME_PER_ITEM.
3. Calcular minutos disponibles por día (80% del tiempo diario).
4. Crear cola con TODOS los items del nivel.
5. Repartir en días hasta el examen.
6. Guardar el calendario completo en state.

## Reajuste (cuando no completas)

1. Detectar días anteriores con tareas pendientes.
2. Desplazar TODAS las tareas desde ese día 1 día adelante.
3. Actualizar behindDays.
4. Si el calendario no llega al examen, avisar.

## Avisos al usuario

- 0 días de retraso: ✅ On track
- 1-5 días: ⚠️ Slightly behind
- 6-15 días: 🔴 Behind — catch up
- 16+ días: 🚨 Way behind — adjust plan

## Opciones de ajuste cuando no llega

- [ ] Study 1.5x more per day
- [ ] Study more days per week
- [ ] Move exam date
- [ ] Reduce target level

## Trabajo estimado

4-6 horas de desarrollo:
- Onboarding nuevo cálculo
- Nuevo sistema de calendario
- Vista "Calendar"
- Reajuste automático
- Integración con Today
- Vista de "behind schedule"

## Prioridad para próxima sesión

1. Estructura de datos (state.js)
2. Generación del calendario (planner.js)
3. Onboarding que genera el calendario
4. Today lee del calendario
5. Reajuste automático
6. Vista Calendar (opcional)
