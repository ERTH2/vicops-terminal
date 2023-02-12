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

CFonts.say("VICOPS|terminal v2.3.0-alpha-use", {
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
  switch (r.data) {
    case "Баланс":
      await printBalances();
      break;
    case "История транзакций":
      await history();
      break;
    case "Информация пользователя":
      await printUserData();
      break;
    case "Перевод":
      await transaction();
      break;
    case "Продать":
      await placeOrder();
      break;
    case "Купить":
      await buyOrder();
      break;
    case "Создать новый счёт":
      console.log("Сказал же скоро будет");
      break;
    case "Существующие валюты":
      await printAllCurrencies();
      break;
    case "Войти":
      await login();
      break;
    case "Регистрация":
      await register();
      break;
    case "Выйти":
      process.exit();
    default:
      console.log("Неизвестная команда");
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

async function printAllCurrencies() {
  let currencies = await user.getCurrencies();
  if (currencies.code != "denied") {
    utils.printCurrencies(currencies);
  } else {
    console.log(currencies.msg.red);
  }
}

//function to place order in exchange
async function placeOrder() {
  let currencies = await user.getCurrencies();
  currencies = currencies.map((curr) => {
    return {
      title: `${curr._id} - ${curr.name}`,
      value: curr._id,
      description: curr.description,
    };
  });

  const r = await prompts([
    {
      type: "select",
      name: "sell_currency_id",
      message: "Идентификатор продавемого ресурса",
      choices: currencies,
    },
    {
      type: "select",
      name: "buy_currency_id",
      message: "Идентификатор покупаемого ресурса",
      choices: currencies,
    },
    {
      type: "number",
      name: "sell_amount",
      message: "Количество продаваемого ресурса",
      increment: 0.001,
    },
    {
      type: "number",
      name: "buy_amount",
      message: "Количество покупаемого ресурса",
      increment: 0.001,
    },
  ]);

  let resp = await user.placeOrder(
    r.buy_currency_id,
    r.sell_currency_id,
    r.buy_amount,
    r.sell_amount
  );

  if (resp.code !== "denied") {
    console.log("Заявка на продажу выставлена");
  } else {
    console.log(resp.msg.red);
  }
}

//function to buy order
async function buyOrder() {
  let orders = await user.getOrders();
  orders = orders.map((order) => {
    return {
      title: `Продажа ${order.sell_amount} ${order.sell_currency_id} за ${order.buy_amount} ${order.buy_currency_id}`,
      value: order._id,
      description: `1 ${order.buy_currency_id} = ${
        order.sell_amount / order.buy_amount
      } ${order.sell_currency_id} \n1 ${order.sell_currency_id} = ${
        order.buy_amount / order.sell_amount
      } ${order.buy_currency_id}`,
    };
  });

  const r = await prompts([
    {
      type: "select",
      name: "order_id",
      message: "Идентификатор заявки",
      choices: orders,
    },
  ]);

  let resp = await user.buyOrder(r.order_id);
  if (resp.code !== "denied") {
    console.log("Заявка куплена");
  } else {
    console.log(resp.msg.red);
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
      increment: 0.001,
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

  if (resp.code !== "denied") {
    console.log("Перевод был выполнен".green);
  } else {
    console.log(resp.msg.red);
  }
}
