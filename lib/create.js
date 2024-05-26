const { input, select } = require("@inquirer/prompts");
const path = require("path");
const fs = require("fs-extra");
const Generator = require("./generator");
module.exports = async function (name, options) {
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
    } else {
      // TODO：询问用户是否确定要覆盖
      const action = await select({
        message: "Target dir already exists Pick an action:",
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
  // 创建项目
  const generator = new Generator(name, targetAir);

  generator.create();
};
