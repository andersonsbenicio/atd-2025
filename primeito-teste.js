import http from "k6/http";
import { sleep, check, group } from "k6";

export const options = {
  vus: 10,
  //duration: "30s",
  iterations: 10,
  thresholds: {
    http_req_duration: ["p(90)<=2000", "p(95)<=3000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  let responseRegister = "";

  group("Fazendo login", () => {
    responseRegister = http.post(
      "http://localhost:3000/auth/register",
      JSON.stringify({
        email: "anderson@benicio.com",
        password: "123456",
        name: "Anderson Benício",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      });
  });

  let responseLogin = "";

  group("Fazendo login", () => {
    responseLogin = http.post(
      "http://localhost:3000/auth/login",
      JSON.stringify({
        email: "anderson@benicio.com",
        password: "123456",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      });
  });

  group("Fazendo uma Transferência", () => {
    let responseTransfer = http.post(
      "http://localhost:3000/checkout",
      JSON.stringify({
        items: [
          {
            productId: 1,
            quantity: 2
          }
        ],
        paymentMethod: "cash"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${responseLogin.json("token")}`,
        },
        //     });

        check(responseTransfer, {
          "status deve ser igual a 201": (r) => r.status === 201,
    });
});

group("Simulando pensamento do usuário", () => {
  sleep(1); // User Think Time
});
}