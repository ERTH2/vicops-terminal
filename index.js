const colors = require("colors");
const { vicopsApi } = require("vicops-api");
const utils = require("./utils");
const fs = require("fs");
const path = require("path");

const prompts = require("prompts");
const jwt = require("jsonwebtoken");

const LocalStorage = require("node-localstorage").LocalStorage;

const tpath = path.join(process.env.APPDATA, "vicops2term");

if (!fs.existsSync(tpath)) {
  fs.mkdirSync(tpath);
}

const pr = require("./propmts.json");

let ls = new LocalStorage(tpath);

const CFonts = require("cfonts");

CFonts.say("VICOPS|terminal v2.0.0", {
  font: "chrome",
  align: "center",
  gradient: ["green", "magenta"],
  transitionGradient: true,
  env: "node",
});

(async () => {
  await auth();
  await handle();
})();

let user = new vicopsApi();

async function auth() {
  let users = getUsers();
  if (users.length !== 0) {
    const response = await prompts({
      type: "select",
      name: "user_name",
      message: "Выберите пользователя для входа",
      choices: users,
    });

    let jwtT = ls.getItem(users[response.user_name]);

    if (jwt.decode(jwtT).exp < Date.now() / 1000) {
      console.log("Токен истек вам нужно войти снова");
      login();
    } else {
      user.connectJwt(jwtT);
    }
    console.log("Вы вошли автоматически!".green, "\n");
  } else {
    console.log("Пользователей не найдено, войдите или зарегистрируйтесь.".red);

    const response = await prompts({
      type: "select",
      name: "method",
      message: "",
      choices: ["Войти", "Зарегистрироваться"],
    });

    if (response.method === 0) {
      await login();
    } else {
      await register();
    }
  }

  let userData = await user.getUser();
  utils.printUserData(userData);
}

function getUsers() {
  let users = ls.getItem("users");
  if (!users) {
    users = "[]";
    ls.setItem("users", users);
  }
  return JSON.parse(users);
}

async function handle() {
  const r = await prompts({
    type: "autocomplete",
    name: "data",
    message: "",
    choices: pr.commands,
  });

  console.log(r.data);

  handle();
}

async function login() {
  const r = await prompts([
    {
      type: "text",
      name: "_id",
      message: "Введите ваш id в vicops",
    },
    {
      type: "password",
      name: "pass",
      message: "Введите пароль",
    },
  ]);

  let resp = await user.login(r._id, r.pass);
  if (resp.code === "denied") {
    console.log(resp.msg);
    await login();
    return;
  }

  await addUser(resp);
}

async function addUser(resp) {
  let userData = await user.getUser();
  let users = getUsers();
  let username = `${userData.name}.${userData.second_name}.${userData._id}`;

  users.push(username);
  ls.setItem("users", JSON.stringify(users));
  ls.setItem(username, resp.token);
}

async function register() {
  const r = await prompts([
    {
      type: "text",
      name: "name",
      message: "Имя",
    },
    {
      type: "text",
      name: "second_name",
      message: "Фамилия",
    },
    {
      type: "text",
      name: "country",
      message: "Страна",
    },
    {
      type: "select",
      name: "type",
      choices: [
        {
          title: "Гражданин",
          description: "Простой гражданин страны",
          value: "citizen",
        },
        { title: "Компания", value: "company" },
        { title: "Центральный Банк", value: "cb" },
      ],
      message: "Тип пользователя",
    },
    {
      type: "text",
      name: "contact",
      message: "Ваши контакты (вк, почта, телеграмм)",
    },
    {
      type: "password",
      name: "fpass",
      message: "Введите пароль",
    },
    {
      type: "password",
      name: "spass",
      message: "Введите пароль еще раз",
    },
  ]);

  if (r.spass === r.fpass) {
    let resp = await user.register(
      r.name,
      r.second_name,
      r.fpass,
      r.country,
      r.type,
      r.contact
    );

    if (resp.code === "denied") {
      console.log(resp.msg);
      await register();
      return;
    } else {
      await addUser(resp);
    }
  } else {
    console.log("Пароли не совпадают".red);
    await register();
    return;
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

async function transaction(emission) {
  if (emission === true) {
    let transaction = await user.transaction(
      await sr.input("text", "Получатель: "),
      Number(await sr.input("text", "Количество: ")),
      (
        await user.getUser()
      ).type,
      await sr.input("text", "Комментарий: "),
      "emission-t"
    );
    console.log(transaction);
  } else {
    let transaction = await user.transaction(
      await sr.input("text", "Получатель: "),
      Number(await sr.input("text", "Количество: ")),
      await sr.input("text", "Валюта: "),
      await sr.input("text", "Комментарий: ")
    );
    console.log(transaction);
  }
}
