// lib/Generator.js

const path = require("path");
const ora = require("ora");
const { input, select } = require("@inquirer/prompts");
const util = require("util");
const chalk = require("chalk");
const downloadGitRepo = require("download-git-repo"); // 不支持 Promise

const { getRepoList, getTagList } = require("./http");
// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("Request failed, refetch ...");
  }
}

const log = console.log;

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, "waiting fetch template");
    if (!repoList) return;
    // 2）用户选择自己新下载的模板名称
    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => ({
      name: item.name,
      value: item.name,
    }));
    const repo = await select({
      name: "repo",
      choices: [...repos],
      message: "Please choose a template to create project",
    });

    // 返回模块名字
    return repo;
  }

  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    log(chalk.yellow("repo", repo));
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);
    if (!tags) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map((item) => {
      return {
        name: item.name,
        value: item.name,
      };
    });
    const tag = await select({
      name: "tag",
      choices: [...tagsList],
      message: "Please choose a tag to create project",
    });

    return tag;
  }

  async download(repo, tag) {
    // 1）拼接下载地址
    const requestUrl = `direct:https://github.com/dongdongSpuer/${repo}${
      tag ? "#" + tag : ""
    }`;

    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      "waiting download template", // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir),
      {
        clone: true,
      }
    ); // 参数2: 创建位置
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create() {
    // 1）获取模板名称
    const repo = await this.getRepo();

    // 2) 获取 tag 名称
    const tag = await this.getTag(repo);
    // 3）下载模板到模板目录
    await this.download(repo, tag);

    console.log("用户选择了，repo=" + repo);
  }
}

module.exports = Generator;
