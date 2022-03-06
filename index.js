const colors = require("colors");
const { vicopsApi } = require("vicops-api");
const { Readline } = require("easy-readline");
const utils = require("./utils");
const fs = require("fs");
let sr = new Readline();
let user = new vicopsApi();

const CFonts = require("cfonts");

CFonts.say("VICOPS|terminal v1.2.0", {
  font: "chrome",
  align: "center",
  gradient: ["green", "magenta"],
  transitionGradient: true,
  env: "node",
});

handle();

async function handle() {
  let resp = await sr.input("text", ">>> ");
  resp = resp.toLowerCase();

  if (resp === "регистрация") {
    user = new vicopsApi(
      await sr.input("text", "Введите логин: "),
      await sr.input("secure", "Введите пароль: ")
    );
    let response = await user.register(
      await sr.input("text", "Введите электронную почту для восстановления: ")
    );
    console.log(response);
  } else if (resp === "войти") {
    user = new vicopsApi(
      await sr.input("text", "Введите логин: "),
      await sr.input("secure", "Введите пароль: ")
    );
    let balances = (await user.getUser()).private;
    if (balances) balances = balances.balances;
    console.log("Активы:");
    if (balances) utils.printBal(balances);
    else console.log(await user.getUser());
  } else if (resp === "помощь") {
    utils.printHelp();
  } else if (resp === "баланс") {
    let balances = (await user.getUser()).private;
    if (balances) balances = balances.balances;
    if (balances) utils.printBal(balances);
    else console.log(await user.getUser());
  } else if (resp === "история") {
    let transactions = (await user.getUser()).private;
    if (transactions) transactions = transactions.transactions;
    if (transactions) utils.printTrans(transactions, user.name);
    else console.log(await user.getUser());
  } else if (resp === "транзакция") {
    let transaction = await user.transaction(
      await sr.input("text", "Получатель: "),
      Number(await sr.input("text", "Количество: ")),
      await sr.input("text", "Валюта: "),
      await sr.input("text", "Комментарий: ")
    );
    console.log(transaction);
  } else {
    utils.printHelp();
  }
  handle();
}
