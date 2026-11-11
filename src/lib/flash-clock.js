// One pending transition only. Generation guards also reject already-queued stale callbacks.
export function createFlashClock(onElapsed, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  let handle = null;
  let generation = 0;
  let disposed = false;
  function stop() {
    generation++;
    if (handle !== null) cancel(handle);
    handle = null;
  }
  return {
    start(milliseconds) {
      stop();
      if (disposed) return;
      const token = generation;
      handle = schedule(() => {
        if (disposed || generation !== token) return;
        handle = null;
        onElapsed();
      },milliseconds);
    },
    stop,
    dispose() { stop(); disposed = true; },
  };
}
