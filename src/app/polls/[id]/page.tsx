"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Clock, User, BarChart3, CheckCircle } from "lucide-react";

const STORAGE_KEY = "mock_polls";
const VOTES_KEY = "mock_votes"; // 存储用户投票记录 { pollId: optionIndex }

interface Option {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  deadline: number;
  creator: string;
  totalVotes: number;
  userVotes?: number[]; // 模拟每个选项票数
}

export default function PollDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null); // 用户已投选项索引
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState<number[]>([]); // 实时票数

  // 加载投票数据
  useEffect(() => {
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const foundPoll = polls.find((p: Poll) => p.id === id);
    if (!foundPoll) {
      setError("投票不存在或已删除");
      return;
    }

    // 初始化票数（模拟均匀分布或从存储）
    const storedVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
    console.log(storedVotes);
    const pollVotes =
      storedVotes[id] || Array(foundPoll.options.length).fill(0);
    foundPoll.userVotes = pollVotes;
    foundPoll.totalVotes = pollVotes.reduce((a: number, b: number) => a + b, 0);

    setPoll(foundPoll);
    setVotes(pollVotes);

    // 检查用户是否已投
    const userVotes = JSON.parse(localStorage.getItem("user_votes") || "{}");
    setUserVote(userVotes[id] ?? null);
  }, [id]);

  // 模拟投票
  const handleVote = async (optionIndex: number) => {
    if (!poll || userVote !== null) return;
    if (Date.now() > poll.deadline) {
      setError("投票已结束");
      return;
    }

    setIsVoting(true);
    setSelectedOption(optionIndex);

    try {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 更新本地票数
      const newVotes = [...votes];
      newVotes[optionIndex]++;
      setVotes(newVotes);

      // 更新 totalVotes
      const updatedPoll = { ...poll, totalVotes: poll.totalVotes + 1 };
      updatedPoll.userVotes = newVotes;
      setPoll(updatedPoll);

      // 保存到 localStorage
      const polls = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const index = polls.findIndex((p: Poll) => p.id === id);
      polls[index] = updatedPoll;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));

      // 保存选项级票数
      const storedVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
      storedVotes[id] = newVotes;
      localStorage.setItem(VOTES_KEY, JSON.stringify(storedVotes));

      // 记录用户投票
      const userVotes = JSON.parse(localStorage.getItem("user_votes") || "{}");
      userVotes[id] = optionIndex;
      localStorage.setItem("user_votes", JSON.stringify(userVotes));

      setUserVote(optionIndex);
    } catch (err) {
      setError("投票失败，请重试");
    } finally {
      setIsVoting(false);
    }
  };

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <button
            onClick={() => router.push("/polls")}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← 返回列表
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  const isEnded = Date.now() > poll.deadline;
  const timeLeft = formatDistanceToNow(poll.deadline, { addSuffix: true });
  const chartData = poll.options.map((opt, i) => ({
    name: opt,
    value: votes[i] || 0,
    percentage: poll.totalVotes
      ? Math.round((votes[i] / poll.totalVotes) * 100)
      : 0,
  }));

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回 + 标题 */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/polls")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" /> 返回投票列表
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {poll.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {poll.creator.slice(0, 6)}...
              {poll.creator.slice(-4)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{" "}
              {isEnded ? "已结束" : `剩余 ${timeLeft}`}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" /> {poll.totalVotes} 票
            </span>
          </div>
        </div>

        {/* 描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">投票描述</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {poll.description}
          </p>
        </div>

        {/* 图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">投票结果</h2>
          {poll.totalVotes === 0 ? (
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEnded
              ? "投票已结束"
              : userVote !== null
              ? "你已投票"
              : "选择选项并投票"}
          </h2>
          <div className="space-y-4">
            {poll.options.map((opt, i) => {
              const percentage = poll.totalVotes
                ? Math.round((votes[i] / poll.totalVotes) * 100)
                : 0;
              const isUserVoted = userVote === i;

              return (
                <div
                  key={i}
                  className={`border rounded-lg p-4 transition ${
                    isUserVoted
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium">{opt}</span>
                      {isUserVoted && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {votes[i]} 票 ({percentage}%)
                    </span>
                  </div>

                  {/* 进度条 */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* 投票按钮 */}
                  {!isEnded && userVote === null && (
                    <button
                      onClick={() => handleVote(i)}
                      disabled={isVoting && selectedOption === i}
                      className={`mt-3 px-4 py-2 rounded-lg font-medium transition ${
                        isVoting && selectedOption === i
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isVoting && selectedOption === i
                        ? "投票中..."
                        : "投这一票"}
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
          {userVote !== null && !isEnded && (
            <p className="mt-6 text-center text-green-600 font-medium">
              你已投票给：{poll.options[userVote]}
            </p>
          )}
          {error && <p className="mt-6 text-center text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
