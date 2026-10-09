/* Bounded direct JSON reads; no storage, scraping, admin refresh or executable responses. */
(function (global) {
  "use strict";
  function error(code, message) { var e = new Error(message); e.code = code; return e; }
  function baseUrl(value) {
    var url;
    try { url = new URL(value); } catch (_) { throw error("configuration", "Укажите корректный URL API"); }
    var loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
      throw error("configuration", "API: HTTPS или локальный HTTP origin без пути и учётных данных");
    }
    return url.origin;
  }
  function createClient(base, normalize, options) {
    options = options || {}; base = baseUrl(base);
    var fetcher = options.fetch || global.fetch.bind(global), now = options.now || Date.now;
    var ttl = options.ttlMs == null ? 300000 : options.ttlMs, timeout = options.timeoutMs == null ? 15000 : options.timeoutMs;
    var maxBytes = options.maxBytes == null ? 4 * 1024 * 1024 : options.maxBytes;
    var cache = new Map(), pending = new Map(), generations = new Map();
    async function read(route, course, controller) {
      var url = new URL(route, base); url.searchParams.set("course", String(course));
      var response;
      try { response = await fetcher(url.toString(), { signal: controller.signal, credentials: "omit", mode: "cors", cache: "no-store", redirect: "error" }); }
      catch (e) { if (controller.signal.aborted) throw error("cancelled", "Запрос отменён"); throw error("network", "API недоступен: сеть или CORS"); }
      if (!response.ok) throw error("http", response.status === 503 ? "Расписание временно недоступно (503)" : "Ошибка API (" + response.status + ")");
      if (!/^(application\/json)(?:\s*;|$)/i.test(response.headers.get("Content-Type") || "")) throw error("invalid", "API вернул данные другого формата");
      var declared = response.headers.get("Content-Length");
      if (declared !== null && Number(declared) > maxBytes) throw error("size", "Ответ API превышает допустимый размер");
      var text;
      if (response.body && response.body.getReader) {
        var reader = response.body.getReader(), bytes = 0, decoder = new TextDecoder(), parts = [];
        try {
          while (true) {
            var part = await reader.read(); if (part.done) break;
            bytes += part.value.byteLength;
            if (bytes > maxBytes) { await reader.cancel(); throw error("size", "Ответ API превышает допустимый размер"); }
            parts.push(decoder.decode(part.value, { stream: true }));
          }
          parts.push(decoder.decode()); text = parts.join("");
        } finally { reader.releaseLock(); }
      } else {
        text = await response.text();
        if (new TextEncoder().encode(text).byteLength > maxBytes) throw error("size", "Ответ API превышает допустимый размер");
      }
      try { return JSON.parse(text); } catch (_) { throw error("invalid", "Некорректный JSON расписания"); }
    }
    function load(course, settings) {
      settings = settings || {};
      if (![1, 2].includes(course)) return Promise.reject(error("course", "Неизвестный курс"));
      var previous = cache.get(course);
      if (!settings.force && previous && now() - previous.acceptedAt < ttl) return Promise.resolve({ dataset: previous.dataset, state: "cached", error: null });
      if (!settings.force && pending.has(course)) return pending.get(course).promise;
      if (pending.has(course)) pending.get(course).controller.abort();
      var generation = (generations.get(course) || 0) + 1; generations.set(course, generation);
      var controller = new AbortController(), timer, abortListener;
      var cancelled = new Promise(function (_, reject) {
        abortListener = function () { reject(error("cancelled", "Запрос отменён")); };
        controller.signal.addEventListener("abort", abortListener, { once: true });
        timer = setTimeout(function () { reject(error("timeout", "Время ожидания API истекло")); controller.abort(); }, timeout);
      });
      var externalAbort = function () { controller.abort(); };
      if (settings.signal) { settings.signal.addEventListener("abort", externalAbort, { once: true }); if (settings.signal.aborted) controller.abort(); }
      var promise = Promise.race([Promise.all([read("/api/schedule", course, controller), read("/api/status", course, controller)]), cancelled])
        .then(function (responses) {
          if (generations.get(course) !== generation || controller.signal.aborted) throw error("cancelled", "Устаревший запрос отменён");
          var dataset;
          try { dataset = normalize(responses[0], responses[1], course, new Date(now()).toISOString()); }
          catch (_) { throw error("invalid", "Данные расписания не прошли проверку курса, структуры или ревизии"); }
          cache.set(course, { dataset: dataset, acceptedAt: now() });
          return { dataset: dataset, state: "fresh", error: null };
        }).catch(function (e) {
          if (e.code === "cancelled" || generations.get(course) !== generation) throw e;
          controller.abort();
          var good = cache.get(course);
          if (good) return { dataset: good.dataset, state: "stale", error: e.message };
          throw e;
        }).finally(function () {
          clearTimeout(timer); controller.signal.removeEventListener("abort", abortListener);
          if (settings.signal) settings.signal.removeEventListener("abort", externalAbort);
          if (pending.get(course)?.generation === generation) pending.delete(course);
        });
      pending.set(course, { promise: promise, controller: controller, generation: generation });
      return promise;
    }
    return { load: load, cancel: function () { pending.forEach(function (entry) { entry.controller.abort(); }); }, baseUrl: base };
  }
  var api = { createClient: createClient, baseUrl: baseUrl };
  global.FCIM_TIMETABLE_API = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
