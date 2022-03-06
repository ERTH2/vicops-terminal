const colors = require("colors");
const { vicopsApi } = require("vicops-api");
const { Readline } = require("easy-readline");
const utils = require("./utils");
const fs = require("fs");
const path = require("path");
let sr = new Readline();

const LocalStorage = require("node-localstorage").LocalStorage;

const tpath = path.join(process.env.APPDATA, "vicopsTerm");

if (!fs.existsSync(tpath)) {
  fs.mkdirSync(tpath);
}

let ls = new LocalStorage(tpath);

const CFonts = require("cfonts");

CFonts.say("VICOPS|terminal v1.2.0", {
  font: "chrome",
  align: "center",
  gradient: ["green", "magenta"],
  transitionGradient: true,
  env: "node",
});

let user;

login();
handle();

async function handle() {
  let resp = await sr.input("text", ">>> ");
  resp = resp.toLowerCase();

  if (resp === "регистрация") {
    let ulogin = await sr.input("text", "Введите логин: ");
    let fpass = await sr.input("secure", "Введите пароль: ");
    let spass = await sr.input("secure", "Введите пароль еще раз: ");
    if (spass === fpass) {
      user = new vicopsApi(ulogin, fpass);
      let response = await user.register(
        await sr.input("text", "Введите электронную почту для восстановления: ")
      );
      console.log(response);
      ls.setItem("login", ulogin);
      ls.setItem("password", fpass);
    } else console.log("Пароли не совпадают".red);
  } else if (resp === "войти") {
    let ulogin = await sr.input("text", "Введите логин: ");
    let pass = await sr.input("secure", "Введите пароль: ");
    user = new vicopsApi(ulogin, pass);
    await balances();
    ls.setItem("login", ulogin);
    ls.setItem("password", pass);
  } else if (resp === "помощь") {
    utils.printHelp();
  } else if (resp === "баланс") {
    await balances();
  } else if (resp === "история") {
    await history();
  } else if (resp === "транзакция") {
    await transaction();
  } else {
    utils.printHelp();
  }
  handle();
}

async function login() {
  if (ls.getItem("login")) {
    user = new vicopsApi(ls.getItem("login"), ls.getItem("password"));
    console.log("Вы вошли автоматически!".green);
  } else {
    console.log("Войдите или зарегистрируйтесь (напишите помощь).".red);
  }
}

async function balances() {
  let balances = (await user.getUser()).private;
  if (balances) balances = balances.balances;
  if (balances) utils.printBal(balances);
  else console.log(await user.getUser());
}

async function history() {
  let transactions = (await user.getUser()).private;
  if (transactions) transactions = transactions.transactions;
  if (transactions) utils.printTrans(transactions, user.name);
  else console.log(await user.getUser());
}

async function transaction() {
  let transaction = await user.transaction(
    await sr.input("text", "Получатель: "),
    Number(await sr.input("text", "Количество: ")),
    await sr.input("text", "Валюта: "),
    await sr.input("text", "Комментарий: ")
  );
  console.log(transaction);
}
