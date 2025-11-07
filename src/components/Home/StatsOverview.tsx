"use client";
import CountUp from "react-countup";

export default function StatsOverview() {
  // 模拟数据
  const totalVotes = 12345;
  const activePolls = 28;
  const users = 5678;
  const topReward = "10 ETH";

  return (
    <section className="py-12 px-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 ">
        平台数据一览
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <p className="text-4xl font-bold text-blue-600">
            <CountUp end={totalVotes} duration={2.5} />
          </p>
          <p className="text-gray-600 ">总投票数</p>
        </div>
        <div className="bg-white  p-6 rounded-xl shadow-lg text-center">
          <p className="text-4xl font-bold text-green-600">
            <CountUp end={activePolls} duration={2.5} />
          </p>
          <p className="text-gray-600 ">活跃提案</p>
        </div>
        <div className="bg-white  p-6 rounded-xl shadow-lg text-center">
          <p className="text-4xl font-bold text-purple-600">
            <CountUp end={users} duration={2.5} />
          </p>
          <p className="text-gray-600 ">社区用户</p>
        </div>
        <div className="bg-white  p-6 rounded-xl shadow-lg text-center">
          <p className="text-4xl font-bold text-yellow-600">{topReward}</p>
          <p className="text-gray-600 ">本周冠军奖励</p>
        </div>
      </div>
    </section>
  );
}
