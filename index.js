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

CFonts.say("VICOPS|terminal v2.0.1", {
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

  await printUserData();
}

async function printUserData() {
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

  if (r.data === "Баланс") {
    await printBalances();
  } else if (r.data === "История транзакций") {
    await history();
  } else if (r.data === "Информация пользователя") {
    await printUserData();
  } else if (r.data === "Перевод") {
    await transaction();
  } else if (r.data === "Создать новый счёт") {
    console.log("Сказал же скоро будет");
  } else if (r.data === "Войти") {
    await login();
  } else if (r.data === "Регистрация") {
    await register();
  }

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

async function printBalances() {
  let balances = await user.getBalances();
  if (balances.code != "denied") {
    utils.printBal(balances);
  } else {
    console.log(balances.msg.red);
  }
}

async function history() {
  let transactions = await user.getTransactions();
  if (transactions.code != "denied") {
    utils.printTrans(transactions, jwt.decode(user.jwt)._id);
  } else {
    console.log(transactions.msg.red);
  }
}

async function transaction() {
  const r = await prompts([
    {
      type: "text",
      name: "recipient_id",
      message: "Получатель(номер счета)",
    },
    {
      type: "number",
      name: "amount",
      min: 0,
      increment: 0.1,
      message: "Количество",
    },
    {
      type: "text",
      name: "currency_id",
      message: "Валюта",
    },
    {
      type: "text",
      name: "description",
      message: "Комментарий",
    },
    {
      type: "select",
      name: "type",
      choices: [
        {
          title: "Перевод",
          description: "Перевод с счета на счет",
          value: "transfer",
        },
        {
          title: "Эмиссия",
          value: "issue",
          description: "Доступно только для ЦБ",
        },
      ],
      message: "Тип транзакции",
    },
  ]);

  let userData = await user.getUser();

  let resp = await user.transaction(
    r.recipient_id,
    r.amount,
    r.currency_id,
    `${userData.name} ${userData.second_name[0]}.: "${r.description}"`,
    r.type
  );

  if (resp.code != "denied") {
    console.log("Перевод был выполнен".green);
  } else {
    console.log(resp.msg.red);
  }
}
