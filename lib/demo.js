const { input, select } = require("@inquirer/prompts");
const path = require("path");
const fs = require("fs-extra");
const ejs = require("ejs");

(async function (name, options) {
  // 执行创建命令
  // 当前命令行选择的目录
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name);
  // 目录是否已经存在？
  if (fs.existsSync(targetAir)) {
    // 是否为强制创建？
    if (options.force) {
      await fs.remove(targetAir);
      console.log(`\r\nRemoved ${targetAir}`);
      await fs.emptyDir(targetAir);
      console.log(`\r\nGenerating project in ${targetAir}`);
    } else {
      // TODO：询问用户是否确定要覆盖
      const action = await input({
        message: `Target directory ${targetAir} already exists. Pick an action:`,
        choices: [
          {
            name: "Overwrite",
            value: "overwrite",
          },
          {
            name: "Cancel",
            value: false,
          },
        ],
      });
      if (!action) {
        return;
      } else if (action === "overwrite") {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`);
        await fs.remove(targetAir);
      }
    }
  } else {
    console.log(`\r\nGenerating project in ${targetAir}`);
  }

  const myData = {
    name: name,
    project: "",
    template: "",
    branch: "",
  };

  myData.project = await input({
    message: "Enter your name",
    project: "Enter project name",
  });
  myData.template = await select({
    message: "Select a template",
    choices: [
      { name: "Vue App", value: "vue-app" },
      { name: "Node APP", value: "node-app" },
      { name: "React App", value: "react-app" },
    ],
  });

  const nodeBranch = async function () {
    console.log("Node APP");
  };

  const reactBranch = async function () {
    console.log("React APP");
  };

  const vueBranch = async function () {
    return await select({
      message: "Select a template",
      choices: [
        { name: "vue3-router-pinia-js", value: "vue3-router-pinia" },
        { name: "vue3-ts-tsx", value: "vue3-ts-tsx" },
        { name: "vue3-router-pinia-ts", value: "vue3-ts" },
        { name: "vue3-ts-tsx", value: "vue3-ts-tsx" },
      ],
    });
  };

  switch (myData.template) {
    case "vue-app":
      myData.branch = await vueBranch();
      break;
    case "node-app":
      await nodeBranch();
      break;
    case "react-app":
      await reactBranch();
      break;
    default:
      break;
  }
  //   https://api.github.com/orgs/dongdongSpuer/repos
  // 读取模板文件
  const cwdUrl = process.cwd();
  const templatePath = path.join(__dirname, "template");
  const files = fs.readdirSync(templatePath);
  // 查找模板文件
  files.forEach((file) => {
    if (file == myData.template) {
      const branchPath = path.resolve(templatePath, file);
      // 查找需要的分支
      const branchFiles = fs.readdirSync(branchPath);

      branchFiles.forEach((branchFile) => {
        if (branchFile == myData.branch) {
          const resPath = path.resolve(branchPath, branchFile);
          ejs.renderFile(resPath, myData).then((data) => {
            // fs.writeFileSync(resPath,data)
            console.log(data);
          });
        }
      });
    }
  });
})();
