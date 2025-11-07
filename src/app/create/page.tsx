"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Plus, Trash2, Clock, Users, CheckCircle } from "lucide-react";
import { Interface } from "ethers";
import { format } from "date-fns";
import votingABI from "@/contract/Voting.json";
import votingADD from "@/contract/deployment-info.json";

const CONTRACT_ADDRESS = votingADD.contract as `0x${string}`;
const ABI = votingABI.abi;
interface Option {
  id: string;
  text: string;
}

export default function CreatePollPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const {
    writeContract,
    data: hash,
    isPending: writePending,
    error: writeError,
  } = useWriteContract();
  const {
    isLoading: txLoading,
    isSuccess: txSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [durationDays, setDurationDays] = useState("7"); // 默认 7 天
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [optionIdCounter, setOptionIdCounter] = useState(3);
  const hasNavigatedRef = useRef(false);
  useEffect(() => {
    if (!txSuccess || !receipt || hasNavigatedRef.current) return;

    try {
      const iface = new Interface(ABI);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "PollCreated") {
            const id = parsed.args.id.toString();
            hasNavigatedRef.current = true; // 标记已处理

            // 异步跳转，避免同步 state 更新
            setTimeout(() => {
              router.push(`/polls/${id}`);
            }, 2000);
            return;
          }
        } catch {}
      }
    } catch (e) {
      console.error("事件解析失败", e);
    }
  }, [txSuccess, receipt, router]);
  // 添加选项
  const addOption = () => {
    if (options.length >= 10) {
      setError("最多支持 10 个选项");
      return;
    }
    const newId = optionIdCounter.toString();
    setOptionIdCounter((prev) => prev + 1);
    setOptions((prev) => [...prev, { id: newId, text: "" }]);
  };

  // 删除选项
  const removeOption = (id: string) => {
    if (options.length <= 2) {
      setError("至少需要 2 个选项");
      return;
    }
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  // 更新选项文本
  const updateOption = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  // 表单验证
  const validate = () => {
    if (!title.trim()) return "请填写投票标题";
    if (!description.trim()) return "请填写投票描述";
    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) return "请至少填写 2 个有效选项";
    if (options.some((opt) => opt.text.trim().length > 100))
      return "每个选项不超过 100 字符";
    return null;
  };

  // 创建投票
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected || !address) {
      setError("请先连接钱包");
      setIsSubmitting(false);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const validOptions = options.map((opt) => opt.text.trim()).filter(Boolean);
    const durationMinutes = parseInt(durationDays) * 24 * 60;

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "createPoll",
        args: [title, description, validOptions, BigInt(durationMinutes)],
      });
    } catch {
      setError("交易拒绝或失败");
    }
  };
  // 计算截止时间预览
  const previewDeadline = useMemo(() => {
    if (!durationDays) return "";
    const days = parseInt(durationDays) || 0;
    if (days <= 0) return "无效时长";
    const now = new Date().getTime();
    const date = now + days * 24 * 60 * 60 * 1000;
    return format(new Date(date), "yyyy年MM月dd日 HH:mm");
  }, [durationDays]);

  return (
    <div className="w-full py-8 bg-gray-50 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">创建新投票</h1>
          <p className="text-gray-600">
            填写信息，发布去中心化投票。数据永久存储在以太坊 Sepolia 测试网。
          </p>
          <div className="mt-4 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm font-mono">合约: {CONTRACT_ADDRESS}</p>
            <p className="text-xs mt-1">
              <a
                href="https://sepolia.etherscan.io/address/0x9b361B1f1Caf68A7517928C3450e2EF1dEEBc05b"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                etherscan 查看（已验证）
              </a>
            </p>
          </div>
        </div>
        {/* 表单卡片 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white  rounded-2xl shadow-xl p-8"
        >
          {/* 标题输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700  mb-2">
              投票标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：最佳前端框架是？"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
              required
            />
            <p className="text-sm text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* 描述输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700  mb-2">
              投票描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细说明投票背景、规则等..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent  resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {description.length}/500
            </p>
          </div>

          {/* 投票选项 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 ">
                投票选项 <span className="text-red-500">*</span> (至少 2 个)
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> 添加选项
              </button>
            </div>
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {index + 1}、
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    placeholder={`选项 ${index + 1}`}
                    maxLength={100}
                    className="flex-1 px-4 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={index < 2}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(opt.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 投票时长 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700  mb-2">
              投票时长 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["1", "3", "7", "30"].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDurationDays(days)}
                  className={`py-3 px-4 rounded-lg border transition ${
                    durationDays === days
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white  border-gray-300  hover:border-blue-500"
                  }`}
                >
                  {days} 天
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 ">
              <Clock className="w-4 h-4" />
              <span>截止时间预览：{previewDeadline}</span>
            </div>
          </div>

          {/* 钱包状态 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900 ">
                {isConnected
                  ? `创建者：${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "请连接钱包后创建"}
              </p>
            </div>
          </div>

          {/* 错误提示 */}
          {(error || writeError) && (
            <div className="mb-6 p-4 bg-red-50  border border-red-200  rounded-lg text-red-700">
              {error || writeError?.message}
            </div>
          )}
          {writePending && (
            <div className="mb-6 p-4 bg-yellow-50  border border-yellow-200 rounded-lg text-yellow-700 ">
              等待钱包确认...
            </div>
          )}
          {txLoading && hash && (
            <div className="mb-6 p-4 bg-blue-50  border border-blue-200  rounded-lg text-blue-700 ">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                交易打包中...
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  查看
                </a>
              </div>
            </div>
          )}
          {txSuccess && (
            <div className="mb-6 p-4 bg-green-50  border border-green-200  rounded-lg text-green-700 ">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                创建成功！2 秒后跳转详情...
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={writePending || txLoading || !isConnected}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition ${
                isSubmitting || !isConnected
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
            >
              {writePending
                ? "等待确认..."
                : txLoading
                ? "链上处理中..."
                : "发布投票"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 border border-gray-300  rounded-lg font-medium hover:bg-gray-50 transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
