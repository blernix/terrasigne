"use client";

import { useEffect, useState } from "react";

/**
 * Sélecteur de prestation partagé par la page cliente de gestion et la page
 * praticienne. Il ne transporte que des identifiants : la durée, la pause et
 * le prix sont résolus par le serveur dans Directus. Le composant ne rend donc
 * jamais autre chose que `{ serviceId, formuleId }` à `onSelect`.
 */

function formatPrice(prix) {
  if (prix === null || prix === undefined) return "Prix non communiqué";
  const value = Number(prix);
  if (!Number.isFinite(value)) return "Prix non communiqué";
  return `${value} €`;
}

function buildOptions(services) {
  const options = [];

  for (const service of services) {
    if (!service || !service.rendez_vous) continue;
    const formules = Array.isArray(service.formules) ? service.formules : [];
    if (formules.length === 0) continue;

    // Même repli que fetchBookingOption côté serveur : une formule sans prix
    // affiche le prix du service, et un prix réellement inconnu n'affiche
    // jamais un « € » orphelin.
    const servicePrice =
      service.prix !== null && service.prix !== undefined
        ? Number(service.prix)
        : null;

    formules.forEach((formule, index) => {
      const durationMin = Number(formule?.duree);
      if (!Number.isFinite(durationMin) || durationMin <= 0) return;

      const formulePrice =
        formule?.prix !== null && formule?.prix !== undefined
          ? Number(formule.prix)
          : null;
      const prix =
        formulePrice !== null && Number.isFinite(formulePrice)
          ? formulePrice
          : Number.isFinite(servicePrice)
          ? servicePrice
          : null;

      options.push({
        key: formule?.id
          ? `${service.id}-${formule.id}`
          : `${service.id}-base-${index}`,
        serviceId: String(service.id),
        formuleId: formule?.id ? String(formule.id) : null,
        serviceName: service.titre || "Prestation",
        durationMin,
        prix,
      });
    });
  }

  return options;
}

function findCurrentOption(options, currentServiceId, currentDurationMin) {
  if (!currentServiceId) return null;

  const candidates = options.filter(
    (option) => option.serviceId === String(currentServiceId)
  );
  if (candidates.length === 0) return null;

  const duration = Number(currentDurationMin);
  if (Number.isFinite(duration) && duration > 0) {
    return candidates.find((option) => option.durationMin === duration) || null;
  }

  return candidates[0];
}

export default function ChoixPrestation({
  currentServiceId,
  currentDurationMin,
  onSelect,
  busy,
  error,
}) {
  const [status, setStatus] = useState("loading");
  const [options, setOptions] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setStatus("loading");
    setLoadError(null);
    setOptions([]);
    setSelectedKey(null);

    fetch("/api/services", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data)) throw new Error("Réponse API invalide");

        const built = buildOptions(data);
        const current = findCurrentOption(
          built,
          currentServiceId,
          currentDurationMin
        );

        setOptions(built);
        setSelectedKey(current ? current.key : null);
        setStatus("ready");
      })
      .catch((e) => {
        if (!active || e?.name === "AbortError") return;
        setLoadError("Impossible de charger les prestations.");
        setStatus("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentServiceId, currentDurationMin, reloadKey]);

  const currentOption = findCurrentOption(
    options,
    currentServiceId,
    currentDurationMin
  );
  const selected = options.find((option) => option.key === selectedKey) || null;
  const isCurrent = Boolean(
    selected && currentOption && selected.key === currentOption.key
  );
  const canConfirm = Boolean(selected) && !isCurrent && !busy;

  function confirm() {
    if (!canConfirm) return;
    onSelect({
      serviceId: selected.serviceId,
      formuleId: selected.formuleId,
    });
  }

  return (
    <div>
      {status === "loading" && (
        <p className="text-center text-muted py-6" role="status">
          Chargement des prestations…
        </p>
      )}

      {status === "error" && (
        <div className="text-center">
          <div
            role="alert"
            className="rounded-2xl px-4 py-3 text-sm bg-[#fbeeec] text-[#8c3b34] border border-[#eed3ce]"
          >
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-4 border border-forest/25 text-forest py-3 px-5 rounded-full font-semibold hover:bg-sage-100 transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {status === "ready" && options.length === 0 && (
        <p className="text-center text-muted py-6">
          Aucune prestation réservable pour le moment.
        </p>
      )}

      {status === "ready" && options.length > 0 && (
        <>
          <fieldset disabled={busy} className="space-y-2">
            <legend className="sr-only">Choisir une prestation</legend>
            {options.map((option) => {
              const optionIsCurrent = Boolean(
                currentOption && option.key === currentOption.key
              );
              const checked = option.key === selectedKey;

              return (
                <label
                  key={option.key}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                    checked
                      ? "border-sage bg-sage-100"
                      : "border-sand-200 bg-white hover:border-forest/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="choix-prestation"
                    value={option.key}
                    checked={checked}
                    onChange={() => setSelectedKey(option.key)}
                    className="mt-1"
                  />
                  <span className="flex-1 min-w-0 text-sm text-ink">
                    <span className="font-semibold">
                      {option.serviceName} — {option.durationMin} min —{" "}
                      {formatPrice(option.prix)}
                    </span>
                    {optionIsCurrent && (
                      <span className="ml-2 text-[0.65rem] font-extrabold text-violet uppercase tracking-wide">
                        actuelle
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {isCurrent && (
            <p className="text-xs text-muted mt-3">
              Choisissez une autre prestation pour continuer.
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-2xl px-4 py-3 mt-4 text-sm bg-[#fbeeec] text-[#8c3b34] border border-[#eed3ce]"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            className="w-full mt-6 bg-mint text-forest border border-forest/25 py-3.5 rounded-full font-bold hover:bg-sage-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Modification en cours…" : "Confirmer le changement"}
          </button>
        </>
      )}
    </div>
  );
}
