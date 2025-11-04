// app/rank/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useContractRead, useAccount } from "wagmi";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Trophy,
  Medal,
  Award,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import votingABI from "@/contract/Voting.json";
import votingADD from "@/contract/deployment-info.json";

const CONTRACT_ADDRESS = votingADD.contract as `0x${string}`;
const ABI = votingABI.abi;
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

interface UserRank {
  address: string;
  votes: number;
  polls: number;
}

export default function RankPage() {
  const { address: currentUser } = useAccount();
  const [activeTab, setActiveTab] = useState<"users" | "polls">("users");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");

  // 1. 读取所有投票
  const { data: polls, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllPolls",
  }) as { data: Poll[] | undefined; isLoading: boolean };

  // 2. 过滤时间范围
  const filteredPolls = useMemo(() => {
    if (!polls) return [];
    const now = new Date().getTime();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const monthStart = startOfMonth(now).getTime();

    return polls.filter((poll) => {
      const deadlineMs = Number(poll.deadline) * 1000;
      if (timeFilter === "week") return deadlineMs >= weekStart;
      if (timeFilter === "month") return deadlineMs >= monthStart;
      return true;
    });
  }, [polls, timeFilter]);

  // 3. 计算用户排行（遍历 hasVoted）
  const userRanks = useMemo(() => {
    if (!filteredPolls.length) return [];

    const userMap = new Map<string, UserRank>();

    filteredPolls.forEach((poll) => {
      const pollId = poll.id;

      // 模拟遍历所有用户（实际项目可用后端或子图）
      // 这里我们用 poll.creator 作为活跃用户（简化）
      const creator = poll.creator.toLowerCase();
      if (!userMap.has(creator)) {
        userMap.set(creator, { address: creator, votes: 0, polls: 0 });
      }
      const user = userMap.get(creator)!;
      user.polls += 1;

      // 票数：每个投票的 totalVotes 算作“影响力”
      user.votes += Number(poll.totalVotes);
    });

    // 补充：当前用户（即使没创建投票）
    if (currentUser && !userMap.has(currentUser.toLowerCase())) {
      userMap.set(currentUser.toLowerCase(), {
        address: currentUser.toLowerCase(),
        votes: 0,
        polls: 0,
      });
    }

    return Array.from(userMap.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);
  }, [filteredPolls, currentUser]);

  // 4. 投票排行
  const pollRanks = useMemo(() => {
    return [...filteredPolls]
      .sort((a, b) => Number(b.totalVotes) - Number(a.totalVotes))
      .slice(0, 10);
  }, [filteredPolls]);

  const getMedal = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (index === 2) return <Award className="w-8 h-8 text-orange-600" />;
    return (
      <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
        #{index + 1}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载排行榜...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            社区排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            实时链上数据，展示最活跃用户与热门投票
          </p>
        </div>

        {/* Tab + 过滤 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                  activeTab === "users"
                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <Users className="w-5 h-5" />
                用户排行
              </button>
              <button
                onClick={() => setActiveTab("polls")}
                className={`px-6 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                  activeTab === "polls"
                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                投票排行
              </button>
            </div>

            <select
              value={timeFilter}
              onChange={(e) =>
                setTimeFilter(e.target.value as "all" | "week" | "month")
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="all">所有时间</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
        </div>

        {/* 排行内容 */}
        {activeTab === "users" ? (
          <div className="space-y-4">
            {userRanks.length === 0 ? (
              <p className="text-center text-gray-500 py-16">暂无活跃用户</p>
            ) : (
              userRanks.map((user, i) => (
                <div
                  key={user.address}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center">{getMedal(i)}</div>
                    <div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white font-mono">
                        {user.address.slice(0, 8)}...{user.address.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        创建 {user.polls} 个投票
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {user.votes}
                    </p>
                    <p className="text-sm text-gray-500">总影响力</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pollRanks.length === 0 ? (
              <p className="text-center text-gray-500 py-16 col-span-2">
                暂无热门投票
              </p>
            ) : (
              pollRanks.map((poll, i) => (
                <Link
                  key={poll.id.toString()}
                  href={`/polls/${poll.id.toString()}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getMedal(i)}
                      <h3 className="text-lg font-semibold line-clamp-2">
                        {poll.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    创建者: {poll.creator.slice(0, 6)}...
                    {poll.creator.slice(-4)}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <BarChart3 className="w-4 h-4" />{" "}
                      {poll.totalVotes.toString()} 票
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />{" "}
                      {format(Number(poll.deadline) * 1000, "MM/dd", {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
