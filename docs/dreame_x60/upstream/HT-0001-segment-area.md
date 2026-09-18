# Fehlerbericht für Tasshack/dreame-vacuum – HT-0001 (Stand 18.09.2026)

Fertiger Text für ein GitHub-Issue bei <https://github.com/Tasshack/dreame-vacuum/issues>. **Abschicken macht Herbert**
(oder Claude nur nach ausdrücklichem OK). Vorher dort kurz suchen, ob es den Bericht schon gibt (`Segment area AttributeError`).
Herkunft: Ticket HT-0001, ClickUp DX-070, Bauplan Abschnitt 10 (18.09.2026).

---

**Title:** `Map render Failed: AttributeError: 'Segment' object has no attribute 'area'` when the map has a hidden/unmapped room

**Integration version:** v2.0.0b25 (HACS, beta) · **Home Assistant:** OS 2026.7 · **Device:** Dreame X60 Ultra (`dreame.vacuum.r6001a`)

**Describe the bug**

As soon as the map contains a room without coordinates (in my case room 8, a balcony that I set to *hidden* in the Dreame app),
almost every map render fails. The camera image is then only redrawn right after a map id change; during a cleaning run the
robot position and path do not update any more.

On one day (debug log from 07:35 to 22:24): 7 successful `Render frame` lines vs. 110 `Map render Failed`.
After making the room visible again in the app: 26 successful renders in a 60 s run, 0 failures.

**Log**

```
ERROR (MainThread) [custom_components.dreame_vacuum.dreame.map] Map render Failed: Traceback (most recent call last):
  File "/config/custom_components/dreame_vacuum/dreame/map.py", line 8988, in render_map
    or self._map_data.segments != map_data.segments
  File "/config/custom_components/dreame_vacuum/dreame/types.py", line 3787, in __eq__
    or self.area != other.area
AttributeError: 'Segment' object has no attribute 'area'
```

**Cause**

`Segment.__init__` (types.py) only sets `self.area` when all four coordinates are given:

```python
if x1 != None and x0 != None and y1 != None and y0 != None:
    self.area = abs(x1 - x0) * abs(y1 - y0)
```

but `map.py` (around line 4615) creates segments for unmapped rooms without coordinates:

```python
target_seg = Segment(seg_id) if is_unmmaped else segments[seg_id]
```

and `Segment.__eq__` always reads `self.area`. `render_map` compares `self._map_data.segments != map_data.segments`,
which calls `__eq__` for every room and raises for the room without coordinates. It only works when `self._map_data is None`
(right after a map id change), because the comparison is skipped then.

**Suggested fix** (one line, works for me)

```python
        self.set_name()
        self.area = None
        if x1 != None and x0 != None and y1 != None and y0 != None:
            self.area = abs(x1 - x0) * abs(y1 - y0)
```

**To reproduce**

1. Map with a room that has no area / is hidden in the app (room attributes in `camera.<name>_map`: `x0`…`y1` empty, `visibility: Hidden`).
2. Start a cleaning run and watch the log: `Map render Failed` every ~10 s, camera image does not update.
