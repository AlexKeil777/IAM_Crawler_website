import { getLanguage, t } from "./i18n";

export type InlineStatusKey = "sendingLabel" | "submittedStatus" | "validationCaptcha"
  | "captchaUnavailableStatus" | "unavailableStatus" | "deliveryUnknownStatus" | "submissionRejectedStatus";
type Report = (key: InlineStatusKey | null, kind: "success" | "error" | "", detail?: string) => void;
type WidgetId = string | number;
interface HCaptcha {
  render(container: HTMLElement, options: Record<string, unknown>): WidgetId;
  getResponse(widget: WidgetId): string;
  reset(widget: WidgetId): void;
  remove(widget: WidgetId): void;
}
declare global {
  interface Window {
    hcaptcha?: HCaptcha;
    iamaiCaptchaReady?: () => void;
  }
}

/** A blank public access key keeps the existing native FormSubmit flow. */
export function initInlineContact(form: HTMLFormElement, report: Report): {
  submit: () => Promise<void>; localize: () => void;
} | null {
  const keyField = form.querySelector<HTMLInputElement>('[name="access_key"]');
  const accessKey = keyField?.value.trim();
  if (!accessKey) return null;

  const container = form.querySelector<HTMLElement>("#contact-captcha")!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = button.querySelector<HTMLElement>(".submit-label")!;
  const note = form.querySelector<HTMLElement>("#contact-verification-note")!;
  const service = form.querySelector<HTMLAnchorElement>("#contact-service-link")!;
  let widget: WidgetId | undefined;
  let widgetLanguage = getLanguage();
  let sending = false;
  let solved = false;
  let captchaFailed = false;
  keyField!.disabled = false;
  form.action = "https://api.web3forms.com/submit";
  container.hidden = false;
  note.dataset.i18n = "formInlineVerification";
  note.textContent = t("formInlineVerification");
  service.href = "https://web3forms.com/";
  service.textContent = "Web3Forms";

  function captchaUnavailable() {
    captchaFailed = true;
    if (!sending) report("captchaUnavailableStatus", "error");
  }
  function renderWidget() {
    const api = window.hcaptcha;
    if (!api || sending) return;
    try {
      solved = false;
      if (widget !== undefined) api.remove(widget);
      widget = undefined;
      widgetLanguage = getLanguage();
      widget = api.render(container, {
        // Web3Forms publishes this shared site key and verifies its tokens.
        sitekey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2",
        theme: "dark", size: "compact", hl: widgetLanguage,
        callback: () => {
          solved = true;
          captchaFailed = false;
          if (!sending) report(null, "");
        },
        "expired-callback": () => {
          if (solved && !sending) report("validationCaptcha", "error");
          solved = false;
        },
        "error-callback": captchaUnavailable,
      });
      if (captchaFailed) report(null, "");
      captchaFailed = false;
    } catch {
      captchaUnavailable();
    }
  }

  const loadTimeout = window.setTimeout(captchaUnavailable, 15000);
  window.iamaiCaptchaReady = () => {
    window.clearTimeout(loadTimeout);
    renderWidget();
  };
  const script = document.createElement("script");
  script.src = "https://js.hcaptcha.com/1/api.js?onload=iamaiCaptchaReady&render=explicit&recaptchacompat=off";
  script.async = true;
  script.addEventListener("error", () => {
    window.clearTimeout(loadTimeout);
    captchaUnavailable();
  });
  document.head.append(script);

  function localize() {
    note.textContent = t("formInlineVerification");
    label.textContent = t(sending ? "sendingLabel" : "submitLabel");
    if (!sending && widgetLanguage !== getLanguage()) renderWidget();
  }

  async function submit() {
    if (sending) {
      report("sendingLabel", "");
      return;
    }
    const api = window.hcaptcha;
    let token = "";
    try { if (widget !== undefined) token = api?.getResponse(widget) || ""; }
    catch { captchaUnavailable(); }
    if (!token) {
      report(captchaFailed ? "captchaUnavailableStatus" : "validationCaptcha", "error");
      return;
    }
    const data = new FormData(form);
    const submittedFields = ["name", "email", "company", "message"]
      .map((name) => form.elements.namedItem(name))
      .filter((field): field is HTMLInputElement | HTMLTextAreaElement =>
        field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
      .map((field) => ({ field, value: field.value }));
    const payload = {
      access_key: accessKey,
      name: data.get("name"), email: data.get("email"), company: data.get("company"),
      message: data.get("message"), subject: data.get("_subject"),
      from_name: "IAMAI website", source_url: `${location.origin}${location.pathname}`,
      "h-captcha-response": token,
    };
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    sending = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    localize();
    report("sendingLabel", "");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (response.status >= 500) {
        report("unavailableStatus", "error");
        return;
      }
      const result = await response.json().catch(() => null);
      if (response.ok && result?.success === true) {
        // Clear the submitted values, preserving any new text entered while
        // the request was pending. Failed requests keep the entire draft.
        submittedFields.forEach(({ field, value }) => {
          if (field.value === value) field.value = "";
        });
        form.dispatchEvent(new Event("input", { bubbles: true }));
        report("submittedStatus", "success");
      } else {
        const detail = typeof result?.message === "string" ? result.message.slice(0, 300) : undefined;
        report("submissionRejectedStatus", "error", detail);
      }
    } catch {
      // A lost response does not establish whether the message was accepted.
      report("deliveryUnknownStatus", "error");
    } finally {
      window.clearTimeout(timeout);
      // Reset tokens without letting expiry overwrite the submission result.
      solved = false;
      try { if (widget !== undefined) api?.reset(widget); } catch { captchaFailed = true; }
      sending = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
      localize();
    }
  }
  return { submit, localize };
}
