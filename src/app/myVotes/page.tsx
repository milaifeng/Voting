"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatDistanceToNow, isPast } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus, Clock, BarChart3, Trash2, Eye, AlertCircle } from "lucide-react";
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

export default function MyPollsPage() {
  const { address, isConnected } = useAccount();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [error, setError] = useState("");

  // 1. 读取所有投票
  const { data: polls, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllPolls",
  }) as { data: Poll[] | undefined; isLoading: boolean };

  // 2. 结束投票
  const {
    writeContract,
    data: hash,
    isPending: endingPending,
  } = useContractWrite();
  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash });

  // 3. 过滤当前用户创建的投票
  const myPolls = useMemo(() => {
    if (!polls || !address) return [];
    return polls.filter(
      (p) => p.creator.toLowerCase() === address.toLowerCase()
    );
  }, [polls, address]);

  const handleEndPoll = async (pollId: bigint) => {
    if (!confirm("确定结束此投票？结束后的投票无法再投票！")) return;

    setDeletingId(pollId);
    setError("");

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "endPoll",
        args: [pollId],
      });
    } catch (err) {
      setError(`结束失败 ${err}`);
    }
  };

  // 成功后重置
  if (txSuccess) {
    setDeletingId(null);
  }

  if (!isConnected) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">
            请连接钱包查看你的提案
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载你的提案...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 + 创建按钮 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              我的提案
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              管理你创建的投票。当前地址：
              <span className="font-mono text-sm ml-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" /> 创建新提案
          </Link>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* 列表 */}
        {myPolls.length === 0 ? (
          <div className="text-center text-blue-600 py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <svg
              className="w-24 h-24 mx-auto mb-6 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              你还没有创建任何提案
            </p>
            <Link
              href="/create"
              className="text-blue-600 hover:underline font-medium"
            >
              立即创建第一个提案
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPolls.map((poll) => {
              const deadlineMs = Number(poll.deadline) * 1000;
              const isEnded = isPast(deadlineMs) || !poll.active;
              const timeLeft = formatDistanceToNow(deadlineMs, {
                addSuffix: true,
                locale: zhCN,
              });

              const isDeleting = deletingId === poll.id;

              return (
                <div
                  key={poll.id.toString()}
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
                      <BarChart3 className="w-4 h-4" />
                      {poll.totalVotes.toString()} 票
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {isEnded ? "已结束" : timeLeft}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/polls/${poll.id.toString()}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" /> 查看
                    </Link>
                    {!isEnded && (
                      <button
                        onClick={() => handleEndPoll(poll.id)}
                        disabled={isDeleting || endingPending || txLoading}
                        className={`px-4 py-2 rounded-lg transition flex items-center justify-center ${
                          isDeleting || endingPending || txLoading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {isDeleting || endingPending || txLoading ? (
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
                    )}
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
