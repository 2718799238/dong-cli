// lib/http.js

// 通过 axios 处理请求
const { default: axios } = require("axios");

axios.interceptors.response.use((res) => {
  return res.data;
});
// https://api.github.com/orgs/dongdongSpuer/repos
/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get("https://api.github.com/orgs/dongdongSpuer/repos");
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTagList(repo) {
  return axios.get(`https://api.github.com/repos/dongdongSpuer/${repo}/tags`);
}

module.exports = {
  getRepoList,
  getTagList,
};
