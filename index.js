#! /usr/bin/env node

const program = require('commander');
const pkg = require('./package.json')
const cheerio = require('cheerio')
const chalk = require("chalk");
const axios = require("axios");
const ora = require('ora');

program
  .version(pkg.version || "0.1.0")
  .option("-e --english <english>", "需要翻译的英文")
  .option("-c --chinese <chinese>", "需要翻译的中文")
  .option("[param]", "需要翻译的中文或者英文")
  .description('中英文互译')
  .action(function (env) {
    if (typeof env === "string") {
      if (/[\u4e00-\u9fa5]/.test(env)) {
        return handleChinese(env)
      } else {
        return handleEnglish(env)
      }
    }
    if (!env.english && !env.chinese) {
      console.error("请输入需要翻译的内容，参数：-e --english <english>；-c --chinese <chinese>；[param]")
      return
    }
    if (env.english) {
      return handleEnglish(env.english)
    }
    if (env.chinese) {
      return handleChinese(env.chinese)
    }

    let english = env.english
    let res;


  })

program.parse(process.argv)


function handleEnglish(english) {

  const spinner = ora('Loading...').start();

  axios(`http://dict.cn/${encodeURI(english)}`).then(res => {
    let html = res.data || ""
    let $ = cheerio.load(html, {
      decodeEntities: false
    })
    let chinese = $(".clearfix ul li").text().replace(/[\n\t]/g, "").trim()
    if (!chinese) {
      spinner.fail("抱歉，未找到要查询的单词翻译")
    } else {
      spinner.succeed("done")
      console.log("中文翻译：" + chalk.green(chinese))
    }
  }).catch(er => {
    spinner.fail("抱歉，未找到要查询的单词翻译")
  })
}

function handleChinese(chinese) {

  const spinner = ora('Loading...').start();

  axios(`http://dict.cn/${encodeURI(chinese)}`).then(res => {
    let html = res.data || ""
    let $ = cheerio.load(html, {
      decodeEntities: false
    })
    let englishs = []
    $(".cn ul").children().each((i, ele) => {
      englishs.push($(ele).text().replace(/[\n\t]/g, "").trim())
    })
    if (!englishs.length) {
      spinner.fail("抱歉，未找到要查询的单词翻译")
    } else {
      spinner.succeed("done")
      console.log("英文翻译：\n" + chalk.green(englishs.join("\n")))
    }
  }).catch(er => {
    spinner.fail("抱歉，未找到要查询的单词翻译")
  })
}