/**
 * openNow(open, date = new Date()):
 *  - open is an object like { mon:[10,22], tue:[10,22] ... } in 24h local time
 *  - returns boolean
 */
export function openNow(open, date = new Date()) {
  if (!open) return true; // assume open if unknown
  const days = ["sun","mon","tue","wed","thu","fri","sat"];
  const day = days[date.getDay()];
  const slot = open[day];
  if (!slot) return true;
  let [start, end] = slot;
  // handle overnight e.g. 11 -> 2 means 23:00-02:00
  const hour = date.getHours();
  if (start <= end) {
    return hour >= start && hour < end;
  } else {
    return hour >= start || hour < end;
  }
}
