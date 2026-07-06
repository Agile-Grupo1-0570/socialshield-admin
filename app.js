"use strict";

/**
 * URL configurable del Webhook de producción o pruebas de n8n.
 * Reemplaza este valor antes de publicar la interfaz.
 */
const N8N_WEBHOOK_URL = "https://lordmathi2741-socialshield.hf.space/webhook/lanzar-campana";
const DEFAULT_TRAINING_URL = "https://agile-grupo1-0570.github.io/socialshield-admin/";

/**
 * Catálogo de plantillas educativas.
 * Estas plantillas representan escenarios de capacitación interna y no usan
 * logos, páginas oficiales ni mecanismos de captura de datos personales.
 *
 * Para agregar nuevas plantillas en el futuro:
 * 1. Añade un objeto a este arreglo con un `id` único.
 * 2. Usa `isAvailable: false` mientras la plantilla siga en preparación.
 * 3. Cambia a `isAvailable: true` cuando el flujo correspondiente exista en n8n.
 * 4. No incluyas logos ni recursos oficiales de las entidades representadas.
 */

const CAMPAIGN_TEMPLATES = [
  {
    id: "bcp",
    name: "BCP",
    entity: "BCP Simulado",
    subject: "Aviso de seguridad de cuenta",
    description:
      "Simulación bancaria peruana para evaluar el reconocimiento de correos sospechosos.",
    previewText:
      "Hemos detectado una actividad que requiere revisión preventiva.",
    status: "Disponible",
    isAvailable: true,
    accentClass: "template-card--bcp",
  },
  {
    id: "sunat",
    name: "SUNAT",
    entity: "SUNAT Simulado",
    subject: "Notificación tributaria pendiente",
    description: "Escenario educativo de notificación tributaria para capacitación interna.",
    previewText: "Tiene una comunicación informativa pendiente de revisión.",
    status: "Disponible",
    isAvailable: true,
    accentClass: "template-card--sunat",
  },
  {
    id: "bbva",
    name: "BBVA",
    entity: "BBVA Simulado",
    subject: "Actualización de seguridad digital",
    description:
      "Escenario educativo bancario para evaluar recomendaciones de seguridad digital.",
    previewText: "Revise las recomendaciones recientes de seguridad digital.",
    status: "Disponible",
    isAvailable: true,
    accentClass: "template-card--bbva",
  },
];

// Interbank queda fuera del MVP actual y podrá incorporarse como escenario educativo futuro.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const elements = {
  templateGrid: document.querySelector("#template-grid"),
  form: document.querySelector("#campaign-form"),
  campaignName: document.querySelector("#campaign-name"),
  recipients: document.querySelector("#recipients"),
  trainingUrl: document.querySelector("#training-url"),
  scheduledDate: document.querySelector("#scheduled-date"),
  recipientCount: document.querySelector("#recipient-count"),
  submitButton: document.querySelector("#submit-button"),
  submitLabel: document.querySelector("#submit-label"),
  resetButton: document.querySelector("#reset-button"),
  submissionStatus: document.querySelector("#submission-status"),
  submissionMessage: document.querySelector("#submission-message"),
  summaryTemplate: document.querySelector("#summary-template"),
  summaryTemplateSubject: document.querySelector("#summary-template-subject"),
  summaryCampaign: document.querySelector("#summary-campaign"),
  summaryRecipients: document.querySelector("#summary-recipients"),
  summaryUrl: document.querySelector("#summary-url"),
  summaryDateRow: document.querySelector("#summary-date-row"),
  summaryDate: document.querySelector("#summary-date"),
};

let selectedTemplate = CAMPAIGN_TEMPLATES.find((template) => template.isAvailable);

