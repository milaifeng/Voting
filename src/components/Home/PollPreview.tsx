"use client";
import Link from "next/link";

// 模拟数据（实际用 useContractRead 获取）
const mockPolls = [
  {
    id: 1,
    title: "最佳前端框架？",
    options: ["React", "Vue"],
    votes: [120, 80],
    deadline: "2 天后结束",
  },
  {
    id: 2,
    title: "下一个功能优先级？",
    options: ["NFT 奖励", "多签"],
    votes: [90, 110],
    deadline: "5 天后结束",
  },
  {
    id: 3,
    title: "社区治理提案",
    options: ["同意", "反对"],
    votes: [150, 50],
    deadline: "已结束",
  },
];

export default function PollPreview() {
  return (
    <section className="py-12 px-6 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        热门提案
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {mockPolls.map((poll) => {
          const total = poll.votes.reduce((a, b) => a + b, 0);
          return (
            <div
              key={poll.id}
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">{poll.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{poll.deadline}</p>
              {poll.options.map((opt, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>{opt}</span>
                    <span>
                      {poll.votes[i]} 票 (
                      {total ? Math.round((poll.votes[i] / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
              <Link
                href={`/polls/${poll.id}`}
                className="block mt-4 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                查看详情 & 投票
              </Link>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/polls"
          className="text-blue-600 font-semibold hover:underline"
        >
          查看更多提案 →
        </Link>
      </div>
    </section>
  );
}
