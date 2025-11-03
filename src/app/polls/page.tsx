"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, Clock, BarChart3, Search } from "lucide-react";
const STORAGE_KEY = "mock_polls";

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  deadline: number;
  creator: string;
  totalVotes: number;
}

export default function PollsListPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, ended
  const [sortBy, setSortBy] = useState("latest"); // latest, votes, ending
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const loadPolls = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : [];
        setPolls(data);
        setFilteredPolls(data);
      } catch (err) {
        console.error("加载失败", err);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, []);

  // 搜索 + 过滤 + 排序
  useEffect(() => {
    let filtered = [...polls];

    // 搜索标题/描述
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    const now = Date.now();
    if (filterStatus === "active") {
      filtered = filtered.filter((p) => p.deadline > now);
    } else if (filterStatus === "ended") {
      filtered = filtered.filter((p) => p.deadline <= now);
    }

    // 排序
    if (sortBy === "latest") {
      filtered.sort((a, b) => Number(b.id) - Number(a.id)); // id 是 timestamp
    } else if (sortBy === "votes") {
      filtered.sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sortBy === "ending") {
      filtered.sort((a, b) => a.deadline - b.deadline);
    }

    setFilteredPolls(filtered);
  }, [polls, searchTerm, filterStatus, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            {/* 搜索 */}
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

            {/* 状态过滤 */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="all">所有状态</option>
              <option value="active">进行中</option>
              <option value="ended">已结束</option>
            </select>

            {/* 排序 */}
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

        {/* 列表 */}
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
              立即创建第一个投票 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => {
              const isEnded = Date.now() > poll.deadline;
              const timeLeft = formatDistanceToNow(poll.deadline, {
                addSuffix: true,
              });
              const progress =
                poll.options.length > 0
                  ? (Math.max(
                      ...(JSON.parse(
                        localStorage.getItem("mock_votes") || "{}"
                      )[poll.id] || [])
                    ) /
                      (poll.totalVotes || 1)) *
                    100
                  : 0;

              return (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {poll.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {poll.description}
                    </p>

                    {/* 进度条（领先选项） */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>领先进度</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 元数据 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" /> {poll.totalVotes} 票
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />{" "}
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