function renderTemplates() {
  elements.templateGrid.innerHTML = "";

  CAMPAIGN_TEMPLATES.forEach((template) => {
    const card = document.createElement("button");
    const isSelected = selectedTemplate?.id === template.id;

    card.type = "button";
    card.className = [
      "template-card",
      template.accentClass,
      isSelected ? "template-card--selected" : "",
      !template.isAvailable ? "template-card--disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");
    card.dataset.templateId = template.id;
    card.disabled = !template.isAvailable;
    card.setAttribute("aria-pressed", String(isSelected));
    card.setAttribute(
      "aria-label",
      `${template.entity}. ${template.status}. Asunto sugerido: ${template.subject}. ${template.description} ${template.previewText}`,
    );

    const footerLabel = template.isAvailable
      ? `Plantilla ${template.name} - Simulación educativa`
      : "En preparación";
    const footerIcon = template.isAvailable
      ? '<path d="m4 10 3 3 6-7" />'
      : '<rect x="4" y="7" width="10" height="8" rx="2" /><path d="M7 7V5a2 2 0 0 1 4 0v2" />';

    card.innerHTML = `
      <span class="template-card__top">
        <span class="template-card__mark" aria-hidden="true">EDU</span>
        <span class="template-card__status">${template.status}</span>
      </span>
      <span class="template-card__entity">${template.entity}</span>
      <h3>${template.name}</h3>
      <span class="template-card__subject">
        <small>Asunto sugerido</small>
        ${template.subject}
      </span>
      <p class="template-card__description">${template.description}</p>
      <span class="template-card__preview">
        <small>Vista previa educativa</small>
        “${template.previewText}”
      </span>
      <span class="template-card__footer">
        <svg viewBox="0 0 16 16" aria-hidden="true">${footerIcon}</svg>
        ${footerLabel}
      </span>
    `;

    if (template.isAvailable) {
      card.addEventListener("click", () => selectTemplate(template.id));
    }

    elements.templateGrid.append(card);
  });
}

function selectTemplate(templateId) {
  const nextTemplate = CAMPAIGN_TEMPLATES.find(
    (template) => template.id === templateId && template.isAvailable,
  );

  if (!nextTemplate) {
    return;
  }

  selectedTemplate = nextTemplate;
  renderTemplates();
  updateSummary();
}

function parseRecipients(rawValue) {
  const lines = rawValue
    .split(/\r?\n/)
    .map((email) => email.trim())
    .filter(Boolean);
  const uniqueEmails = lines.filter(
    (email, index, list) =>
      list.findIndex((candidate) => candidate.toLowerCase() === email.toLowerCase()) === index,
  );

  return {
    valid: uniqueEmails.filter((email) => EMAIL_PATTERN.test(email)),
    invalid: uniqueEmails.filter((email) => !EMAIL_PATTERN.test(email)),
  };
}

function isValidHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function getTrainingUrl() {
  return elements.trainingUrl.value.trim() || DEFAULT_TRAINING_URL;
}

