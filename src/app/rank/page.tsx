// app/rank/page.tsx - 排行页
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns"; // npm install date-fns
import {
  Trophy,
  Medal,
  Award,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const STORAGE_KEY = "mock_polls";
const VOTES_KEY = "mock_votes"; // 选项级票数
const USER_VOTES_KEY = "user_votes"; // 用户投票记录 { pollId: optionIndex }

interface UserVote {
  address: string; // 模拟用户地址
  votes: number; // 总投票数
  polls: number; // 参与投票数
}

interface Poll {
  id: string;
  title: string;
  creator: string;
  totalVotes: number;
  deadline: number;
}

export default function RankPage() {
  const [userRanks, setUserRanks] = useState<UserVote[]>([]);
  const [pollRanks, setPollRanks] = useState<Poll[]>([]);
  const [activeTab, setActiveTab] = useState("users"); // users 或 polls
  const [timeFilter, setTimeFilter] = useState("all"); // all, week, month
  const [loading, setLoading] = useState(true);

  // 模拟用户地址（实际用 wagmi useAccount）
  const mockUsers = [
    "0x1234...5678",
    "0xabcd...efgh",
    "0x9876...5432",
    "0xdead...beef",
    "0xcafe...babe",
  ];

  // 计算排行
  useEffect(() => {
    const calculateRanks = () => {
      try {
        // 加载所有投票
        const polls: Poll[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );
        const optionVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
        const userVotes = JSON.parse(
          localStorage.getItem(USER_VOTES_KEY) || "{}"
        );

        // 用户排行：模拟每个用户投票次数
        const userMap = new Map<string, UserVote>();
        mockUsers.forEach((addr) => {
          userMap.set(addr, { address: addr, votes: 0, polls: 0 });
        });

        // 遍历用户投票记录
        Object.entries(userVotes).forEach(([pollId, optionIndex]) => {
          const poll = polls.find((p: Poll) => p.id === pollId);
          if (!poll) return;

          // 模拟随机用户（实际用真实地址）
          const randomUser =
            mockUsers[Math.floor(Math.random() * mockUsers.length)];
          const user = userMap.get(randomUser)!;
          user.votes += 1;
          user.polls += 1;
        });

        // 额外模拟投票
        polls.forEach((poll: Poll) => {
          const votes = optionVotes[poll.id] || [];
          votes.forEach((voteCount: number) => {
            if (voteCount > 0) {
              const randomUser =
                mockUsers[Math.floor(Math.random() * mockUsers.length)];
              const user = userMap.get(randomUser)!;
              user.votes += voteCount; // 简化
            }
          });
        });

        const userList = Array.from(userMap.values())
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 10); // Top 10

        // 投票排行：按 totalVotes 降序
        const pollList = polls
          .sort((a: Poll, b: Poll) => b.totalVotes - a.totalVotes)
          .slice(0, 10);

        setUserRanks(userList);
        setPollRanks(pollList);
      } catch (err) {
        console.error("排行计算失败", err);
      } finally {
        setLoading(false);
      }
    };

    calculateRanks();
  }, [timeFilter]);

  const getMedal = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (index === 2) return <Award className="w-8 h-8 text-orange-600" />;
    return (
      <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载排行榜...</div>
      </div>
    );
  }

  return (
    <div className=" w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            社区排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            查看最活跃用户和热门投票。模拟模式基于本地数据。
          </p>
        </div>

        {/* Tab + 过滤 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === "users"
                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                用户排行
              </button>
              <button
                onClick={() => setActiveTab("polls")}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === "polls"
                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                投票排行
              </button>
            </div>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
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
              <p className="text-center text-gray-500 py-16">暂无用户数据</p>
            ) : (
              userRanks.map((user, i) => (
                <div
                  key={user.address}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center">{getMedal(i)}</div>
                    <div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {user.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        参与 {user.polls} 个投票
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {user.votes}
                    </p>
                    <p className="text-sm text-gray-500">总票数</p>
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
                  key={poll.id}
                  href={`/polls/${poll.id}`}
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
                      <BarChart3 className="w-4 h-4" /> {poll.totalVotes} 票
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />{" "}
                      {format(poll.deadline, "MM/dd")}
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
