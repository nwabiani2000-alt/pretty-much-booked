/**
 * IDOR smoke test for /api/bookings/[id] and list endpoint.
 * Run: node scripts/idor-test.mjs [baseUrl]
 */
const base = process.argv[2] || "http://127.0.0.1:3000";

async function main() {
  const results = [];

  // 1) Unauthenticated list → 401
  {
    const res = await fetch(`${base}/api/bookings`);
    results.push({
      name: "GET /api/bookings unauthenticated",
      expect: 401,
      got: res.status,
      pass: res.status === 401,
    });
  }

  // 2) Create booking as cust_a
  let bookingId = null;
  let accessToken = null;
  {
    const res = await fetch(`${base}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PMB-User-Id": "cust_attacker_a",
      },
      body: JSON.stringify({
        pro_id: "1",
        service_id: "box-braids",
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        address_text: "10 Downing Street, London SW1A 2AA",
        is_emergency: false,
      }),
    });
    const json = await res.json();
    bookingId = json.booking?.id;
    accessToken = json.booking?.access_token;
    results.push({
      name: "POST /api/bookings create",
      expect: 201,
      got: res.status,
      pass: res.status === 201 && Boolean(bookingId && accessToken),
      bookingId,
    });
  }

  // 3) Attacker B tries to read by ID without token → 403
  if (bookingId) {
    const res = await fetch(`${base}/api/bookings/${bookingId}`, {
      headers: { "X-PMB-User-Id": "cust_attacker_b" },
    });
    results.push({
      name: "GET /api/bookings/[id] other user (IDOR)",
      expect: 403,
      got: res.status,
      pass: res.status === 403,
    });
  }

  // 4) Owner with matching user id → 200
  if (bookingId) {
    const res = await fetch(`${base}/api/bookings/${bookingId}`, {
      headers: { "X-PMB-User-Id": "cust_attacker_a" },
    });
    results.push({
      name: "GET /api/bookings/[id] owner",
      expect: 200,
      got: res.status,
      pass: res.status === 200,
    });
  }

  // 5) Valid access_token → 200
  if (bookingId && accessToken) {
    const res = await fetch(
      `${base}/api/bookings/${bookingId}?access_token=${encodeURIComponent(accessToken)}`
    );
    results.push({
      name: "GET /api/bookings/[id] access_token",
      expect: 200,
      got: res.status,
      pass: res.status === 200,
    });
  }

  // 6) List as B with A's customerId → 403
  {
    const res = await fetch(
      `${base}/api/bookings?customerId=cust_attacker_a`,
      { headers: { "X-PMB-User-Id": "cust_attacker_b" } }
    );
    results.push({
      name: "GET /api/bookings?customerId=A as B",
      expect: 403,
      got: res.status,
      pass: res.status === 403,
    });
  }

  // 7) Price manipulation — client total ignored
  if (bookingId) {
    const res = await fetch(`${base}/api/payments/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        amountGbp: 0.01,
        access_token: accessToken,
      }),
    });
    const json = await res.json();
    const notPenny = json.amount_gbp !== 0.01;
    results.push({
      name: "POST deposit ignores client £0.01",
      expect: "server deposit amount",
      got: json.amount_gbp,
      pass: res.ok && notPenny && Number(json.amount_gbp) > 1,
    });
  }

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ base, results, failed: failed.length }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
