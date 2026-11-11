export const STORAGE_PREFIX = 'daily-vitamins:v1:';

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export class VitaminTracker {
  constructor(storage, now = () => new Date()) {
    this.storage = storage;
    this.now = now;
    this.unsaved = new Map();
    this.storageError = false;
    this.badRecord = false;
  }

  key(date, index) { return `${STORAGE_PREFIX}${date}:${index}`; }

  read(date, index) {
    const key = this.key(date, index);
    let value = null;
    if (this.unsaved.has(key)) return this.unsaved.get(key);
    try { value = this.storage.getItem(key); }
    catch { this.storageError = true; }
    if (value === null) return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) {
      this.badRecord = true;
      return null;
    }
    return value;
  }

  snapshot() {
    this.badRecord = false;
    const date = localDateKey(this.now());
    const taken = [this.read(date, 0), this.read(date, 1)];
    const warning = this.storageError || this.unsaved.size
      ? 'Changes are not saved reliably. Keep this page open; browser storage is unavailable.'
      : this.badRecord ? 'A saved record could not be read. Check your status before marking it again.' : '';
    return { date, taken, warning };
  }

  toggle(index) {
    if (index !== 0 && index !== 1) throw new RangeError('Unknown vitamin');
    const now = this.now();
    const date = localDateKey(now);
    const key = this.key(date, index);
    const value = this.read(date, index) ? null : now.toISOString();
    try {
      if (value === null) this.storage.removeItem(key);
      else this.storage.setItem(key, value);
      this.unsaved.delete(key);
    } catch {
      this.storageError = true;
      this.unsaved.set(key, value);
    }
    return this.snapshot();
  }

  history() {
    const today = this.now();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index, 12);
      const date = localDateKey(day);
      return { date, taken: [this.read(date, 0), this.read(date, 1)] };
    });
  }
}
