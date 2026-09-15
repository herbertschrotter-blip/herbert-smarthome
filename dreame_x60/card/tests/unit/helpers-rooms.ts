// Räume des Heidi-Abzugs für Tests (dieselbe Regel wie das Geräteprofil): Kurznamen wie v1 (Wohnz., Küche, Büro, Flur, WC, Schlafz., Bad).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { roomsFromMap } from '../../src/domain/rooms';
import type { RoomInfo } from '../../src/domain/rooms';
import type { States } from '../../src/ha/types';

const FIX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const docked = JSON.parse(fs.readFileSync(path.join(FIX, 'states-docked.json'), 'utf8')) as States;
export const HEIDI_ROOMS: readonly RoomInfo[] = roomsFromMap(docked['camera.heidi_map']!.attributes.rooms as Record<string, never>);
export const HEIDI_ROOM_IDS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];
