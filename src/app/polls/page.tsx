"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useReadContract, useReadContracts } from "wagmi";
import { formatDistanceToNow, isPast } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus, Clock, BarChart3, Search } from "lucide-react";
import votingADD from "@/contract/deployment-info.json";
const CONTRACT_ADDRESS = votingADD.contract as `0x${string}`;
const ABI = [
  {
    inputs: [],
    name: "getAllPolls",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string[]", name: "options", type: "string[]" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "totalVotes", type: "uint256" },
          { internalType: "bool", name: "active", type: "bool" },
        ],
        internalType: "struct Voting.Poll[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
    name: "getOptionVotes",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
interface Poll {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  options: string[];
  deadline: bigint;
  totalVotes: bigint;
  active: boolean;
}

export default function PollsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // 1. 读取所有投票
  const { data: polls, isLoading: loadingPolls } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllPolls",
    chainId: 11155111,
  });

  // 2. 批量读取每个投票的票数
  const pollIds = polls ? (polls as Poll[]).map((p) => p.id) : [];
  const { data: votesData } = useReadContracts({
    contracts: pollIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "getOptionVotes",
      args: [id],
      chainId: 11155111,
    })),
    query: {
      enabled: pollIds.length > 0,
    },
  });

  // 3. 组合数据
  const enrichedPolls = useMemo(() => {
    if (!polls || !votesData) return [];
    return (polls as Poll[]).map((poll, i) => ({
      ...poll,
      optionVotes: votesData[i].result || [],
    }));
  }, [polls, votesData]);

  // 4. 搜索 + 过滤 + 排序
  const filteredPolls = useMemo(() => {
    let filtered = [...enrichedPolls];

    const now = new Date().getTime();

    // 搜索
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态
    if (filterStatus === "active") {
      filtered = filtered.filter(
        (p) => Number(p.deadline) * 1000 > now && p.active
      );
    } else if (filterStatus === "ended") {
      filtered = filtered.filter(
        (p) => Number(p.deadline) * 1000 <= now || !p.active
      );
    }

    // 排序
    if (sortBy === "latest") {
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (sortBy === "votes") {
      filtered.sort((a, b) => Number(b.totalVotes) - Number(a.totalVotes));
    } else if (sortBy === "ending") {
      filtered.sort((a, b) => Number(a.deadline) - Number(b.deadline));
    }

    return filtered;
  }, [enrichedPolls, searchTerm, filterStatus, sortBy]);

  if (loadingPolls) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载投票列表...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 + 创建按钮 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            所有投票提案
          </h1>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" /> 创建新投票
          </Link>
        </div>

        {/* 搜索 + 过滤 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索标题或描述..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="all">所有状态</option>
              <option value="active">进行中</option>
              <option value="ended">已结束</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="latest">最新创建</option>
              <option value="votes">最多投票</option>
              <option value="ending">即将结束</option>
            </select>
          </div>
        </div>

        {/* 投票列表 */}
        {filteredPolls.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "没有匹配的投票"
                : "暂无投票提案"}
            </p>
            <Link
              href="/create"
              className="text-blue-600 hover:underline font-medium"
            >
              立即创建第一个投票
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => {
              const deadlineMs = Number(poll.deadline) * 1000;
              const isEnded = isPast(deadlineMs) || !poll.active;
              const timeLeft = formatDistanceToNow(deadlineMs, {
                addSuffix: true,
                locale: zhCN,
              });

              // 计算领先进度
              const maxVotes =
                poll.optionVotes.length > 0
                  ? Math.max(...poll.optionVotes.map((v) => Number(v)))
                  : 0;
              const progress =
                poll.totalVotes > 0
                  ? (maxVotes / Number(poll.totalVotes)) * 100
                  : 0;

              return (
                <Link
                  key={poll.id.toString()}
                  href={`/polls/${poll.id.toString()}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {poll.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {poll.description}
                    </p>

                    {/* 领先进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>领先选项</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 元数据 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {poll.totalVotes.toString()} 票
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {isEnded ? "已结束" : timeLeft}
                      </span>
                    </div>

                    {/* 状态标签 */}
                    <div className="mt-4">
                      {isEnded ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-full text-xs font-medium">
                          已结束
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full text-xs font-medium">
                          进行中
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
