// F-01: 부산 연제구 면적 구간별 미분양 4개월 추이·변화율
// R-01 정상 / R-02 빈값 / R-03 오류(0으로 나누기) — docs/requirements.md 참고

function validateSelection(value) {
  if (!value) {
    return "면적 구간을 선택해 주세요.";
  }
  return null;
}

// values: [2026-05, 2026-06, 2026-07, 2026-08] 순서의 4개 숫자
// 반환: { ok:true, rate:number } 또는 { ok:false, message:string }
function calcChangeRate(values) {
  const base = values[0];
  const last = values[values.length - 1];
  if (base === 0) {
    return {
      ok: false,
      message: "이 구간은 최근 4개월 동안 미분양이 0채라 변화율을 계산할 수 없습니다. (연제구, data.go.kr 15030310 기준)"
    };
  }
  const raw = ((last - base) / base) * 100;
  const rounded = Math.round(raw * 10) / 10;
  return { ok: true, rate: rounded };
}

// "매도 시세 알려주기" 버튼 — 서버 없이 로컬 카운트만 증가
function registerInterest() {
  try {
    const count = parseInt(localStorage.getItem("interestCount") || "0", 10) + 1;
    localStorage.setItem("interestCount", String(count));
    return count;
  } catch (e) {
    return null;
  }
}

function renderResult(areaKey) {
  const resultEl = document.getElementById("result");
  const errorEl = document.getElementById("error-msg");
  const interestBtn = document.getElementById("interest-btn");

  resultEl.innerHTML = "";
  errorEl.textContent = "";
  interestBtn.style.display = "none";
  interestBtn.disabled = false;
  interestBtn.textContent = "매도 시세 알려주기";

  const invalidMsg = validateSelection(areaKey);
  if (invalidMsg) {
    errorEl.textContent = invalidMsg;
    return;
  }

  const data = window.YEONJE_MISBUNYANG;
  const area = data.areas[areaKey];
  const outcome = calcChangeRate(area.values);

  if (!outcome.ok) {
    errorEl.textContent = outcome.message;
    return;
  }

  const rows = data.months
    .map(function (m, i) {
      return "<tr><td>" + m + "</td><td>" + area.values[i] + "채</td></tr>";
    })
    .join("");

  resultEl.innerHTML =
    '<p class="area-label">' + area.label + "</p>" +
    '<div class="rate">' + outcome.rate + "%</div>" +
    "<table><thead><tr><th>기준월</th><th>미분양</th></tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    '<p class="source">출처: ' + data.source + " · 기준: " + data.period + "</p>";

  interestBtn.style.display = "inline-flex";
}

document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("area-select");
  const confirmBtn = document.getElementById("confirm-btn");
  const interestBtn = document.getElementById("interest-btn");

  confirmBtn.addEventListener("click", function () {
    renderResult(select.value);
  });

  interestBtn.addEventListener("click", function () {
    const count = registerInterest();
    interestBtn.textContent = "관심 등록 완료(실제 알림 발송은 아직 없음)";
    interestBtn.disabled = true;
  });
});
