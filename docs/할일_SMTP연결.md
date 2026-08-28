# 공개 전 필수 — 발신 메일(SMTP) 연결 남은 절차 (2026-08-28 중단 지점)

> 왜: Supabase 내장 메일은 시간당 서너 통 한도 — 공개 후 가입이 몰리면 확인 메일이 막힌다.
> 발신자도 "Supabase Auth" 대신 "케이에듀 <no-reply@keduclass.com>"로 바뀐다.
> 배달 자체는 검증 완료(2026-08-28, 교육청 웹메일 수신 확인). 급하지 않음 — 공개 전에만 하면 됨.

## 지금까지 된 것
- [x] Brevo 무료 계정 생성 (하루 300통) — 휴대폰 인증까지 완료
- [x] 도메인 추가 마법사: keduclass.com 입력 → 브랜드 서브도메인 `mail` → Manual 선택 → **Records 화면까지 진행** (여기서 중단)

## 남은 것 (총 15분 + DNS 반영 대기)
1. **카페24 DNS에 레코드 4개 추가** — domain.cafe24.com → 나의 도메인 관리 → keduclass.com → 부가서비스 → DNS 관리
   | 종류 | 호스트명 | 값 (Brevo Records 화면의 Copy 버튼으로) |
   |---|---|---|
   | TXT | 빈칸(또는 @) | brevo-code:… |
   | CNAME | brevo1._domainkey | b1.keduclass-com.dkim.brevo.com |
   | CNAME | brevo2._domainkey | b2.… (DKIM 2 값) |
   | TXT | _dmarc | (DMARC 값) |
   - 기존 레코드(Vercel 연결용 A/CNAME)는 건드리지 않는다. 추가만.
   - 카페24가 밑줄(_) 호스트를 거부하면 → 네임서버를 Vercel DNS로 이전하는 우회 (클로드에게)
2. Brevo Records 화면에서 **Verify/Authenticate** (반영 수십 분 걸릴 수 있음 — 재시도)
3. Brevo 프로필 → **SMTP & API → SMTP 탭** → Generate SMTP key 발급·복사
4. Supabase → Project Settings → Authentication → **SMTP Settings**:
   - Enable custom SMTP ON
   - Sender: `no-reply@keduclass.com` / 이름 `케이에듀`
   - Host `smtp-relay.brevo.com` · Port `587` · Username(Brevo 로그인 메일) · Password(3의 키)
5. Supabase → Authentication → **Rate Limits** → 이메일 발송 시간당 100으로 상향
6. **검증**: Users → Send password recovery → 받은 메일 발신자가 케이에듀/keduclass.com 이면 완료

## 시작 신호
"SMTP 이어서" 라고 하면 이 문서 기준으로 1번부터 화면 따라 안내.
