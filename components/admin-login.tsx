"use client";
import { useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="shell">
      <div className="result-empty" style={{ marginTop: 80, maxWidth: 420, marginInline: "auto" }}>
        <h1>운영 스튜디오</h1>
        <p>관리자 비밀번호를 입력해 주세요.</p>
        {configured ? (
          <form
            style={{ marginTop: 24, display: "grid", gap: 12 }}
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                const res = await fetch("/api/admin/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password }),
                });
                if (!res.ok) {
                  const data = (await res.json().catch(() => ({}))) as { error?: string };
                  setError(data.error || "로그인에 실패했습니다.");
                  return;
                }
                window.location.assign("/admin");
              } catch {
                setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              <span className="field-label">비밀번호</span>
              <input
                className="input-control"
                type="password"
                name="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p style={{ color: "#b4532a", margin: 0 }}>{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
              로그인
            </button>
          </form>
        ) : (
          <p style={{ marginTop: 16 }}>
            서버에 ADMIN_PASSWORD_HASH가 설정되어 있지 않습니다. README의 안내에 따라 비밀번호 해시를 등록해 주세요.
          </p>
        )}
      </div>
    </main>
  );
}
