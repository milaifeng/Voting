"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatDistanceToNow, isPast } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowLeft, Clock, User, BarChart3, CheckCircle } from "lucide-react";
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

export default function PollDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const pollId = BigInt(id as string);

  // 1. 读取投票详情
  const { data: pollData, isLoading: loadingPoll } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getPoll",
    args: [pollId],
  });

  // 2. 读取选项票数
  const { data: votesDataRaw, isLoading: loadingVotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getOptionVotes",
    args: [pollId],
  });
  const votesData = votesDataRaw as readonly bigint[] | undefined;
  // 3. 读取用户是否已投（使用 hasVoted）
  const { data: hasUserVotedRaw, refetch: refetchHasVoted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "hasVoted",
    args: [pollId, address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address,
    },
  });
  const hasUserVoted = hasUserVotedRaw as boolean | undefined;

  // 4. 投票
  const {
    writeContract,
    data: hash,
    isPending: votingPending,
  } = useWriteContract();
  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({ hash });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState("");

  const poll: Poll | undefined = pollData as Poll | undefined;
  const votes = useMemo(() => {
    return votesData ? votesData.map((v) => Number(v)) : [];
  }, [votesData]);

  const isEnded: boolean = poll
    ? isPast(Number(poll.deadline) * 1000) || !poll.active
    : false;
  const timeLeft = poll
    ? formatDistanceToNow(Number(poll.deadline) * 1000, {
        addSuffix: true,
        locale: zhCN,
      })
    : "";

  const chartData = useMemo(() => {
    if (!poll || votes.length === 0) return [];
    return poll.options.map((opt, i) => ({
      name: opt,
      value: votes[i] || 0,
      percentage:
        poll.totalVotes > 0
          ? Math.round((votes[i] / Number(poll.totalVotes)) * 100)
          : 0,
    }));
  }, [poll, votes]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const handleVote = async (optionIndex: number) => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return;
    }
    if (isEnded) {
      setError("投票已结束");
      return;
    }
    if (hasUserVoted) {
      setError("你已投过票");
      return;
    }

    setSelectedOption(optionIndex);
    setError("");

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "vote",
        args: [pollId, BigInt(optionIndex)],
      });
    } catch (err) {
      setError(`投票失败 ${err}`);
    }
  };

  // 投票成功后刷新 hasVoted
  useEffect(() => {
    if (txSuccess) {
      refetchHasVoted();
      setSelectedOption(null);
    }
  }, [txSuccess, refetchHasVoted]);

  if (loadingPoll || loadingVotes) {
    return (
      <div className="w-full h-96 bg-gray-50  flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="w-full h-96 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">投票不存在</p>
          <button
            onClick={() => router.push("/polls")}
            className="mt-4 text-blue-600 hover:underline"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50  py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回 + 标题 */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/polls")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" /> 返回投票列表
          </button>
          <h1 className="text-3xl font-bold text-gray-900 ">{poll.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 ">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {poll.creator.slice(0, 6)}...
              {poll.creator.slice(-4)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{" "}
              {isEnded ? "已结束" : `剩余 ${timeLeft}`}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" /> {poll.totalVotes.toString()} 票
            </span>
          </div>
        </div>

        {/* 描述 */}
        <div className="bg-white  rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">投票描述</h2>
          <p className="text-gray-700  whitespace-pre-wrap">
            {poll.description}
          </p>
        </div>

        {/* 图表 */}
        <div className="bg-white  rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">投票结果</h2>
          {Number(poll.totalVotes) === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无投票</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} 票`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 投票选项 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEnded
              ? "投票已结束"
              : hasUserVoted
              ? "你已投票"
              : "选择选项并投票"}
          </h2>
          <div className="space-y-4">
            {poll.options.map((opt, i) => {
              const percentage =
                poll.totalVotes > 0
                  ? Math.round((votes[i] / Number(poll.totalVotes)) * 100)
                  : 0;

              return (
                <div
                  key={i}
                  className={`border rounded-lg p-4 transition ${
                    hasUserVoted
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 "
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium">{opt}</span>
                      {hasUserVoted && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {votes[i]} 票 ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-linear-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* 投票按钮 */}
                  {!isEnded && !hasUserVoted && (
                    <button
                      onClick={() => handleVote(i)}
                      disabled={votingPending || txLoading}
                      className={`mt-3 px-4 py-2 rounded-lg font-medium transition ${
                        votingPending || txLoading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {votingPending || txLoading ? "投票中..." : "投这一票"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 状态提示 */}
          {isEnded && (
            <p className="mt-6 text-center text-red-600 font-medium">
              投票已结束，无法再投
            </p>
          )}
          {hasUserVoted && !isEnded && (
            <p className="mt-6 text-center text-green-600 font-medium">
              你已参与投票
            </p>
          )}
          {error && <p className="mt-6 text-center text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
