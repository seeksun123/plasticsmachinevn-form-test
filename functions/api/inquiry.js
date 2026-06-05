const REQUIRED_FIELDS = ["name", "contact", "product"];
const MAX_FIELD_LENGTH = 2000;

const fieldLabels = {
  name: "Tên",
  company: "Công ty",
  country_city: "Tỉnh / thành phố",
  contact: "Liên hệ",
  product: "Dòng máy quan tâm",
  material: "Vật liệu",
  width_thickness: "Khổ rộng / độ dày",
  speed: "Tốc độ hoặc sản lượng",
  message: "Mô tả yêu cầu"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanValue(value) {
  return String(value || "").replace(/\r/g, "").trim().slice(0, MAX_FIELD_LENGTH);
}

function buildEmailBody(payload) {
  const lines = ["Yêu cầu báo giá máy Zhengyi", ""];

  Object.entries(fieldLabels).forEach(([key, label]) => {
    const value = cleanValue(payload[key]);
    if (value) {
      lines.push(`${label}: ${value}`);
    }
  });

  lines.push("");
  lines.push("Thông tin nên gửi thêm nếu có: ảnh vật liệu, video dây chuyền hiện tại, đường kính cuộn, lõi giấy, nguồn điện và không gian lắp đặt.");
  lines.push("");
  lines.push(`Website: https://plasticsmachinevn.com/lien-he.html`);
  lines.push(`Time: ${new Date().toISOString()}`);

  return lines.join("\n");
}

async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, message: "Thiếu xác minh bảo mật. Vui lòng tải lại trang và gửi lại." };
  }

  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) {
    formData.append("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    return { ok: false, message: "Không thể xác minh bảo mật. Vui lòng thử lại." };
  }

  const result = await response.json();
  return result.success
    ? { ok: true }
    : { ok: false, message: "Xác minh bảo mật không hợp lệ. Vui lòng thử lại." };
}

async function sendEmail({ env, payload, textBody }) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.INQUIRY_TO_EMAIL || "info@plasticsmachinevn.com";
  const from = env.INQUIRY_FROM_EMAIL || "Zhengyi Machinery <onboarding@resend.dev>";
  const replyTo = cleanValue(payload.contact).includes("@") ? cleanValue(payload.contact) : undefined;

  if (!apiKey) {
    return {
      ok: false,
      configurationError: true,
      message: "Hệ thống gửi email chưa được cấu hình. Vui lòng sao chép nội dung và gửi đến info@plasticsmachinevn.com."
    };
  }

  const subjectProduct = cleanValue(payload.product) || "Yêu cầu báo giá";
  const subject = `[plasticsmachinevn.com] ${subjectProduct} - ${cleanValue(payload.name) || "Khách hàng"}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject,
      text: textBody
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      message: "Không gửi được email. Vui lòng sao chép nội dung và gửi trực tiếp.",
      providerStatus: response.status,
      providerError: errorText.slice(0, 500)
    };
  }

  return { ok: true };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, message: "Dữ liệu gửi không hợp lệ." }, 400);
  }

  const website = cleanValue(payload.website);
  if (website) {
    return jsonResponse({ ok: true, message: "Cảm ơn bạn. Yêu cầu đã được ghi nhận." });
  }

  const missing = REQUIRED_FIELDS.filter((field) => !cleanValue(payload[field]));
  if (missing.length) {
    return jsonResponse({ ok: false, message: "Vui lòng điền tên, thông tin liên hệ và dòng máy quan tâm." }, 400);
  }

  const turnstile = await verifyTurnstile(cleanValue(payload.turnstileToken), request, env);
  if (!turnstile.ok) {
    return jsonResponse({ ok: false, message: turnstile.message }, 400);
  }

  const textBody = buildEmailBody(payload);
  const emailResult = await sendEmail({ env, payload, textBody });

  if (!emailResult.ok) {
    return jsonResponse({
      ok: false,
      message: emailResult.message,
      configurationError: Boolean(emailResult.configurationError),
      fallbackText: textBody
    }, emailResult.configurationError ? 503 : 502);
  }

  return jsonResponse({
    ok: true,
    message: "Cảm ơn bạn. Yêu cầu báo giá đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm.",
    turnstileSkipped: Boolean(turnstile.skipped)
  });
}

export async function onRequestGet() {
  return jsonResponse({ ok: true, endpoint: "Zhengyi inquiry endpoint" });
}
