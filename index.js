const { vicopsApi } = require("vicops-api");
const { Readline } = require("easy-readline");
const utils = require("./utils");
const fs = require("fs");
let sr = new Readline();
let user = new vicopsApi();
handle();

async function handle(){
    let resp = await sr.input("text", ">>> ");
    resp = resp.toLowerCase();

    if(resp==="регистрация"){
        user = new vicopsApi(await sr.input("text", "Введите логин: "), await sr.input("secure", "Введите пароль: "));
        user.register(await sr.input("text", "Введите электронную почту для восстановления: "));
    } else if(resp==="войти"){
        user = new vicopsApi(await sr.input("text", "Введите логин: "), await sr.input("secure", "Введите пароль: "));
        let balances = (await user.getUser())?.private?.balances;
        console.log("Активы:")
        if(balances) utils.printBal(balances);
        else console.log(await user.getUser());
    } else if(resp==="помощь") {
        utils.printHelp();
    } else if(resp==="баланс"){
        let balances = (await user.getUser())?.private?.balances;
        if(balances) utils.printBal(balances);
        else console.log(await user.getUser());
    } else if(resp==="история"){
        let balances = (await user.getUser())?.private?.transactions;
        if(balances) utils.printTrans(balances, user.name);
        else console.log(await user.getUser());
    } else if(resp==="транзакция"){
        let transaction = await user.transaction(await sr.input("text", "Получатель: "), Number(await sr.input("text", "Количество: ")), await sr.input("text", "Валюта: "), await sr.input("text", "Комментарий: "));
        console.log(transaction);
    } else if(resp==="курс"){
        let name = await sr.input("text", "Название котировки: ");
        console.log("Курс ")
    }
    handle();
}