const inquiryForm = document.querySelector(".inquiry-form");

if (inquiryForm) {
  const result = inquiryForm.querySelector(".form-result");
  const output = inquiryForm.querySelector(".inquiry-output");
  const copyButton = inquiryForm.querySelector(".copy-inquiry");
  const mailtoLink = inquiryForm.querySelector(".mailto-inquiry");
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const status = inquiryForm.querySelector(".form-status");

  const labels = {
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

  const buildInquiryText = (formData) => {
    const lines = ["Yêu cầu báo giá máy Zhengyi", ""];

    Object.entries(labels).forEach(([key, label]) => {
      const value = String(formData.get(key) || "").trim();
      if (value) {
        lines.push(`${label}: ${value}`);
      }
    });

    lines.push("");
    lines.push("Thông tin nên gửi thêm nếu có: ảnh vật liệu, video dây chuyền hiện tại, đường kính cuộn, lõi giấy, nguồn điện và không gian lắp đặt.");

    return lines.join("\n");
  };

  const showFallback = (body) => {
    const subject = inquiryForm.dataset.mailSubject || "Yêu cầu báo giá máy Zhengyi";
    const mailTo = inquiryForm.dataset.mailTo || "";

    output.value = body;
    result.hidden = false;
    mailtoLink.href = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  inquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!inquiryForm.reportValidity()) {
      return;
    }

    const formData = new FormData(inquiryForm);
    const body = buildInquiryText(formData);
    const endpoint = inquiryForm.dataset.endpoint || "/api/inquiry";
    const payload = Object.fromEntries(formData.entries());

    result.hidden = true;
    status.textContent = "Đang gửi yêu cầu...";
    status.className = "form-status is-loading";
    submitButton.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        status.textContent = data.message || "Không gửi được yêu cầu. Vui lòng dùng nội dung dự phòng bên dưới.";
        status.className = "form-status is-error";
        showFallback(data.fallbackText || body);
        return;
      }

      status.textContent = data.message || "Cảm ơn bạn. Yêu cầu báo giá đã được gửi thành công.";
      status.className = "form-status is-success";
      inquiryForm.reset();
    } catch (error) {
      status.textContent = "Không kết nối được hệ thống gửi email. Vui lòng dùng nội dung dự phòng bên dưới.";
      status.className = "form-status is-error";
      showFallback(body);
    } finally {
      submitButton.disabled = false;
    }
  });

  copyButton.addEventListener("click", async () => {
    const text = output.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Đã sao chép";
      setTimeout(() => {
        copyButton.textContent = "Sao chép nội dung";
      }, 1800);
    } catch (error) {
      output.select();
      document.execCommand("copy");
    }
  });
}