function formatScheduledDate(value) {
  if (!value) {
    return "Envío inmediato";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Fecha por confirmar";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function updateSummary() {
  const parsedRecipients = parseRecipients(elements.recipients.value);
  const campaignName = elements.campaignName.value.trim();
  const trainingUrl = getTrainingUrl();
  const scheduledDate = elements.scheduledDate.value;

  elements.recipientCount.textContent = String(parsedRecipients.valid.length);
  elements.summaryRecipients.textContent = String(parsedRecipients.valid.length);
  elements.summaryTemplate.textContent = selectedTemplate?.name ?? "Sin seleccionar";
  elements.summaryTemplateSubject.textContent =
    selectedTemplate?.subject ?? "Sin asunto sugerido";
  elements.summaryTemplateSubject.title = selectedTemplate?.subject ?? "";
  elements.summaryCampaign.textContent = campaignName || "Sin configurar";
  elements.summaryCampaign.title = campaignName;
  elements.summaryUrl.textContent = trainingUrl;
  elements.summaryUrl.title = trainingUrl;
  elements.summaryDateRow.hidden = !scheduledDate;
  elements.summaryDate.textContent = scheduledDate ? formatScheduledDate(scheduledDate) : "";
  elements.submitLabel.textContent = `Lanzar campaña ${selectedTemplate?.name ?? ""}`.trim();
}

function setFieldError(field, message) {
  const errorElement = document.querySelector(`#${field.id}-error`);

  field.setAttribute("aria-invalid", "true");
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearFieldError(field) {
  const errorElement = document.querySelector(`#${field.id}-error`);

  field.removeAttribute("aria-invalid");
  if (errorElement) {
    errorElement.textContent = "";
  }
}

function clearValidationErrors() {
  elements.form
    .querySelectorAll('[aria-invalid="true"]')
    .forEach((field) => clearFieldError(field));
}

function validateForm() {
  clearValidationErrors();
  let isValid = true;

  if (!elements.campaignName.value.trim()) {
    setFieldError(elements.campaignName, "Ingresa un nombre para identificar la campaña.");
    isValid = false;
  }

  const parsedRecipients = parseRecipients(elements.recipients.value);
  if (parsedRecipients.valid.length === 0) {
    setFieldError(elements.recipients, "Ingresa al menos un correo destinatario válido.");
    isValid = false;
  } else if (parsedRecipients.invalid.length > 0) {
    const examples = parsedRecipients.invalid.slice(0, 3).join(", ");
    setFieldError(
      elements.recipients,
      `Revisa ${parsedRecipients.invalid.length} correo(s) no válido(s): ${examples}`,
    );
    isValid = false;
  }

  const trainingUrl = elements.trainingUrl.value.trim();
  if (trainingUrl && !isValidHttpUrl(trainingUrl)) {
    setFieldError(elements.trainingUrl, "Ingresa una URL válida que comience con http:// o https://.");
    isValid = false;
  }

  if (!selectedTemplate) {
    isValid = false;
  }

  if (!isValid) {
    const firstInvalidField = elements.form.querySelector('[aria-invalid="true"]');
    firstInvalidField?.focus();
  }

  return { isValid, recipients: parsedRecipients.valid };
}

function buildPayload(recipients) {
  return {
    template: selectedTemplate.id,
    templateId: selectedTemplate.id,
    templateName: selectedTemplate.name,
    templateSubject: selectedTemplate.subject,
    templateEntity: selectedTemplate.entity,
    campaignName: elements.campaignName.value.trim(),
    recipients,
    trainingUrl: getTrainingUrl(),
    scheduledDate: elements.scheduledDate.value,
    createdAt: new Date().toISOString(),
    source: "github-pages-admin",
  };
}

function showSubmissionStatus(type, message) {
  elements.submissionStatus.hidden = false;
  elements.submissionStatus.className = `submission-status submission-status--${type}`;
  elements.submissionMessage.textContent = message;
}

function hideSubmissionStatus() {
  elements.submissionStatus.hidden = true;
  elements.submissionStatus.className = "submission-status";
  elements.submissionMessage.textContent = "";
}

function setSubmitting(isSubmitting) {
  elements.submitButton.disabled = isSubmitting;
  elements.resetButton.disabled = isSubmitting;
  elements.submitButton.classList.toggle("is-loading", isSubmitting);
  elements.form.setAttribute("aria-busy", String(isSubmitting));
}

async function handleSubmit(event) {
  event.preventDefault();
  hideSubmissionStatus();

  const validation = validateForm();
  if (!validation.isValid) {
    return;
  }

  setSubmitting(true);
  showSubmissionStatus("loading", "Enviando campaña a n8n...");

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildPayload(validation.recipients)),
    });

    if (!response.ok) {
      throw new Error(`El Webhook respondió con el estado ${response.status}.`);
    }

    showSubmissionStatus("success", "Campaña enviada correctamente a n8n");
  } catch (error) {
    console.error("Error al enviar la campaña a n8n:", error);
    showSubmissionStatus(
      "error",
      "No se pudo enviar la campaña. Revisa el Webhook de n8n",
    );
  } finally {
    setSubmitting(false);
  }
}

function handleReset() {
  window.requestAnimationFrame(() => {
    clearValidationErrors();
    hideSubmissionStatus();
    selectedTemplate = CAMPAIGN_TEMPLATES.find((template) => template.isAvailable);
    renderTemplates();
    updateSummary();
  });
}

function setMinimumScheduledDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  elements.scheduledDate.min = now.toISOString().slice(0, 16);
}

function initializeApp() {
  renderTemplates();
  setMinimumScheduledDate();
  updateSummary();

  elements.form.addEventListener("submit", handleSubmit);
  elements.form.addEventListener("reset", handleReset);
  elements.form.addEventListener("input", (event) => {
    const field = event.target;
    if (field.matches("input, textarea")) {
      clearFieldError(field);
    }
    updateSummary();
  });
  elements.form.addEventListener("change", updateSummary);
}

initializeApp();
