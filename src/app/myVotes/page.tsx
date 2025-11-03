"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { Plus, Clock, BarChart3, Edit3, Trash2, Eye } from "lucide-react";

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

export default function MyPollsPage() {
  const { address, isConnected } = useAccount();
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 加载用户创建的投票
  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    try {
      const polls: Poll[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      const userPolls = polls.filter(
        (p: Poll) => p.creator.toLowerCase() === address.toLowerCase()
      );
      setMyPolls(userPolls);
    } catch (err) {
      console.error("加载失败", err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  // 删除投票（模拟）
  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此投票？操作不可逆！")) return;

    setDeletingId(id);
    try {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const polls: Poll[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      const updated = polls.filter((p: Poll) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // 删除相关票数
      const votes = JSON.parse(localStorage.getItem("mock_votes") || "{}");
      delete votes[id];
      localStorage.setItem("mock_votes", JSON.stringify(votes));

      // 删除用户投票记录
      const userVotes = JSON.parse(localStorage.getItem("user_votes") || "{}");
      delete userVotes[id];
      localStorage.setItem("user_votes", JSON.stringify(userVotes));

      setMyPolls(myPolls.filter((p) => p.id !== id));
    } catch (err) {
      alert("删除失败，请重试");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">请连接钱包查看你的提案</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载你的提案...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 + 创建按钮 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              我的提案
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              管理你创建的投票。当前地址：{address?.slice(0, 6)}...
              {address?.slice(-4)}
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" /> 创建新提案
          </Link>
        </div>

        {/* 列表 */}
        {myPolls.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              你还没有创建任何提案
            </p>
            <Link
              href="/create"
              className="text-blue-600 hover:underline font-medium"
            >
              立即创建第一个提案 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPolls.map((poll) => {
              const isEnded = Date.now() > poll.deadline;
              const timeLeft = formatDistanceToNow(poll.deadline, {
                addSuffix: true,
              });

              return (
                <div
                  key={poll.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold line-clamp-2 flex-1 mr-2">
                      {poll.title}
                    </h3>
                    {isEnded ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-full text-xs font-medium">
                        已结束
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-full text-xs font-medium">
                        进行中
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {poll.description}
                  </p>

                  {/* 统计 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" /> {poll.totalVotes} 票
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />{" "}
                      {isEnded ? "已结束" : timeLeft}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/polls/${poll.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Eye className="w-4 h-4" /> 查看
                    </Link>
                    {!isEnded && (
                      <Link
                        href={`/edit/${poll.id}`} // 后续实现编辑页
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                      >
                        <Edit3 className="w-4 h-4" /> 编辑
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(poll.id)}
                      disabled={deletingId === poll.id}
                      className={`px-4 py-2 rounded-lg transition ${
                        deletingId === poll.id
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {deletingId === poll.id ? (
                        <svg
                          className="animate-spin w-5 h-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
