# 去中心化投票系统
一个基于**Ethereum Sepolia 测试网** 的 **链上投票系统**，支持创建、投票、查看结果、查看用户影响力等功能。

🔗 **在线体验**:[https://your-dapp.vercel.app](https://your-dapp.vercel.app)   
📄 **合约地址**:`0x9b361B1f1Caf68A7517928C3450e2EF1dEEBc05b` (Sepolia)   
📊 **区块浏览器**：[Sepolia Etherscan](https://sepolia.etherscan.io/address/0x9b361B1f1Caf68A7517928C3450e2EF1dEEBc05b) (已验证)   

---

## 功能介绍
| 功能 | 说明 |
|:------:|:------:|
| 创建投票 | 设置标题、描述、选项、截止时间|
| 参与投票 | 连接钱包，一人一票|
| 查看结果 | 实时饼图 + 票数统计|
| 我的提案 | 查看和管理自己创建的投票|
| 社区排行 | 查看活跃用户 & 最热投票 |

---
## 技术栈
| 层级 | 技术|
|:------:|:------:|
| 前端 | Nextjs, React, Tailwind CSS,TypeScript|
| 链上交互| wagmi, viem, RainbowKit |
| 智能合约| Solidity, Hardhat|

---

## 项目结构

├── public/&emsp;&emsp;&emsp;&emsp;&emsp;#静态资源   
├── app/ &emsp;&emsp;&emsp;&emsp;&emsp;# Next.js 页面   
│   ├── create/ &emsp;&emsp;&emsp;# 创建投票   
│   ├── myVotes/ &emsp;&emsp;&emsp;# 我的提案   
│   ├── polls/[id]/&emsp;&emsp;&emsp;# 全部提案以及提案详情   
│   └── rank/&emsp;&emsp;&emsp;# 社区排行   
├── components/&emsp;&emsp;&emsp;# 通用组件   
├── contracts/    
│   ├── Voting.sol&emsp;&emsp;&emsp; #Solidity合约   
│   ├── Voting.json&emsp;&emsp;&emsp;#合约ABI   
│   └── deployment-info.json &emsp; #部署信息           
│
└──lib/ &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; #wagmi配置   

---

## 快速开始

#### 1.克隆项目
```bash
git clone https://github.com/milaifeng/Voting.git
cd Voting
```
#### 2.安装依赖
```bash
yarn install
```

#### 3.启动服务
```bash
yarn dev
```
